import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './db/index.js'
import buyerRouter from './routes/buyer.routes.js'
import sellerRouter from './routes/seller.routes.js'
import propertyRouter from './routes/property.routes.js'
import cookieParser from 'cookie-parser'

// creating app server
const app = express()

dotenv.config({
    path: './.env'
});

// middlewares
app.use(cors());
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// routes
app.use('/api/buyer', buyerRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/property', propertyRouter);

connectDB()
.then((res) => {
    app.listen(process.env.PORT, () => {
        console.log("Server is listening at PORT ", process.env.PORT);
    })

    app.on('error', (error) => {
        console.lod("Error while connection to server ", error);
    })
})
.catch((error) => {
    console.log("MongoDB Connection Probelem !!!", error);
})



