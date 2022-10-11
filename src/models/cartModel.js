import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema(
    {
        userId: { type: ObjectId, ref: 'user', required: true, unique: true, trim: true },
        items: [{
            productId: { type: ObjectId, ref: 'product', required: true, trim: true },
            quantity: { type: Number, required: true, min: 1 }
        }],
        totalPrice: { type: Number, required: true },   //comment: "Holds total price of all the items in the cart"
        totalItems: { type: Number, required: true },   // comment: "Holds total number of items in the cart"
    },
    { timestamp: true }
)

export default mongoose.model('Cart', cartSchema);
