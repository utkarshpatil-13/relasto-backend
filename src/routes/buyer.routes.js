import { Router } from "express";

const router = Router();

import { getAllBuyers, getBuyerById, updateBuyerById, deleteBuyerById, createBuyer, authenticateBuyer, registerUser, loginUser, logoutUser, refereshAccessToken } from "../controllers/buyer.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

router.get('/', getAllBuyers);
router.get('/:id', getBuyerById);
router.post('/auth', authenticateBuyer);
router.post('/', createBuyer);
router.put('/:id', updateBuyerById);
router.delete('/:id', deleteBuyerById);

// hitesh codes
import { upload } from "../middlewares/multer.middleware.js";

router.route('/register').post(
    upload.fields([
        {
            name: "profilePhoto",
            maxCount: 1
        },
    ]),
    registerUser
)

router.route('/login').post(loginUser);

// secured Routes
router.route('/logout').get(logoutUser);
router.route('/refresh-token').post(refereshAccessToken);

export default router;