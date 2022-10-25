import express from 'express';
const router = express.Router();
import { createUser, login, getUser, updateUser } from '../controllers/userController.js';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js';
import { createCart, updateCart, getCart, deleteCart } from '../controllers/cartController.js';
import { createOrder, updateOrder } from '../controllers/orderController.js';
import { authenticate, authorization } from '../middleware/auth.js';


//--------------FEATURE I - User---------------->
router.post('/register', createUser);
router.post('/login', login);
router.post('/user/:userId/profile', authenticate, authorization, getUser);
router.put('/user/:userId/profile', authenticate, authorization, updateUser);

//-------------FEATURE II - Product--------------->
router.post('/products', createProduct);
router.get('/products', getProducts);
router.get('/products/:productId', getProductById);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct)

//------------FEATURE III - cart--------------->
router.post('/users/:userId/cart', authenticate, authorization, createCart);
router.put('/users/:userId/cart', authenticate, authorization, updateCart);
router.get('/users/:userId/cart', authenticate, authorization, getCart);
router.delete('/users/:userId/cart', deleteCart);

//-------------FEATURE IV - Order--------------->
router.post('/users/:userId/orders', authenticate, authorization, createOrder);
router.put('/users/:userId/orders', authenticate, authorization, updateOrder);


export default router;
