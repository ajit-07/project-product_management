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
        const { quantity, productId } = data;

        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Request body can'nt be empty" })

        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "User id is Invalid" })

        if (!isValid(productId)) return res.status(400).send({ status: false, message: "Product id is required and should be a valid string" })

        if (!ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "Product Id is invalid" })

        if (!isValid(quantity)) return res.status(400).send({ status: false, message: "Quantity is required" })
        if (isNaN(Number(quantity))) return res.status(400).send({ status: false, message: "Quantity should be a valid number" })
        if (Number(quantity) < 1) return res.status(400).send({ status: false, message: "Quantity shouldn't be less than one" })

        const userExist = await userMosel.findById({ _id: userId })
        if (!userExist) return res.status(404).send({ status: false, message: `No user found with this ${userId}` })

        const productExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExist) return res.status(404).send({ status: false, message: `No product found with this ${productId}` })

        const cartExist = await cartModel.findOne({ userId: userId })

        if (cartExist) {
            let price = cartExist.totalPrice + (quantity * productExist.price)

            let arrayOfItems = cartExist.items
            for (let i in arrayOfItems) {
                if (arrayOfItems[i].productId.toString() === productId) {
                    arrayOfItems[i].quantity += Number(quantity)

                    let updatedCart = { items: arrayOfItems, totalPrice: price, totalItems: arrayOfItems.length }
                    let response = await cartModel.findOneAndUpdate({ _id: cartExist._id }, updatedCart, { new: true })
                    return res.status(200).send({ status: true, message: "Product added in cart successfully", data: response })
                }
            }
            arrayOfItems.push({ productId: productId, quantity: quantity })
            let updatedCart = { items: arrayOfItems, totalPrice: price, totalItems: arrayOfItems.length }
            let response = await cartModel.findOneAndUpdate({ _id: cartExist._id }, updatedCart, { new: true })
            return res.status(200).send({ status: false, message: "Product added in cart successfully", data: response })



        } else {

            let cartData = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: quantity
                }],
                totalPrice: productExist.price * quantity,
                totalItems: 1
            }
            const saveCart = await cartModel.create(cartData)
            return res.status(201).send({ status: true, message: "cart created successfully", data: saveCart })
        }

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
};


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
