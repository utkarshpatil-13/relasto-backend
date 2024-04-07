import Property from "../models/property.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Buyer from "../models/buyer.models.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createProperty = async(req, res) => {
    try {
        const existingProperty = await Property.findOne({
            title: req.body.title,
            address: req.body.address,
        });
    
        if (existingProperty) {
            return res.status(400).json({ message: 'Property already exists' });
        }

        console.log(req.body);

        const {propertyType} = req.body;

        if(propertyType == 'Property Type'){
            req.body.propertyType = 'Other';
        }

        let propertyImagesLocalPaths = [];
        if (
            req.files &&
            Array.isArray(req.files.images) &&
            req.files.images.length > 0
        ) {
            propertyImagesLocalPaths = req.files.images.map(image => image.path);
        }
        
        const propertyImages = await Promise.all(propertyImagesLocalPaths.map(uploadOnCloudinary));

        if(propertyImages.length < 1){
            throw new ApiError(400, "Property Images not added");
        }

        req.body.images = propertyImages.map(image => image.secure_url);
        
        console.log(req.body);

        const property = await Property.create(req.body);
        res.status(201).json(property);

        console.log("Data inserted successfully!");
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllProperties = async(req, res) => {
    try{
        const properties = await Property.find({});
    
        if(!properties){
            res.status(404).json({message : "Properties not found"});
        }
    
        res.status(201).json(properties);
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}

const getPropertyById = async(req, res) => {
    try{
        const property = await Property.findById(id);

        if(!property){
            res.status(404).json({message: 'Property not found'});
        }
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}

// const getPropertyByQuery = async(req, res) => {
//     try{
//         const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
//         const limit = parseInt(req.query.limit) || 9;
//         const skip = (page - 1) * limit;

//         const properties = await Property.find({})
//         .select('images address area rooms.bedrooms rooms.bathrooms rooms.balconies price')
//         .skip(skip)
//         .limit(limit);

//         if(!properties){
//             res.status(404).json({message: 'Property not found'});
//         }

//         res.status(201).json(properties);

//     }catch(error){
//         return res.status(500).json({message : error.message});
//     }
// }

const initialRequest = asyncHandler(async (req, res) => {

    const accessToken = req.headers.authorization.replace('Bearer ', '');

    console.log(accessToken);
    if (!accessToken) {
        throw new ApiError(401, "Unauthorized Request: Access Token missing check your frontend");
    }

    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded Token: ", decodedToken);

    const buyer = await Buyer.findById(decodedToken?._id)
        .select('-password -refreshToken');

    // const buyer = req.buyer;
    const area = buyer.preferences.area;
    const city = buyer.preferences.city;
    const price = buyer.preferences.price;
    const propertyType = buyer.preferences.propertyType;
    const state = buyer.preferences.state;

    console.log(buyer);

    let query = {}

    if(area.min && area.max){
        query.area = { $gte: area.min, $lte: area.max };
    }

    if(price.min && price.max){
        query.price = { $gte : price.min, $lte: price.max};
    }

    if(propertyType){
        query.propertyType = propertyType;
    }

    if(state){
        query.state = state;
    }

    if(city){
        query.city = {$in: city};
    }

    console.log(query);

    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const properties = await Property.find(query)
    .select('images address area rooms.bedrooms rooms.bathrooms rooms.balconies price')
    .sort({ 'area': 1 })
    .skip(skip)
    .limit(limit);

    // Check if properties were found
    if (!properties || properties.length === 0) {
        throw new ApiError(404, "Properties not found");
    }

    // Send properties in the response
    return res
    .status(200)
    .json(new ApiResponse(200, {preferences : buyer.preferences, properties}, "Properties by buyers preference"));

})

const getPropertyByFilters = async (req, res) => {
    try {
        
        let query = {};

        // Extract values from headers
        const selectedCityString = req.headers['selected-city'];
        const selectedPropertyTypeString = req.headers['selected-property-type'];

        // Add values from headers to the query if they exist
        if (selectedPropertyTypeString) {
            query.propertyType = { $in: selectedPropertyTypeString.split(',') };
        }
        if (selectedCityString) {
            query.city = { $in: selectedCityString.split(',') };
        }

        // Add other query parameters from request URL
        if (req.query.state && req.query.state != 'Select State') {
            query.state = req.query.state;
        }
        if (req.query.minArea && req.query.maxArea) {
            query.area = { $gte: req.query.minArea, $lte: req.query.maxArea };
        }
        if(req.query.minPrice && req.query.maxPrice){
            query.price = { $gte: req.query.minPrice, $lte: req.query.maxPrice };
        }

        const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;
        

        // Query properties
        const properties = await Property.find(query)
            .select('images address area rooms.bedrooms rooms.bathrooms rooms.balconies price')
            .sort({ 'area': 1 })
            .skip(skip)
            .limit(limit);

        // Check if properties were found
        if (!properties || properties.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Send properties in the response
        return res.status(200).json(properties);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const updatePropertyById = async (req, res) => {
    const {id} = req.params;
    const updates = req.body;

    try {
        const updatedProperty = await Property.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.status(201).json(updatedProperty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deletePropertyById = async (req, res) => {
    const {id} = req.params;
    
    try{
        const property = await Property.findByIdAndDelete(id);

        if(!property){
            return res.status(404).json({message: "property not found"});
        }

        res.status(201).json({message: "Property deleted Sucessfully"});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}

export {
    createProperty,
    getAllProperties,
    getPropertyById,
    updatePropertyById,
    deletePropertyById,
    getPropertyByFilters,
    initialRequest
}