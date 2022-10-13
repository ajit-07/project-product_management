import jwt from 'jsonwebtoken';

// const auth = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization.slice(7,);
//         console.log(token)

//         if (!token)
//             res.status(400).send({ status: false, message: `Token must be present.` })
//         jwt.verify(token, 'group1', (err, decoded) => {
//             if (err)
//                 res.status(400).send({ status: false, message: `Authentication Failed!`, error: err.message })
//             req['user'] = decoded.userId
//             next()
//         })
//     }
//     catch (err) {
//         res.status(500).send({ status: false, error: err.message })
//     }
// }


const auth = async (req, res, next) => {
    try {
        let token = req.headers.authorization
        if (!token) return res.status(400).send({ status: false, message: "token must be present" });

        token = token.split(' ')[1];

        jwt.verify(token, 'group1', (err, decoded) =>{
            if (err) 
                return res.status(401).send({ status: false, message: err.message })

                req['user'] = decoded.userId
                next()
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


export default auth;
