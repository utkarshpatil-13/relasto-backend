import Buyer from "../models/buyer.models.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const createBuyer = async (req, res) => {
  const { firstname, lastname, email, password, phone } = req.body;
  try {
    const existingBuyer = await Buyer.findOne({ email, phone });

    if (existingBuyer) {
      return res.status(400).json({ message: "Buyer already exists" });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    // const buyer = Buyer.create({
    //     firstname,
    //     lastname,
    //     email,
    //     password: hashedPassword,
    //     phone,
    // });

    const buyer = Buyer.create({
      firstname,
      lastname,
      email,
      password,
      phone,
    });

    return res.status(201).json(buyer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const authenticateBuyer = async (req, res) => {
  const { email, password } = req.body;

  try {
    const buyer = await Buyer.findOne({ email });

    if (!buyer) {
      res.status(404).json({ isAuthenticated: false });
    }

    const isPasswordValid = await bcrypt.compare(password, buyer.password);

    if (!isPasswordValid) {
      return res.status(401).json({ isAuthenticated: false });
    }

    return res.status(201).json(buyer._id);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.find({});

    if (!buyers) {
      res.status(404).json({ message: "Buyers not found" });
    }

    return res.status(201).json(buyers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBuyerById = async (req, res) => {
  const id = req.params.id;

  try {
    const buyer = await Buyer.findById(id);

    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    return res.status(201).json(buyer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBuyerById = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const updatedBuyer = await Buyer.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedBuyer) {
      res.status(404).json({ message: "Buyer not found" });
    }

    return res.status(201).json(updatedBuyer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBuyerById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBuyer = await Buyer.findByIdAndDelete(id);

    if (!deletedBuyer) {
      res.status(404).json({ message: "Buyer not found" });
    }

    return res.status(201).json({ message: "Buyer Deleted Sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// hitesh codes
const registerUser = asyncHandler(async (req, res) => {
  // get user details
  // do validation  - empty or not / password 8 characters
  // check if the user already exists or not
  // check for images, check avatar
  // upload to cloudinary, avatar
  // create a buyer object - create entry in collection
  // remove password and refresh token field from response
  // check buyer creation
  // return res

  const { firstname, lastname, email, password, phone } = req.body;

  // some returns me true or false result based on given condition
  if (
    [firstname, lastname, email, password, phone].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required!");
  }

  const existedBuyer = await Buyer.findOne({
    $or: [{ email }, { phone }],
  });

  if (existedBuyer) {
    throw new ApiError(409, "Buyer with same email or phone exists");
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

  const buyer = await Buyer.create({
    firstname,
    lastname,
    email,
    phone,
    password,
    profilePhoto: profilePhoto?.url || "",
  });

  // disselect password and refreshToken
  const createdBuyer = await Buyer.findById(buyer._id).select(
    "-password -refreshToken"
  );

  // throw error if Buyer is not registered
  if (!createdBuyer) {
    throw new ApiError(500, "Something went wrong while registering the Buyer");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdBuyer, "Buyer Registered Successfully"));
});

const generateAccessAndRefreshToken = async (buyerId) => {
  try {
    const buyer = await Buyer.findById(buyerId);

    const refreshToken = await buyer.generateRefreshToken();
    const accessToken = await buyer.generateAccessToken();

    buyer.refreshToken = refreshToken;
    await buyer.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  // get the data from buyer {email, password}
  // validate the data - empty || 8 characters password
  // check if the user exists
  // authenticate the user
  // generate the access and refresh token
  // create cookie and store token into it
  // send res

  // step 1 - collect data
  const { email, password } = req.body;

  // step 2 - check validation
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Email and Password are required!");
  }

  // step 3 - check for buyer
  const buyer = await Buyer.findOne({ email });

  if (!buyer) {
    throw new ApiError(404, "Buyer doesn't exist!");
  }

  // step 4 - check for password
  const isPasswordValid = await buyer.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid buyer credentials");
  }

  // step 5 - generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    buyer._id
  );

  // step 6 - collect data to send to frontend
  const loggedInBuyer = await Buyer.findById(buyer._id).select(
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
        buyer: loggedInBuyer,
        accessToken,
        refreshToken,
      },
      "Hi " + loggedInBuyer.firstname + "! You are successfully logged in !"
    )
  );
});

// const logoutUser = asyncHandler( async(req, res) => {
//     const buyer = req.buyer;

//     console.log(buyer);
//     await Buyer.findByIdAndUpdate(buyer._id, {
//         $unset: {
//             refreshToken: 1
//         }
//     },{
//         new: true
//     })

//     // const options = {
//     //     httpOnly: true,
//     //     secure: true
//     // }

//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');

//     return res
//     .status(201)
//     .json(new ApiResponse(200, {}, "User logged out successfully"));
// })

const logoutUser = asyncHandler(async (req, res) => {
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

  const buyer = await Buyer.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );

  console.log(buyer);
  await Buyer.findByIdAndUpdate(
    buyer._id,
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
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refereshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Access");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const buyer = await Buyer.findById(decodedToken?._id);

    if (!buyer) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== buyer.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or not used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(buyer._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid Refresh Token");
  }
});

export {
  createBuyer,
  authenticateBuyer,
  getAllBuyers,
  getBuyerById,
  updateBuyerById,
  deleteBuyerById,
  registerUser,
  loginUser,
  logoutUser,
  refereshAccessToken,
};
