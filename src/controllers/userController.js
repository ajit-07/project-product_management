import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel from '../models/userMosel.js';
import { isValidName, isValidEmail, isValidFile, isValidPass, isValidNumber, isValidPin, isValidField } from '../util/validator.js';
import { uploadFile } from '../aws/aws.js';
//import mongoose from 'mongoose';
//const ObjectId = mongoose.Types.ObjectId;



//======================================createUser===============================================>
const createUser = async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;
        //console.log(files)

        const { fname, lname, email, phone, password, address, profileImage, ...rest } = data;

        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: `Please provide user details` });

        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: `You cannot add this ${Object.keys(rest)} extra fields` })

        if (!fname || !isValidField(fname)) return res.status(400).send({ status: false, message: "First name is required and should be valid string" });
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Please enter a valid first Name" })


        if (!lname || !isValidField(lname)) return res.status(400).send({ status: false, message: "Last name is required and should be valid string" });
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Please enter a valid last Name" })

        if (!email) return res.status(400).send({ status: false, message: "Email is required " });
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Please enter a valid Email" });

        if (!phone) return res.status(400).send({ status: false, message: "Phone is required " });
        if (!isValidNumber(phone)) return res.status(400).send({ status: false, message: "Please enter a valid phone number" });


        if (!password) return res.status(400).send({ status: false, message: "Password is required " });
        if (!isValidPass(password)) return res.status(400).send({ status: false, message: `Use this combination 8-15 char & use 0-9,A-Z,a-z & special char as your password` });

        if (!address || !isValidField(address)) return res.status(400).send({ status: false, message: "address is required " });

        data.address = JSON.parse(address)

        const { shipping, billing } = data.address;

        if (address && typeof (address) != "object") return res.status(400).send({ status: false, message: "Address should be in object format" })

        //Shipping address validation
        if (shipping) {
            if (typeof (shipping) !== "object") return res.status(400).send({ status: false, message: "Shipping should be present inside an object" })
            if (!isValidField(shipping)) return res.status(400).send({ status: false, message: "Shipping is required and should not be an empty object" });

            if (!shipping.street || !isValidField(shipping.street)) return res.status(400).send({ status: false, message: `street is required in shipping.` })

            if (!shipping.city || !isValidField(shipping.city)) return res.status(400).send({ status: false, message: `city is required in shipping.` });

            if (!shipping.pincode || !isValidField(shipping.pincode)) return res.status(400).send({ status: false, message: `pincode is required in shipping.` });
            if (!isValidPin(shipping.pincode)) return res.status(400).send({ status: false, message: ` '${shipping.pincode}' this pincode is not valid for shipping address.` })
        } else {
            return res.status(400).send({ status: false, message: "Shipping address is required" })
        }
        //Billing address validation

        if (billing) {
            if (typeof (billing) !== "object") return res.status(400).send({ status: false, message: "Billing should be present inside an object" })
            if (!isValidField(billing)) return res.status(400).send({ status: false, message: "Billing is required and should not be an empty object" });


            if (!billing.street || !isValidField(billing.street)) return res.status(400).send({ status: false, message: `street is required in shipping.` })

            if (!billing.city || !isValidField(billing.city)) return res.status(400).send({ status: false, message: `city is required in shipping.` });

            if (!billing.pincode || !isValidField(billing.pincode)) return res.status(400).send({ status: false, message: `pincode is required in shipping.` });
            if (!isValidPin(billing.pincode)) return res.status(400).send({ status: false, message: ` '${billing.pincode}' this pincode is not valid for billing address.` })
        } else {
            return res.status(400).send({ status: false, message: "Billing address is required" })
        }

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

        const userDetails = await userModel.findById(userId)
        return res.status(200).send({ status: true, message: `Success`, data: userDetails });
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};


//======================================updateUser===============================================>
const updateUser = async (req, res) => {
    try {
        const reqBody = req.body
        //const userId = req.params.userId
        const files = req.files
        let { fname, lname, email, phone, address, password } = reqBody;

        if (Object.keys(reqBody).length === 0) return res.status(400).send({ status: false, message: `Enter at least One Field to update.` })

        let update = {}

        if (fname) {
            if (!isValidField(fname)) return res.status(400).send({ status: false, message: "First name is required and should be valid string" });
            if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Please enter a valid first Name" })
            update['fname'] = fname
        }


        if (lname) {
            if (!isValidField(lname)) return res.status(400).send({ status: false, message: "Last name is required and should be valid string" });
            if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Please enter a valid last Name" })
            update['lname'] = lname
        }


        if (email) {
            if (!isValidEmail(email)) return res.status(400).send({ status: false, message: ` '${email}' is not a valid Email-id` });
            const emailExist = await userModel.findOne({ email: email })
            if (emailExist) return res.status(404).send({ status: false, message: `This ${email} is already in use` })
            update['email'] = email
        }


        if (phone) {
            if (!isValidNumber(phone)) return res.status(400).send({ status: false, message: ` '${phone}' is not valid phone number.` });
            const phoneExist = await userModel.findOne({ phone: phone })
            if (phoneExist) return res.status(404).send({ status: false, message: `This ${phone} is already in use` })
            update['phone'] = phone
        }


        if (password) {
            if (!isValidPass(password)) return res.status(400).send({ status: false, message: `Use this combination 8-15 char & use 0-9,A-Z,a-z & special char.` });

            const matchPass = await bcrypt.compare(password, existUser.password);
            //console.log(matchPass)
            if (matchPass === true) return res.status(400).send({ status: false, message: `Please enter new password.` });

            const hashPassword = await bcrypt.hash(password, 10);
            update['password'] = hashPassword;
        }

        if (files && files.length > 0) {
            if (files.length > 1) { return res.status(400).send({ status: false, message: "You cannot upload more than one file" }) }
            if (!isValidFile(files[0].originalname)) { return res.status(400).send({ status: false, message: "You can only upload a image file" }) }
            update['profileImage'] = await uploadFile(files[0])
        }

        if (address) {
            const { shipping, billing } = address;

            if (shipping) {
                const { street, city, pincode } = shipping;

                if (street) {
                    if (!isValidField(address.shipping.street)) { return res.status(400).send({ status: false, message: "Invalid shipping street!" }); }
                    update["address.shipping.street"] = street;
                }

                if (city) {
                    if (!isValidField(address.shipping.city)) { return res.status(400).send({ status: false, message: "Invalid shipping city!" }) }
                    update["address.shipping.city"] = city;
                }

                if (pincode) {
                    if (!isValidPin(address.shipping.pincode)) { return res.status(400).send({ status: false, message: "Invalid shipping pincode!" }) }
                    update["address.shipping.pincode"] = pincode;
                }
            }

            if (billing) {
                const { street, city, pincode } = billing;

                if (street) {
                    if (!isValidField(address.billing.street)) { return res.status(400).send({ status: false, message: "Invalid billing street!" }) }
                    update["address.billing.street"] = street;
                }

                if (city) {
                    if (!isValidField(address.billing.city)) { return res.status(400).send({ status: false, message: "Invalid billing city!" }) }
                    update["address.billing.city"] = city;
                }

                if (pincode) {
                    if (!isValidPin(address.billing.pincode)) { return res.status(400).send({ status: false, message: "Invalid billing pincode!" }); }
                    update["address.billing.pincode"] = pincode;
                }
            }
        }

        const updatedData = await userModel.findOneAndUpdate({ _id: userId }, update, { new: true })
        return res.status(200).send({ status: true, message: "Success", data: updatedData })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};


export { createUser, login, getUser, updateUser };