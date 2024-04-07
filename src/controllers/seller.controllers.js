import Seller from "../models/seller.models.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const createSeller = async (req, res) => {
    const { companyName, contactPerson, email, password, phone, properties } =
        req.body;
    try {
        const existingSeller = await Seller.findOne({ email });

        if (existingSeller) {
            return res.status(400).json({ message: "Seller already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const seller = Seller.create({
            companyName,
            contactPerson,
            email,
            password: hashedPassword,
            phone,
            properties,
        });

        res.status(201).json(seller);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const authenticateSeller = async (req, res) => {
    const { email, password } = req.body;

    try {
        const seller = await Seller.findOne({ email });

        if (!seller) {
            return res.status(404).json({ isAuthenticated: false });
        }

        const isPasswordValid = await bcrypt.compare(password, seller.password);

        if (!isPasswordValid) {
            return res.status(401).json({ isAuthenticated: false });
        }

        return res.status(201).json(seller._id);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllSellers = async (req, res) => {
    try {
        const sellers = await Seller.find({});

        if (!sellers) {
            res.status(404).json({ message: "Sellers not found" });
        }

        res.status(201).json(sellers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSellerById = async (req, res) => {
    const { id } = req.params;

    try {
        const seller = await Seller.findById(id);

        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        res.status(201).json(seller);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSellerById = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedSeller = await Seller.findByIdAndUpdate(id, updates, {
            new: true,
        });

        if (!updatedSeller) {
            res.status(404).json({ message: "Seller not found" });
        }

        res.status(201).json(updatedSeller);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSellerById = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSeller = req.findByIdAndDelete(id);

        if (!deletedSeller) {
            res.status(404).json({ message: "Seller not found" });
        }

        res.status(201).json({ message: "Seller Deleted Sucessfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerSeller = asyncHandler(async (req, res) => {
    // get user details
    // do validation  - empty or not / password 8 characters
    // check if the user already exists or not
    // check for images, check avatar
    // upload to cloudinary, avatar
    // create a seller object - create entry in collection
    // remove password and refresh token field from response
    // check seller creation
    // return res

    const { name, email, password, phone } = req.body;

    // some returns me true or false result based on given condition
    if (
        [name, email, password, phone].some(
            (field) => field === ""
        )
    ) {
        throw new ApiError(400, "All Fields are required!");
    }

    const existedSeller = await Seller.findOne({
        $or: [{ email }, { phone }],
    });

    if (existedSeller) {
        throw new ApiError(409, "Seller with same email or phone exists");
    }

    // const profilePhotoLocalPath = req.files?.profilePhoto[0]?.path;

    let profilePhotoLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.profilePhoto) &&
        req.files.profilePhoto.length > 0
    ) {
        profilePhotoLocalPath = req.files.profilePhoto[0].path;
    }

    // if profile photo is necessary
    // if(!profilePhotoLocalPath){
    //     throw new ApiError(400, "Profile Photo required");
    // }

    const profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath);

    // if(!profilePhoto){
    //     throw new ApiError(400, "Profile Photo not added");
    // }

    const seller = await Seller.create({
        name,
        email,
        phone,
        password,
        profilePhoto: profilePhoto?.url || "",
    });

    // disselect password and refreshToken
    const createdSeller = await Seller.findById(seller._id).select(
        "-password -refreshToken"
    );

    // throw error if Seller is not registered
    if (!createdSeller) {
        throw new ApiError(
            500,
            "Something went wrong while registering the Seller"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdSeller, "Seller Registered Successfully")
        );
});

const generateAccessAndRefreshToken = async (sellerId) => {
    try {
      const seller = await Seller.findById(sellerId);
  
      const refreshToken = await seller.generateRefreshToken();
      const accessToken = await seller.generateAccessToken();
  
      seller.refreshToken = refreshToken;
      await seller.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong while generating access and refresh tokens"
      );
    }
  };

const loginSeller = asyncHandler(async (req, res) => {
    // get the data from seller {email, password}
    // validate the data - empty || 8 characters password
    // check if the user exists
    // authenticate the user
    // generate the access and refresh token
    // create cookie and store token into it
    // send res
  
    // step 1 - collect data
    const { email, password } = req.body;
  
    // step 2 - check validation
    if ([email, password].some((field) => field === "")) {
      throw new ApiError(400, "Email and Password are required!");
    }
  
    // step 3 - check for seller
    const seller = await Seller.findOne({ email });
  
    if (!seller) {
      throw new ApiError(404, "Seller doesn't exist!");
    }
  
    // step 4 - check for password
    const isPasswordValid = await seller.isPasswordCorrect(password);
  
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid seller credentials");
    }
  
    // step 5 - generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      seller._id
    );
  
    // step 6 - collect data to send to frontend
    const loggedInSeller = await Seller.findById(seller._id).select(
      "-password -refreshToken"
    );
  
    // step 7 - set up cookie options and send response
    // const options = {
    //     httpOnly: true,
    //     secure: true
    // }
  
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          seller: loggedInSeller,
          accessToken,
          refreshToken,
        },
        "Hi " + loggedInSeller.name + "! You are successfully logged in !"
      )
    );
  });

  const logoutSeller = asyncHandler(async (req, res) => {
    const accessToken = req.headers.authorization.replace("Bearer ", "");
  
    console.log(accessToken);
    if (!accessToken) {
      throw new ApiError(
        401,
        "Unauthorized Request: Access Token missing check your frontend"
      );
    }
  
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded Token: ", decodedToken);
  
    const seller = await Seller.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
  
    console.log(seller);
    await Seller.findByIdAndUpdate(
      seller._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );
  
    return res
      .status(201)
      .json(new ApiResponse(200, {}, "Seller logged out successfully"));
  });

export {
    createSeller,
    authenticateSeller,
    getAllSellers,
    getSellerById,
    updateSellerById,
    deleteSellerById,
    registerSeller,
    loginSeller,
    logoutSeller
};
