import cartModel from '../models/cartModel.js';
import userMosel from '../models/userMosel.js';
import { isValid } from '../util/validator.js';
import mongoose from 'mongoose'
import productModel from '../models/productModel.js';
const ObjectId = mongoose.Types.ObjectId


//======================================createCart =============================================>
const createCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        //console.log(userId)
        const data = req.body;

        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Request Body can't be empty" })

        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "User id should be a valid mongoose Object Id" })

        const userExist = await userMosel.findOne({ _id: userId })
        if (!userExist) return res.status(404).send({ status: false, message: "No user found for this userId" })

        const { productId, cartId } = data

        if (!isValid(productId)) return res.status(400).send({ status: false, messsage: "Product Id is required" })
        if (!ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "Product id should be a valid mongoose Object Id" })

        const productExist = await productModel.findOne({ _id: productId })
        if (!productExist) return res.status(404).send({ status: false, message: "No product available for this product Id" })

        if (productExist.isDeleted === true) return res.status(400).send({ status: false, message: "This product is no longer available" })

        if (cartId) {
            if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Please enter a valid cart Id" })
            if (!ObjectId.isValid(cartId)) return res.status(400).send({ status: false, message: "Cart id should be a valid monggose Object Id" })

            var cartExist = await cartModel.findOne({ _id: cartId })
            if (!cartExist) return res.status(404).send({ status: false, message: "Cart not found for this given cartId" })
        }
        //console.log(cartExist)

        let checkCartForUser = await cartModel.findOne({ userId: userId })//If the cart for userId exist and we don't provide the cart id in request body.
        if (checkCartForUser && !cartId) return res.status(400).send({ status: false, message: "Cart for this user is present,please provide cart Id" })

        if (cartExist) {
            //console.log(cartExist.userId,userId)
            if (cartExist.userId != userId) return res.status(400).send({ status: false, message: "Cart doesn't belong to the user logged in" })

            let productArray = cartExist.items
            let totPrice = (cartExist.totalPrice + productExist.price)
            let pId = productExist._id.toString()
            for (let i = 0; i < productArray.length; i++) {
                let produtInCart = productArray[i].productId.toString()

                if (pId === produtInCart) {
                    let newQuantity = productArray[i].quantity + 1
                    productArray[i].quantity = newQuantity
                    cartExist.totalPrice = totPrice
                    await cartExist.save()
                    let response = await cartModel.findOne({ userId: userId }).populate('items.productId', { __v: 0, _id: 0, isDeleted: 0, createdAt: 0, deletedAt: 0, currencyId: 0, currencyFormat: 0, updatedAt: 0, availableSizes: 0 })
                    return res.status(200).send({ status: true, message: "Success", data: response })
                }

            }
            cartExist.items.push({ productId: productId, quantity: 1 })
            cartExist.totalPrice = cartExist.totalPrice + productExist.price
            cartExist.totalItems = cartExist.items.length
            await cartExist.save()
            let response = await cartModel.findOne({ userId: userId }).populate('items.productId', { __v: 0, _id: 0, isDeleted: 0, createdAt: 0, deletedAt: 0, currencyId: 0, currencyFormat: 0, updatedAt: 0, availableSizes: 0 })
            return res.status(200).send({ status: true, message: "Success", data: response })

        }
        let obj = {  //creation of cart for first time
            userId: userId,
            items: [{
                productId: productId,
                quantity: 1
            }],
            totalPrice: productExist.price
        }
        obj['totalItems'] = obj.items.length
        let result = await cartModel.create(obj)
        return res.status(201).send({ status: true, message: "Cart created successfully", data: result })

    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}

//======================================updateCart=============================================>
const updateCart = async (req, res) => {
    try {
        let userId = req.params.userId;
        let data = req.body
        let { productId, cartId, removeProduct } = req.body

        // ---------checking data in request body----------
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Please provide deatila to update the documents" });
        }

        // ------------- user validation -------------------
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "user id is not valid" })
        }

        //------------ find user in user collection --------------
        const validUser = await userMosel.findById(userId);
        if (!validUser) {
            return res.status(404).send({ status: false, message: "User not present" })
        }


        //--------------- cart validation ---------------------
        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, message: "Please enter cart id" })
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "cart id is not valid" })
        }

        //----------------- find cartID in cart collection --------------
        const findCart = await cartModel.findOne({ _id: cartId, userId: userId });
        if (!findCart) {
            return res.status(404).send({ status: false, message: "Cart not present" })
        }


        //------------------- product validation ------------------------
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "Please enter product id" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "product id is not valid" })
        }

        //--------------------find productId in product collection------------
        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!findProduct) {
            return res.status(404).send({ status: false, message: "Product not present" })
        }

        let items = findCart.items
        let productArr = items.filter(x => x.productId.toString() == productId)

        if (productArr.length == 0) {
            return res.status(404).send({ status: false, message: "Product is not present in cart" })
        }

        let index = items.indexOf(productArr[0])

        //-------------- removeProduct validation -----------------------
        if (!isValid(removeProduct)) {
            return res.status(400).send({ status: false, message: "plz enter removeProduct" })
        }

        if (removeProduct != 1 && removeProduct != 0) {
            return res.status(400).send({ status: false, message: "Value of Removed Product Must be 0 or 1." })
        }

        if (removeProduct == 0) {
            findCart.totalPrice = (findCart.totalPrice - (findProduct.price * findCart.items[index].quantity)).toFixed(2)

            findCart.items.splice(index, 1)

            findCart.totalItems = findCart.items.length

            findCart.save()

        }

        if (removeProduct == 1) {
            findCart.items[index].quantity -= 1
            findCart.totalPrice = (findCart.totalPrice - findProduct.price).toFixed(2)

            if (findCart.items[index].quantity == 0) {
                findCart.items.splice(index, 1)
            }
            findCart.totalItems = findCart.items.length
            findCart.save()
        }
        return res.status(200).send({ status: true, message: "Success", data: findCart })

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================getCart=============================================>
const getCart = async (req, res) => {
    try {
        let userId = req.params.userId;

        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "User id should be a valid type mongoose object Id" })

        let userExist = await userMosel.findById(userId)
        if (!userExist) return res.status(404).send({ status: false, message: "User not found for the given user Id" })

        let searchCart = await cartModel.findOne({ userId: userId }).populate('items.productId', { title: 1, productImage: 1, price: 1 })

        if (!searchCart) return res.status(404).send({ status: false, message: "Cart not found for the given userId" })

        return res.status(200).send({ status: true, message: "Success", data: searchCart })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================deleteCart=============================================>
const deleteCart = async (req, res) => {
    try {

        let userId = req.params.userId;

        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "User id should be a valid type mongoose object Id" })

        let userExist = await userMosel.findById(userId)
        if (!userExist) return res.status(404).send({ status: false, message: "User not found for the given user Id" })

        let findCart = await cartModel.findOne({ userId: userId })
        if (!findCart) return res.status(404).send({ status: false, message: "Cart not found for the given userId" })

        if (findCart.totalItems == 0) return res.status(400).send({ status: false, message: "Cart is empty as already products are deleted" })

        //let cartId = findCart._id
        let makeCartEmpty = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })

        return res.status(200).send({ status: false, message: "Cart emptied successfully", data: makeCartEmpty })

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createCart, updateCart, getCart, deleteCart };
