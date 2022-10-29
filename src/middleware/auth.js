import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import userMosel from '../models/userMosel.js';
const ObjectId = mongoose.Types.ObjectId;



const authenticate = async (req, res, next) => {
    try {
        let token = req.headers["authorization"]
        if (!token) return res.status(401).send({ status: false, message: "Token is required" })

        token = token.split(" ")
        //console.log(token)
        token = token[1]

        jwt.verify(token, 'Project-5', (err, decodedToken) => {
            if (err) {
                //console.log(err.message)
                let message = err.message === "jwt expired" ? "token is expired" : "token is invalid"
                return res.status(401).send({ status: false, message: message })

            }

            req["user"] = decodedToken.userId;
            return next();
        })
        
    }
    catch (err) {
        return res.status(500).send({ staus: false, message: err.message })
    }
}

const authorization = async (req, res, next) => {
    try {

        let userId = req.params.userId;

        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: "User id should be a valid type mongoose object Id" })

        let userExist = await userMosel.findById(userId)
        if (!userExist) return res.status(404).send({ status: false, message: `user not found through '${userId}' this userId.` })


        if (req['user'] !== userId) return res.status(403).send({ status: false, message: "Authorization failed" })
        return next()

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



export { authenticate, authorization };
