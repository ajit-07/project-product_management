import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel from '../models/userMosel.js';
import { isValidName, isValidEmail, isValidFile, isValidNumber, isValidPass, isValidTxt, isValidPin, isValidObjectId } from '../util/validator.js';
import { uploadFile, } from '../aws/aws.js';


//======================================createUser===============================================>
const createUser = async (req, res) => {
    try {
        const reqBody = req.body;
        const file = req.files;

        const { fname, lname, email, profileImage, phone, password, address } = reqBody;

        //------------------------------body validation--------------------------------->
        if (Object.keys(reqBody).length === 0)
            return res.status(400).send({ status: false, message: `Please provide user details` });

        if (Object.keys(reqBody).length > 7)
            return res.status(400).send({ status: false, message: `You cam't add extra field` });

        //------------------------------file validation--------------------------------->
        if (!file[0])
            return res.status(400).send({ status: false, message: `Please provide image file` });

        //------------------------------fname validation--------------------------------->
        if (!fname)
            return res.status(400).send({ status: false, message: `fname is required.` });

        if (!isValidName(fname))
            return res.status(400).send({ status: false, message: ` '${fname}' this fname is not valid.` });

        //------------------------------lname validation--------------------------------->
        if (!lname)
            return res.status(400).send({ status: false, message: `lname is required.` });

        if (!isValidName(lname))
            return res.status(400).send({ status: false, message: ` '${lname}' this lname is not valid.` });

        //------------------------------email validation--------------------------------->
        if (!email)
            return res.status(400).send({ status: false, message: `email is required.` });

        if (!isValidEmail(email))
            return res.status(400).send({ status: false, message: ` '${email}' this email is not valid email.` });

        //------------------------------phone validation--------------------------------->
        if (!phone)
            return res.status(400).send({ status: false, message: `phone is required.` });

        if (!isValidNumber(phone))
            return res.status(400).send({ status: false, message: ` '${phone}' this is not valid indian phone number.` });

        //------------------------------password validation--------------------------------->
        if (!password)
            return res.status(400).send({ status: false, message: `password is required.` });

        if (!isValidPass(password))
            return res.status(400).send({ status: false, message: `Use this combination 8-15 char & use 0-9,A-Z,a-z & special char.` });

        //*-----------##########----------address validation----------##############---------->
        if (!address)
            return res.status(400).send({ status: false, message: `address is required.` });

        reqBody.address = JSON.parse(address)

        const { shipping, billing } = reqBody.address;

        //*----------//--------//--------shipping validation---------//----------//--------->
        if (!shipping)
            return res.status(400).send({ status: false, message: `shipping is required.` })

        //-------------------------------street validation--------------------------------->
        if (!shipping.street)
            return res.status(400).send({ status: false, message: `street is required in shipping.` })

        if (!isValidTxt(shipping.street))
            return res.status(400).send({ status: false, message: ` '${shipping.street}' this street is not valid in shipping.` })

        //-------------------------------city validation--------------------------------->
        if (!shipping.city)
            return res.status(400).send({ status: false, message: `city is required in shipping.` }); isValidPin

        if (!isValidTxt(shipping.city))
            return res.status(400).send({ status: false, message: ` '${shipping.city}' this city is not valid in shipping.` })

        //-------------------------------pincode validation--------------------------------->
        if (!shipping.pincode)
            return res.status(400).send({ status: false, message: `pincode is required in shipping.` });

        if (!isValidPin(shipping.pincode))
            return res.status(400).send({ status: false, message: ` '${shipping.pincode}' this pincode is not valid in shipping.` })

        //*----------//--------//--------billing validation---------//----------//--------->
        if (!billing)
            return res.status(400).send({ status: false, message: `billing is required.` })

        //-------------------------------street validation--------------------------------->
        if (!billing.street)
            return res.status(400).send({ status: false, message: `street is required in billing.` })

        if (!isValidTxt(billing.street))
            return res.status(400).send({ status: false, message: ` '${billing.street}' this street is not valid in billing.` })

        //-------------------------------city validation--------------------------------->
        if (!billing.city)
            return res.status(400).send({ status: false, message: `city is required in billing.` }); isValidPin

        if (!isValidTxt(billing.city))
            return res.status(400).send({ status: false, message: ` '${billing.city}' this city is not valid in billing.` })

        //-------------------------------pincode validation--------------------------------->
        if (!billing.pincode)
            return res.status(400).send({ status: false, message: `pincode is required in billing.` });

        if (!isValidPin(billing.pincode))
            return res.status(400).send({ status: false, message: ` '${billing.pincode}' this pincode is not valid in billing.` })

        //------------------------------finding duplicate email------------------------------>
        const duplicateEmail = await userModel.findOne({ email });

        if (duplicateEmail)
            return res.status(400).send({ status: false, message: `Please login.` });

        //------------------------------finding duplicate phone------------------------------>
        const duplicatePhone = await userModel.findOne({ phone });

        if (duplicatePhone)
            return res.status(400).send({ status: false, message: `Please login.` });

        //------------------aws file uploading------------------->
        const uploadedFileUrl = await uploadFile(file[0]);

        //----------profileImage url setting in request---------->
        reqBody.profileImage = uploadedFileUrl

        //-------------------password hashing------------------->
        const hashPassword = await bcrypt.hash(password, 10);
        reqBody['password'] = hashPassword

        const saveUser = await userModel.create(reqBody);
        res.status(201).send({ status: true, message: `User created successfully!!`, data: saveUser });

    } catch (err) {
        return res.status(500).send({ status: false, message: err });
    }
};

//=========================================login================================================>
const login = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody;

        //------------------------------body validation----------------------------------->
        if (Object.keys(reqBody).length === 0)
            return res.status(400).send({ status: false, message: `Please fill the data.` })

        if (Object.keys(reqBody).length > 2)
            return res.status(400).send({ status: false, message: `You can't add extra field.` })

        //------------------------------email validation--------------------------------->
        if (!email)
            return res.status(400).send({ status: false, message: `email is required.` });

        if (!isValidEmail(email))
            return res.status(400).send({ status: false, message: ` '${email}' this email is not valid.` });

        //------------------------------password validation--------------------------------->

        if (!password)
            return res.status(400).send({ status: false, message: `password is required.` });

        if (!isValidPass(password))
            return res.status(400).send({ status: false, message: `Password should be 8-15 char & use 0-9,A-Z,a-z & special char this combination.` });

        //--------------------------------exitsUser----------------------------------->
        const existUser = await userModel.findOne({ email });

        if (!existUser)
            return res.status(401).send({ status: false, message: 'Please register first.' });

        // ---------------------------decoding hash password--------------------------->
        const matchPass = bcrypt.compare(password, existUser.password);

        if (!matchPass)
            return res.status(400).send({ status: false, message: 'Password is wrong.' })

        // ------------------------------token generation----------------------------->
        const payload = { userId: existUser._id, iat: Math.floor(Date.now() / 1000) };

        const token = jwt.sign(payload, 'group1', { expiresIn: '365d' });

        // --------------------------------response-------------------------------------->
        res.status(200).send({ status: true, message: 'Login Successful.', data: { userId: existUser._id, token: token } });

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


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
        const existUser = await userModel.findById(userId)
        if (!existUser)
            return res.status(400).send({ status: false, message: `userId could not found through '${userId}' this userId.` });

        res.status(200).send({ status: true, message: `Success`, data: existUser });
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


//======================================updateUser===============================================>
const updateUser = async (req, res) => {
    try {
        const reqBody = req.body
        const userId = req.params.userId
        const file = req.files
        let { fname, lname, email, phone, address, password } = reqBody;
        console.log(typeof reqBody)
        console.log(reqBody)
        
        console.log(reqBody.profileImage)
       
        //------------------------------------body validation---------------------------------------->
        if ((Object.keys(reqBody).length === 0 || reqBody.profileImage !== undefined) && (file.length === 0 || file[0].fieldname !== 'profileImage' || file === undefined))
            return res.status(400).send({ status: false, message: `Enter at least One Field to update.` })

        if (Object.keys(reqBody).length > 7)
            return res.status(400).send({ status: false, message: `You cam't add extra field.` });

        //-----------------------------userId validation---------------------------------->
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `Enter valid UserId.` })

        //-------------------------------finding user-------------------------------------->
        const existUser = await userModel.findById(userId)
        if (!existUser)
            return res.status(404).send({ status: false, message: `No user found by '${userId}' this userId..` })

        //-------------------------Authentication----------------------------->
        if (req.user != userId)
            return res.status(403).send({ status: false, message: ` '${existUser.fname}' provide your won token.` });

        //--------------------------------fname validation--------------------------------->
        if (fname) {
            if (!isValidName(fname))
                return res.status(400).send({ status: false, message: ` '${fname}' this fname is not valid.` });
            existUser['fname'] = fname
        }

        //--------------------------------lname validation--------------------------------->
        if (lname) {
            if (!isValidName(lname))
                return res.status(400).send({ status: false, message: ` '${lname}' this lname is not valid.` });
            existUser['lname'] = lname
        }

        //--------------------------------email validation--------------------------------->
        if (email) {
            if (!isValidEmail(email))
                return res.status(400).send({ status: false, message: ` '${email}' this email is not valid.` });

            if (existUser.email === email)
                return res.status(400).send({ status: false, message: `Please enter different email.` });

            existUser['email'] = email
        }

        //--------------------------------phone validation--------------------------------->
        if (phone) {
            if (!isValidNumber(phone))
                return res.status(400).send({ status: false, message: ` '${phone}' this phone is not valid.` });

            if (existUser.phone === phone)
                return res.status(400).send({ status: false, message: `Please enter different phone.` });

            existUser['phone'] = phone
        }

        //--------------------------------password validation--------------------------------->
        if (password) {
            if (!isValidPass(password))
                return res.status(400).send({ status: false, message: `Use this combination 8-15 char & use 0-9,A-Z,a-z & special char.` });

            const matchPass = await bcrypt.compare(password, existUser.password);

            if (matchPass === true)
                return res.status(400).send({ status: false, message: `Please enter new password.` });

            const hashPassword = await bcrypt.hash(password, 10);
            existUser['password'] = hashPassword;
        }

        //--------------------------------file validation--------------------------------->
        if (file.length > 0) {
            if (!isValidFile(file[0].originalname))
                return res.status(400).send({ status: false, message: `Enter formate jpeg/jpg/png only.` })

            if (file.length > 1)
                return res.status(400).send({ status: false, message: `Only one File Allowed.` })

            const uploadedFileUrl = await uploadFile(file[0]);
            existUser['profileImage'] = uploadedFileUrl
        }

        //*-----------##########----------address validation----------##############---------->
        if (address) {
            address = JSON.parse(address)
            const { shipping, billing } = address;

            //*----------//--------//--------shipping validation---------//----------//--------->
            if ('shipping' in address) {

                if (Object.keys(shipping).length === 0)
                    return res.status(400).send({ status: false, message: `Please enter shipping data.` })

                const { street, city, pincode } = shipping;

                if ('street' in shipping) {
                    if (!isValidTxt(street))
                        return res.status(400).send({ status: false, message: ` '${street}' this street is not valid in shipping.` })

                    existUser.address.shipping['street'] = street;
                }

                if ('city' in shipping) {
                    if (!isValidTxt(city))
                        return res.status(400).send({ status: false, message: ` '${city}' this city is not valid in shipping.` })

                    existUser.address.shipping['city'] = city;
                }

                if ('pincode' in shipping) {
                    if (!isValidPin(pincode))
                        return res.status(400).send({ status: false, message: ` '${pincode}' this pincode is not valid in shipping.` })

                    existUser.address.shipping['pincode'] = pincode;
                }
            }

            //*----------//--------//--------billing validation---------//----------//--------->
            if ('billing' in address) {

                if (Object.keys(billing).length === 0)
                    return res.status(400).send({ status: false, message: `Please enter billing data.` })

                const { street, city, pincode } = billing;

                if ('street' in billing) {
                    if (!isValidTxt(street))
                        return res.status(400).send({ status: false, message: ` '${street}' this street is not valid in billing.` })

                    existUser.address.billing['street'] = street;
                }

                if ('city' in billing) {
                    if (!isValidTxt(city))
                        return res.status(400).send({ status: false, message: ` '${city}' this city is not valid in billing.` })

                    existUser.address.billing['city'] = city;
                }

                if ('pincode' in billing) {
                    if (!isValidPin(pincode))
                        return res.status(400).send({ status: false, message: ` '${pincode}' this pincode is not valid in billing.` })

                    existUser.address.billing['pincode'] = pincode;
                }
            }
        }
        //----------------------updation perform in DB------------------------>
        const newData = await userModel.findOneAndUpdate({ _id: userId }, existUser, { new: true })
        return res.status(200).send({ status: true, message: "Success", data: newData })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};


export { createUser, login, gateUser, updateUser };