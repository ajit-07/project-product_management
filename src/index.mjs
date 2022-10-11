import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer'
import route from './routes/route.js';
const app = express()

app.use(express.json)
app.use(multer().any())


mongoose.connect('mongodb+srv://riju:riju@cluster0.s4hmv.mongodb.net/group1Database', {
    useNewUrlParser: true
})
    .then(() => console.log(`MongoDb is connected`))
    .catch(err => console.log(err.message))

app.use('/', route)

app.use((req, res) => res.status(400).send({ status: false, message: `Invalid URL` }))
app.listen(3000, () => console.log(`Express app is running on port 3000`))
