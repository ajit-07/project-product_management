import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, unique: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true, trim: true },           //valid number/decimal
        currencyId: { type: String, required: true, trim: true },      //INR
        currencyFormat: { type: String, required: true, trim: true },  //Rupee symbol
        isFreeShipping: { type: Boolean, default: false },
        productImage: { type: String, required: true, trim: true },    // s3 link
        style: String,
        availableSizes: { type: [String], required: true, enum: ["S", "XS", "M", "X", "L", "XXL", "XL"] },
        installments: Number,
        deletedAt: Date,
        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true }
)

export default mongoose.model('Product', productSchema);
