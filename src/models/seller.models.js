import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const sellerSchema = mongoose.Schema({
    name: {
        type : String, 
        required: true,
    },
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    properties: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'property'
        }
    ],
    refreshToken: {
        type: String,
    },
    profilePhoto: {
        type: String, // Cloudinary url
    }

}, {
    timestamps : true
});

sellerSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return null;

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

sellerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

sellerSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

sellerSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    })
}

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;