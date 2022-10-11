import express from 'express';
const router = express.Router();
import { createUser, login, gateUser, updateUser } from '../controllers/userController.js';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js';
import { createCart, updateCart, getCart, deleteCart } from '../controllers/cartController.js';
import { createOrder, updateOrder } from '../controllers/orderController.js';


//--------------FEATURE I - User---------------->
router.post('/register', createUser);
router.post('/login', login);
router.post('/user/:userId/profile', gateUser);
router.put('/user/:userId/profile', updateUser);

//-------------FEATURE II - Product--------------->
router.post('/products', createProduct);
router.get('/products', getProducts);
router.get('/products', getProductById);
router.post('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);

//------------FEATURE III - cart--------------->
router.post('/users/:userId/cart', createCart);
router.put('/users/:userId/cart', updateCart);
router.get('/users/:userId/cart', getCart);
router.delete('/users/:userId/cart', deleteCart);

//-------------FEATURE IV - Order--------------->
router.post('/users/:userId/orders', createOrder);
router.put('/users/:userId/orders', updateOrder);


export default router;