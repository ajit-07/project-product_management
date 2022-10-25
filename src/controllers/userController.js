import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel from '../models/userMosel.js';
import { isValidName, isValidEmail, isValidFile, isValidPass, isValidNumber, isValidTxt, isValidPin, isValidField } from '../util/validator.js';
import { uploadFile } from '../aws/aws.js';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;



//======================================createUser===============================================>
const createUser = async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;
        //console.log(files)

        const { fname, lname, email, phone, password, address, profileImage, ...rest } = data;

        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: `Please provide user details` });

        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: `You cannot add this ${Object.keys(rest)} extra fields` })

        if (!isValidField(fname)) return res.status(400).send({ status: false, message: "First name is required and should be valid string" });
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Please enter a valid first Name" })


        if (!isValidField(lname)) return res.status(400).send({ status: false, message: "Last name is required and should be valid string" });
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Please enter a valid last Name" })

        if (!isValidField(email)) return res.status(400).send({ status: false, message: "Email is required and should be valid string" });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Please enter a valid Email" });

        if (!isValidField(phone)) return res.status(400).send({ status: false, message: "Phone is required and should be valid string" });
        if (!isValidNumber(phone)) return res.status(400).send({ status: false, message: "Please enter a valid phone number" });


        if (!isValidField(password)) return res.status(400).send({ status: false, message: "Password is required and should be valid string" });
        if (!isValidPass(password)) return res.status(400).send({ status: false, message: `Use this combination 8-15 char & use 0-9,A-Z,a-z & special char as your password` });

        //if (typeof (address) !== "object") return res.status(400).send({ status: false, message: "Address should be present inside an object" })
        if (!isValidField(address)) return res.status(400).send({ status: false, message: "address is required and should not be an empty object" });

        data.address = JSON.parse(address)

        const { shipping, billing } = data.address;

        //Shipping address validation

        //if (typeof (shipping) !== "object") return res.status(400).send({ status: false, message: "Shipping should be present inside an object" })
        if (!isValidField(shipping)) return res.status(400).send({ status: false, message: "Shipping is required and should not be an empty object" });


        if (!isValidField(shipping.street)) return res.status(400).send({ status: false, message: `street is required in shipping.` })

        if (!isValidField(shipping.city)) return res.status(400).send({ status: false, message: `city is required in shipping.` });

        if (!isValidField(shipping.pincode)) return res.status(400).send({ status: false, message: `pincode is required in shipping.` });
        if (!isValidPin(shipping.pincode)) return res.status(400).send({ status: false, message: ` '${shipping.pincode}' this pincode is not valid for shipping address.` })

        //Billing address validation

        //if (typeof (billing) !== "object") return res.status(400).send({ status: false, message: "Billing should be present inside an object" })
        if (!isValidField(billing)) return res.status(400).send({ status: false, message: "Billing is required and should not be an empty object" });


        if (!isValidField(billing.street)) return res.status(400).send({ status: false, message: `street is required in shipping.` })

        if (!isValidField(billing.city)) return res.status(400).send({ status: false, message: `city is required in shipping.` });

        if (!isValidField(billing.pincode)) return res.status(400).send({ status: false, message: `pincode is required in shipping.` });
        if (!isValidPin(billing.pincode)) return res.status(400).send({ status: false, message: ` '${billing.pincode}' this pincode is not valid for billing address.` })

        //Unique values validation

        const notUnique = await userModel.findOne({ $or: [{ email: email, phone: phone }] });
        if (notUnique) {
            if (notUnique.email === email) return res.status(400).send({ status: false, message: `${email} is already registered with us.Please login or enter a different email-id` })
            if (notUnique.phone === phone) return res.status(400).send({ status: false, message: `${phone} is already registered with us.Please login or enter a different phone` })
        }

        if (files[0].fieldname !== "profileImage" || files.length === 0) { return res.status(400).send({ status: false, message: "Profile Image key and it's value is required" }) }

        if (files && files.length > 0) {
            if (files.length > 1) { return res.status(400).send({ status: false, message: "You cannot upload more than one file" }) }
            if (!isValidFile(files[0].originalname)) { return res.status(400).send({ status: false, message: "You can only upload a image file" }) }
            data['profileImage'] = await uploadFile(files[0])
        }


        const encryptPassword = await bcrypt.hash(password, 10);
        data['password'] = encryptPassword;

        const saveUser = await userModel.create(data);
        return res.status(201).send({ status: true, message: `User created successfully!!`, data: saveUser });

    } catch (err) {
        return res.status(500).send({ status: false, message: err });
    }
};

//=========================================login================================================>
const login = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, password, ...rest } = reqBody;

        if (Object.keys(reqBody).length === 0) return res.status(400).send({ status: false, message: `Please fill the data.` })

        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: `You can't add extra field.` })

        if (!isValidField(email)) return res.status(400).send({ status: false, message: `email is required` });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: ` email is not valid.` });

        if (!isValidField(password)) return res.status(400).send({ status: false, message: `password is required.` });
        if (!isValidPass(password)) return res.status(400).send({ status: false, message: `Password should be 8-15 char & use 0-9,A-Z,a-z & special char this combination.` });

        const existUser = await userModel.findOne({ email });

        if (!existUser)
            return res.status(401).send({ status: false, message: 'Please register first.' });


        const matchPass = await bcrypt.compare(password, existUser.password);

        if (matchPass) {
            const payLoad = {
                userId: existUser._id,
                project: '5',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 60 * 60
            }
            const token = jwt.sign(payLoad, "Project-5")
            res.status(200).send({ status: true, message: 'Login Successful.', data: { userId: existUser._id, token: token } });
        }
        else { return res.status(401).send({ status: false, message: 'Password is wrong.' }) }
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};


//========================================gateUser===============================================>
const getUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) return res.status(400).send({ status: false, message: `userId is required.` });

        if (!ObjectId.isValidField(userId)) return res.status(400).send({ status: false, message: ` '${userId}' this userId is not valid.` });

        const existUser = await userModel.findById(userId)
        if (!existUser) return res.status(400).send({ status: false, message: `user not found through '${userId}' this userId.` });

        return res.status(200).send({ status: true, message: `Success`, data: existUser });
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
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
            if (!isValidField(fname))
                return res.status(400).send({ status: false, message: ` '${fname}' this fname is not valid.` });
            existUser['fname'] = fname
        }

        //--------------------------------lname validation--------------------------------->
        if (lname) {
            if (!isValidField(lname))
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


export { createUser, login, getUser, updateUser };