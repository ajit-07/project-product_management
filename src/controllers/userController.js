import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import aws from 'aws-sdk';
import userModel from "../models/userMosel.js";
import { isValidEmail, isValidPassword, isValid } from '../util/validator.js';


//======================================createUser===============================================>
const createUser = async (req, res) => {
    try {
        let data = req.body;
        let files = req.files
        let { fname, lname, email, profileImage, phone, password, address } = data

        if (Object.keys(data).length === 0)
            return res.status(400).send({ status: false, message: `Please provide user details` })

        if (!files[0])
            return res.status(400).send({ status: false, message: `Please provide image file` })

        profileImage = await aws.uploadFile(files[0])

        const usedEmail = await userModel.findOne({ email })
        if (usedEmail)
            return res.status(400).send({ status: false, message: `This ${email} Email-Id is already in use` })

        const usedPhone = await userModel.findOne({ phone })
        if (usedPhone)
            return res.status(400).send({ status: false, message: `This ${phone} phone number is already in use` })
        
        //-------------------password hashing-------------------
        const hashPassword = await bcrypt.hash(password, 10);
        req.body.password = hashPassword

        const saveUser = await userModel.create(data)
        return res.status(201).send({ status: true, message: `User created successfully!!`, data: saveUser })

    } catch (err) {
        return res.status(500).send({ status: false, message: err })
    }
};


//======================================login=============================================>
const login = async (req, res) => {
    try {
        const data = req.body

        if (Object.keys(data).length == 0)
            return res.status.send({ status: false, message: `Please give Data` })

        const reqBody = ["email", "password"]

        for (element of reqBody)
            if (!isValid(req.body[element]))
                return res.status(400).send({ status: false, message: `This ${element} is required and be in valid format` })

        if (!isValidEmail(email))
            return res.status(400).send({ status: false, message: `EmailId is invalid` })

        if (!isValidPassword(password))
            return res.status(400).send({ status: false, message: `Password is invalid` })

        //--------------------------------exitsUser----------------------------------->
        const existUser = await userModel.findOne({ email });
        if (!existUser)
            return res.status(401).send({ status: false, message: `Please register first. ` });

        // ------------------------------token generation----------------------------->
        const payload = { userId: existUser._id, iat: Math.floor(Date.now() / 1000) };

        const token = jwt.sign(payload, 'group1', { expiresIn: '365d' });

        // --------------------------------response-------------------------------------->
        res.status(200).send({ status: true, message: `Login Successful.`, data: { userId: existUser._id, token: token } });


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
};


// //=========================================login================================================>
// const login = async (req, res) => {
//     try {
//         const reqBody = req.body;
//         const { email, password } = reqBody;

//         //------------------------------body validation----------------------------------->
//         if (!dataValidation(reqBody))
//             return res.status(400).send({ status: false, message: `Please fill the data.` })

//         if (Object.keys(reqBody).length > 2)
//             return res.status(400).send({ status: false, message: `You can't add extra field.` })

//         //------------------------------email validation--------------------------------->
//         if (!email)
//             return res.status(400).send({ status: false, message: `email is required.` });

//         if (!isValidEmail(email))
//             return res.status(400).send({ status: false, message: ` '${email}' this email is not valid.` });

//         //------------------------------password validation--------------------------------->

//         if (!password)
//             return res.status(400).send({ status: false, message: `password is required.` });

//         if (!isValidPass(password))
//             return res.status(400).send({ status: false, message: `Password should be 8-15 char & use 0-9,A-Z,a-z & special char this combination.` });

//         //--------------------------------exitsUser----------------------------------->
//         const existUser = await userModel.findOne({ email });

//         if (!existUser)
//             return res.status(401).send({ status: false, message: 'Please register first.' });

//         // ---------------------------decoding hash password--------------------------->
//         const matchPass = bcrypt.compare(password, existUser.password);

//         if (!matchPass)
//             return res.status(400).send({ status: false, message: 'Password is wrong.' })

//         // ------------------------------token generation----------------------------->
//         const payload = { userId: existUser._id, iat: Math.floor(Date.now() / 1000) };

//         const token = jwt.sign(payload, '', { expiresIn: '365d' });

//         // --------------------------------response-------------------------------------->
//          res.status(200).send({ status: true, message: 'Login Successful.', data: { userId: existUser._id, token: token } });

//     }
//     catch (err) {
//         res.status(500).send({ status: false, error: err.message });
//     }
// };


//========================================gateUser===============================================>
const gateUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        //--------------------------------userId validation----------------------------------->
        if (!userId)
            return res.status(400).send({ status: false, message: `userId is required.` });

        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: ` '${userId}' this userId is not valid.` });

        //--------------------------------exitsUser----------------------------------->
        const existUser = await userId.findById(userId)
        if (!existUser)
            return res.status(400).send({ status: false, message: `userId could not found through '${userId}' this userId.` });

        // if(req.user!=userId)
        //     return res.status(403).send({ status: false, message: ` '${existUser.fname}' provide your won token.` });

        res.status(200).send({ status: true, message: `Success`, data: existUser });
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================updateUser===============================================>
const updateUser = async (req, res) => {
    try {

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


export { createUser, login, gateUser, updateUser };