import cartModel from '../models/cartModel.js';
import { } from '../util/validator.js';


//======================================createCart =============================================>
const createCart = async (req, res) => {
    try {

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

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================deleteCart=============================================>
const deleteCart = async (req, res) => {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createCart, updateCart, getCart, deleteCart };
