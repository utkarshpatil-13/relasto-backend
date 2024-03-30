import mongoose from "mongoose";

const sellerSchema = mongoose.Schema({
    companyName: {
        type : String, 
    },
    contactPerson : {
        type: String,
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
    properties: {
        type: Number,
    }
}, {
    timestamps : true
});

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;