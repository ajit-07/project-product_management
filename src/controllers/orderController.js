import orderModel from '../models/orderModel.js';
import { isValidField, isBoolean } from '../util/validator.js';
import userModel from '../models/userMosel.js';
import cartModel from '../models/cartModel.js';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;



//======================================createOrder=============================================>
const createOrder = async (req, res) => {
    try {
        let userId = req.params.userId
        let data = req.body

        let { cancellable, ...rest } = data

        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "user id is should be valid mongoose Object Id" })

        let userExist = await userModel.findById(userId);
        if (!userExist) return res.status(404).send({ status: false, message: "User not found for the given userId" })


        let findCart = await cartModel.findOne({ userId: userId }).lean()
        if (!findCart) return res.status(404).send({ status: false, message: "cart not found for the given user" })

        if (findCart.items.length === 0) return res.status(400).send({ status: false, message: "Please add products into cart to place order" })

        if (cancellable) {
            if (!isBoolean(cancellable)) return res.status(400).send({ status: false, message: "please enter true or false" })
        }
        findCart['cancellable'] = cancellable;

        let totalQuantity = 0;
        findCart.items.forEach((p) => (totalQuantity += p.quantity))
        findCart['totalQuantity'] = totalQuantity;

        let saveOrder = await orderModel.create(findCart)

        cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 })

        return res.status(201).send({ status: true, message: "Success", data: saveOrder })

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================updateOrder=============================================>
const updateOrder = async (req, res) => {
    try {
        let userId = req.params.userId;
        let data = req.body;

        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "user id is should be valid mongoose Object Id" })

        const userExist = await userModel.findById(userId);
        if (!userExist) return res.status(404).send({ status: false, message: "User not found for the given userId" })

        let { orderId, status, ...rest } = data;

        if (!isValidField(orderId)) return res.status(400).send({ status: false, message: "Please enter order Id" })

        if (!ObjectId.isValid(orderId)) return res.status(400).send({ status: false, message: "Order Id should a valid mongoose Object Id " })

        let orderExist = await orderModel.findOne({ _id: orderId, userId: userId, isDeleted: false })
        if (!orderExist) return res.status(404).send({ status: false, message: "Order not found" })

        if (orderExist.status === "completed" || orderExist.status === "cancelled") return res.status(400).send({ status: false, message: `Your order has already been ${orderExist.status}` })

        let enumArray = ["pending", "completed", "cancelled"]
        if (!enumArray.includes(status.trim())) return res.status(400).send({ status: false, message: `Value of status must be among from ${enumArray.join(",")}` })

        if (status === "pending") return res.status(400).send({ status: false, message: "By default status is already pending.Please enter a different status" })

        if (status === "cancelled" && orderExist.cancellable === false) return res.status(400).send({ status: false, message: "You cannot cancel this order" })

        let updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true })

        return res.status(200).send({ status: true, message: "Success", data: updatedOrder })

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createOrder, updateOrder }
