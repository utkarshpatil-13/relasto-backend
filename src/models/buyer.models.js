import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const buyerSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
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
    },
    profilePhoto: {
        type: String, // Cloudinary url
    },
    refreshToken: {
        type: String,
    },
    preferences: {
        propertyType: {
            type: String,
            enum: ["Bungalow", 'Apartment', 'Villa', 'Townhouse', 'Agricultural', 'Other']
        },
        area: {
            min: {
                type: Number,
            },
            max: {
                type: Number,
            },
        },
        price: {
            min: {
                type: Number,
            },
            max: {
                type: Number,
            },
        },
        city: {
            type: [],
            
        },
        state: {
            type: String,
        },
    },
}, 
{
    timestamps: true
})


buyerSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return null;

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

buyerSchema.methods.isPasswordCorrect = async function (password) {
    // console.log(password, this.password);
    return await bcrypt.compare(password, this.password);
}


buyerSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

buyerSchema.methods.generateRefreshToken = function(){
    const token = jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    return token;
}


const Buyer = mongoose.model('Buyer', buyerSchema);

export default Buyer;