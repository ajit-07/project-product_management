import express from 'express';
const router = express.Router();
import { createUser, login, gateUser, updateUser } from '../controllers/userController.js';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js';
import { createCart, updateCart, getCart, deleteCart } from '../controllers/cartController.js';
import { createOrder, updateOrder } from '../controllers/orderController.js';
import auth from '../middleware/auth.js';


//--------------FEATURE I - User---------------->
router.post('/register', createUser);  //aj
router.post('/login', login);          //sa
router.post('/user/:userId/profile', auth, gateUser);  //shayan
router.put('/user/:userId/profile', auth, updateUser);  //shayan

//-------------FEATURE II - Product--------------->
router.post('/products', createProduct);   //aj
router.get('/products', getProducts);      //shayan
router.get('/products', getProductById);  
router.put('/products/:productId', updateProduct);   //sa
router.delete('/products/:productId', deleteProduct)    

//------------FEATURE III - cart--------------->
router.post('/users/:userId/cart', createCart); //aj
router.put('/users/:userId/cart', updateCart);  //bbbbb
router.get('/users/:userId/cart', getCart);          
router.delete('/users/:userId/cart', deleteCart);    

//-------------FEATURE IV - Order--------------->
router.post('/users/:userId/orders', createOrder); //sana
router.put('/users/:userId/orders', updateOrder);  //bbbbb


export default router;
