import mongoose from "mongoose";

const propertySchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    propertyType: {
        type: String,
        enum: ["Bungalow", 'Apartment', 'Villa', 'Townhouse', 'Agricultural', 'Other']
    },
    images: [
        {
            type: String,
        }
    ],
    rooms: {
        bedrooms: {
           type: Number,
        },
        bathrooms: {
            type: Number,
        },
        toilets: {
            type: Number,
        },
        hall: {
            type: Number,
        },
        kitchen: {
            type: Number,
        },
        balconies: {
            type: Number,
        },
        dryBalcony: {
            type: Number,
        },
        basement: {
            type: Boolean,
        },
        guestRoom: {
            type: Boolean,
        },
        studyRoom: {
            type: Boolean,
        },
        yard: {
            type: String,
            enum: ["FRONTYARD", "BACKYARD", "COURTYARD", "GARDEN", "NO_YARD"],
            default: 'NONE',
        },
    },
    area: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    yearBuilt: {
        type: Number,
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
    },
    isRental : {
        type: Boolean,
    },
    isSold: {
        type: Boolean,
    },
}, {
    timestamps : true
});

const Property = mongoose.model('Property', propertySchema);

export default Property;