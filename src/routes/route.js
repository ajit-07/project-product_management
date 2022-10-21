import express from 'express';
const router = express.Router();
import { createUser, login, gateUser, updateUser } from '../controllers/userController.js';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js';
import { createCart, updateCart, getCart, deleteCart } from '../controllers/cartController.js';
import { createOrder, updateOrder } from '../controllers/orderController.js';
import {authenticate,authorization} from '../middleware/auth.js';


//--------------FEATURE I - User---------------->
router.post('/register', createUser);  //aj
router.post('/login', login);          //sa
router.post('/user/:userId/profile', authenticate,authorization, gateUser);  //shayan
router.put('/user/:userId/profile', authenticate,authorization ,updateUser);  //shayan

//-------------FEATURE II - Product--------------->
router.post('/products', createProduct);   //aj
router.get('/products', getProducts);      //shayan
router.get('/products/:productId', getProductById);   //shayan
router.put('/products/:productId', updateProduct);   //sa
router.delete('/products/:productId', deleteProduct)     //shayan

//------------FEATURE III - cart--------------->
router.post('/users/:userId/cart',authenticate,authorization, createCart); //aj
router.put('/users/:userId/cart',authenticate,authorization, updateCart);  //bbbbb
router.get('/users/:userId/cart',authenticate,authorization, getCart);         //shayan  
router.delete('/users/:userId/cart', deleteCart);   //shayan  

//-------------FEATURE IV - Order--------------->
router.post('/users/:userId/orders',authenticate,authorization, createOrder); //sana
router.put('/users/:userId/orders',authenticate,authorization, updateOrder);  //bbbbb


export default router;
