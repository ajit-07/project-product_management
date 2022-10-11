import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
    try {
        // const token = req.headers.authorization
        token = authHeader.substring(7, authHeader.length);
        if (!token)
            res.status(400).send({ status: false, message: `Token must be present.` })
        jwt.verify(token, 'group1', (err, payload) => {
            if (err)
                res.status(400).send({ status: false, message: `Authentication Failed!`, error: err.message })
            req['user'] = payload.userId
            next()
        })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

export default auth;
