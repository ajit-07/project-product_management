import productModel from '../models/productModel.js';
import { } from '../util/validator.js';



//======================================createProduct=============================================>
const createProduct = async (req, res) => {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================getProducts=============================================>
const getProducts = async (req, res) => {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================getProductById=============================================>
const getProductById = async (req, res) => {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================updateProduct=============================================>
const updateProduct = async (req, res) => {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================deleteProduct=============================================>
const deleteProduct = async (req, res) => {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
