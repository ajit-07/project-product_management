import orderModel from '../models/orderModel.js';
import { } from '../util/validator.js';


//======================================createOrder=============================================>
const createOrder = async (req, res) => {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================updateOrder=============================================>
const updateOrder = async (req, res) => {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createOrder, updateOrder }
