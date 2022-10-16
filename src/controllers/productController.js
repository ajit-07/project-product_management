import productModel from '../models/productModel.js';
import { isValidObjectId, isValid, isValidPrice, isBoolean } from '../util/validator.js';
import getSymbolFromCurrency from 'currency-symbol-map'
import { uploadFile } from '../aws/aws.js';



/*
title, description
price
currencyId
currencyFormat
productImage
style
availableSizes
installments
*/


//======================================createProduct=============================================>
const createProduct = async (req, res) => {

    const file = req.files;
    const data = req.body;

    //------------------------------body validation--------------------------------->
    if (Object.keys(data).length === 0)
        return res.status(400).send({ status: false, message: `Please provide product details` });

    const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, ...extra } = data

    if (Object.keys(extra).length > 0) return res.status(400).send({ status: false, message: "Inavlid request body!!" })

    if (!isValid(title))
        return res.status(400).send({ status: false, message: `Title is required and should be a valid string.` })


    if (!isValid(description))
        return res.status(400).send({ status: false, message: `Description is required and should be a valid string.` })

    if (!isValidPrice(price))
        return res.status(400).send({ status: false, message: `Price is required and should be a valid price e.g(54,589.23,6726,etc).` })

    if (!isValid(currencyId))
        return res.status(400).send({ status: false, message: `Currency id is required and should be a valid string.` })

    if (currencyId !== 'INR')
        return res.status(400).send({ status: false, message: `NR should be the currency id.` })

    if (!currencyFormat) return res.status(400).send({ status: false, message: `Please enter valid Indian currency Id (INR) to get the currency format.` })
    if (currencyFormat != 'INR' && currencyFormat != '₹') return res.status(400).send({ status: false, message: "Please enter a valid currency id or currency format i.e 'INR' or '₹'" })
    const symbol = getSymbolFromCurrency('INR')
    data['currencyFormat'] = symbol
    console.log(symbol)

    if (isFreeShipping) {
        if (!isBoolean(isFreeShipping))
            return res.status(400).send({ status: false, message: "Is free Shipping value should be boolean" })
    }

    if (style) {
        if (!isValid(style))
            return res.status(400).send({ status: false, message: "Style should be a valid string" })
    }

    if (!isValid(availableSizes))
        return res.status(400).send({ status: false, message: "Please enter available sizes,it is required" })

    if (availableSizes) {
        let sizeArray = availableSizes.toUpperCase().split(',').map(x => x.trim())
        //console.log(sizeArray)
        for (let i = 0; i < sizeArray.length; i++) {
            if (!(["S", "XS", "M", "X", "L", "XL", "XXL"].includes(sizeArray[i]))) {
                return res.status(400).send({ status: false, message: `Please enter size from available sizes ["S","XS","M","X","L","XL","XXL"]` })
            }
        }
        data['availableSizes'] = [...new Set(sizeArray)] //to filter out duplicate values from the array
    }
    if (installments) {
        if (isNaN(Number(installments))) return res.status(400).send({ status: false, message: "Installments should be a valid number" })
    }

    //if (!(req.body.productImage)) return res.status(400).send({ status: false, message: "Product image is required" })

    if (!(file && file.length)) return res.status(400).send({ status: false, message: "No file found" })

    let uploadedFileUrl = await uploadFile(file[0])
    data['productImage'] = uploadedFileUrl

    const dupTitle = await productModel.findOne({ title })
    if (dupTitle)
        return res.status(400).send({ status: false, message: `This '${title}' is already in use` })

    const saveProduct = await productModel.create(data)
    return res.status(201).send({ status: true, message: "Product created successfully", data: saveProduct })

};


//======================================getProducts=============================================>
const getProducts = async (req, res) => {
    try {
        const data = req.query
        let { name, priceGreaterThan, priceLessThan, size, priceSort, ...rest } = data

        let searchObj = { isDeleted: false }

        if (Object.keys(data).length == 0) {
            const getAllProducts = await productModel.find(searchObj).sort({ price: 1 })
            return res.status(200).send({ status: true, message: "Success", count: getAllProducts.length, data: getAllProducts })
        }

        let filters
        priceSort = parseInt(priceSort)

        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: `you can't filter on ${Object.keys(rest)} key` })
        if (size) {
            size = size.toUpperCase().split(",")
            searchObj.availableSizes = { $in: size }
        }

        if (name) searchObj.title = { $regex: name.trim(), $options: 'i' }

        if (priceGreaterThan) searchObj.price = { $gt: priceGreaterThan }

        if (priceLessThan) searchObj.price = { $lt: priceLessThan }

        if (priceGreaterThan && priceLessThan) searchObj.price = { $gt: priceGreaterThan, $lt: priceLessThan }

        if (priceSort > 1 || priceSort < -1 || priceSort == 0) return res.status(400).send({ status: false, message: 'Please enter either 1 or -1 is priceSort' })
        if (priceSort) filters = { price: priceSort }

        const products = await productModel.find(searchObj).sort(filters)
        if (products.length == 0) return res.status(404).send({ status: false, message: 'No such product' })

        return res.status(200).send({ status: true, message: "Success", count: products.length, data: products })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================getProductById=============================================>
const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: ` '${productId}' this productId is invalid.` })

        const checkProduct = await productModel.findOne({ _id: productId })

        if (!checkProduct) return res.status(404).send({ status: false, message: `No product found with this ${productId}` })

        if (checkProduct.isDeleted === true) return res.status(400).send({ status: false, message: `This '${productId}' productId is already deleted.` })

        return res.status(200).send({ status: true, message: `Product details fetched successfully`, data: checkProduct })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================updateProduct=============================================>
const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId;
        if (!productId) return res.status(400).send({ status: false, message: "Product id is required in path params" })
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Product id should be valid mongoose type object Id" })

        const productExist = await productModel.findById({ _id: productId })
        if (!productExist) return res.status(404).send({ status: false, message: "Product details from given product id not found" })

        if (productExist.isDeleted === 'false') return res.status(400).send({ status: false, message: "Product is already deleted" })

        if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, message: "No data found to be updated,please enter data to update" })

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage, ...extra } = req.body

        if (Object.keys(extra).length > 0) return res.status(400).send({ status: false, message: "Inavlid request body!!" })

        let obj = {}

        if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is required and should be valid" })
            const dupTitle = await productModel.findOne({ title: title })
            if (dupTitle) return res.status(400).send({ status: false, message: "Title is already present in DB" })
            obj['title'] = title
        }
        if (description) {
            if (!isValid(description)) return res.status(400).send({ status: false, message: "Description is required and should be valid" })
            obj['description'] = description
        }
        if (price) {
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: `Price is required and should be a valid price e.g(54,589.23,6726,etc).` })
            obj['price'] = price
        }
        if (currencyId) {
            if (currencyId !== 'INR') return res.status(400).send({ status: false, message: `NR should be the currency id.` })
            obj['currencyId'] = currencyId
        }
        if (currencyFormat) {
            if (currencyFormat != 'INR' || currencyFormat != '₹') return res.status(400).send({ status: false, message: "Please enter a valid currency id or currency format i.e 'INR' or '₹'" })
            const symbol = getSymbolFromCurrency('INR')
            obj['currencyFormat'] = symbol
            console.log(symbol)
        }
        if (isFreeShipping) {
            if (!isBoolean(isFreeShipping)) return res.status(400).send({ status: false, message: "Is free Shipping value should be boolean" })
            obj['isFreeShipping'] = isFreeShipping
        }
        if (style) {
            if (!isValid(style)) return res.status(400).send({ status: false, message: "Style should be a valid string" })
            obj['style'] = style
        }
        if (installments) {
            if (isNaN(Number(installments))) return res.status(400).send({ status: false, message: "Installments should be a valid number" })
            obj['installments'] = installments
        }


        if (productImage) {
            let file = req.files
            if (!(file && file.length)) return res.status(400).send({ status: false, message: "No file found" })

            let uploadedFileUrl = await uploadFile(file[0])
            obj['productImage'] = uploadedFileUrl
        }
        obj = { $set: obj }
        if (availableSizes) {
            let sizeArray = availableSizes.toUpperCase().split(',').map(x => x.trim())
            //console.log(sizeArray)
            for (let i = 0; i < sizeArray.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XL", "XXL"].includes(sizeArray[i]))) {
                    return res.status(400).send({ status: false, message: `Please enter size from available sizes ["S","XS","M","X","L","XL","XXL"]` })
                }
            }
            obj['$addToSet'] = { availableSizes: sizeArray }
        }
        const updatedPro = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, obj, { new: true })
        return res.status(200).send({ status: true, message: "Product updated successfully!!", data: updatedPro })



    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================deleteProduct=============================================>
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: ` '${productId}' this productId is invalid.` })

        const checkProduct = await productModel.findOne({ _id: productId })

        if (!checkProduct) return res.status(404).send({ status: false, message: `No product found with this ${productId}` })

        if (checkProduct.isDeleted === true) return res.status(400).send({ status: false, message: ` This '${productId}' productId is already deleted.` })

        await productModel.findByIdAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: Date.now() });

        return res.status(200).send({ status: true, message: `Product successfully deleted.` })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createProduct, getProducts, getProductById, updateProduct, deleteProduct };




