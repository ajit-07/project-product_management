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
        const data = req.body;

        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Request Body can't be empty" })

        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "User id should be a valid mongoose Object Id" })

        const userExist = await userMosel.findOne({ _id: userId })
        if (!userExist) return res.status(404).send({ status: false, message: "No user found for this userId" })

        const { productId, cartId } = data

        if (!isValid(productId)) return res.status(400).send({ status: false, messsage: "Product Id is required" })

        const productExist = await productModel.findOne({ _id: productId })
        if (!productExist) return res.status(404).send({ status: false, message: "No product available for this product Id" })

        if (productExist.isDeleted === true) return res.status(400).send({ status: false, message: "This product is no longer available" })

        if (cartId) {
            if (!isValid(cartId)) return res.status(400).send({ status: false, message: "Please enter a valid cart Id" })
            if (!ObjectId.isValid(cartId)) return res.status(400).send({ status: false, message: "Cart id should be a valid monggose Object Id" })

            var cartExist = await cartModel.findOne({ _id: cartId })
            if (!cartExist) return res.status(404).send({ status: false, message: "Cart not found for this given cartId" })
        }
        console.log(cartExist)

        let checkCartForUser = await cartModel.findOne({ userId: userId })//If the cart for userId exist and we don't provide the cart id in request body.
        if (checkCartForUser && !cartId) return res.status(400).send({ status: false, message: "Cart for this user is present,please provide cart Id" })

        if (cartExist) {
            if (cartExist.userId.toString() !== userId) return res.status(400).send({ status: false, message: "Cart doesn't belong to the user logged in" })

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
                    return res.status(200).send({ status: true, message: "Success", data: cartExist })
                }

            }
            cartExist.items.push({ productId: productId, quantity: 1 })
            cartExist.totalPrice = cartExist.totalPrice + productExist.price
            cartExist.totalItems = cartExist.items.length
            await cartExist.save()
            return res.status(200).send({ status: true, message: "Success", data: cartExist })

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

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================getCart=============================================>
const getCart = async (req, res) => {
    try {
        // let userId = req.params.userId

        // let findCart = await cartModel.findOne({ userId }).select({ createdAt: 0, updatedAt: 0 }).populate('items.productId', { __v: 0, _id: 0, isDeleted: 0, createdAt: 0, deletedAt: 0, currencyId: 0, currencyFormat: 0, updatedAt: 0, availableSizes: 0 })
        // if (!findCart) return res.status(404).send({ status: false, message: 'no such cart found for this user' })

        // if (findCart.items.length == 0) return res.status(200).send({ status: true, message: 'Cart empty', data: findCart })

        // res.status(200).send({ status: true, message: 'Success', data: findCart })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================deleteCart=============================================>
const deleteCart = async (req, res) => {
    try {
        // let userId = req.params.userId

        // let findCart = await cartModel.findOne({ userId })
        // if (!findCart) return res.status(404).send({ status: false, message: 'no such cart found for this user' })

        // if (findCart.totalItems == 0) return res.status(404).send({ status: false, message: 'Item already daleted' })
        // const deleteCart = await cartModel.findOneAndUpdate({ _id: findCart._id }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })

        // res.status(204).send({ status: true, message: 'successfully deleted', data: deleteCart })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createCart, updateCart, getCart, deleteCart };
