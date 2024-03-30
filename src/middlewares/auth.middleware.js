import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt  from "jsonwebtoken";
import Buyer from "../models/buyer.models.js";

export const verifyJwt = asyncHandler( async(req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers('Authorization').replace('Bearer ', '');
        console.log(token);
        
        if(!token) {
            throw new ApiError(401, "Unauthorized Request");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const buyer = await Buyer.findById(decodedToken?._id)
        .select('-password -refreshToken');
    
        if(!buyer){
            throw new ApiError(401, 'Invalid Access Token');
        }
    
        req.buyer = buyer;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
})