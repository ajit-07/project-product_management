import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
    {
        fname: { type: String, required: true, trim: true },
        lname: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, unique: true }, //valid email
        profileImage: { type: String, required: true },        // s3 link
        phone: { type: String, required: true, unique: true, trim: true }, // valid Indian mobile Number
        password: { type: String, required: true, trim: true },            // encrypted password, minLen 8, maxLen 15
        address: {
            shipping: {
                street: { type: String, required: true },
                city: { type: String, required: true },
                pincode: { type: Number, required: true }
            },
            billing: {
                street: { type: String, required: true },
                city: { type: String, required: true },
                pincode: { type: Number, required: true }
            }
        },
    },
    { timestamps: true }
)

export default mongoose.model('User', userSchema);