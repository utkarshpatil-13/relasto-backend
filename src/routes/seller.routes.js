import { Router } from "express";
import { getSellerById, getAllSellers, createSeller, updateSellerById, deleteSellerById, authenticateSeller, registerSeller, loginSeller, logoutSeller } from "../controllers/seller.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get('/', getAllSellers);
router.get('/:id', getSellerById);
router.post('/auth', authenticateSeller);
router.post('/', createSeller);
router.put('/:id', updateSellerById);
router.delete('/:id', deleteSellerById);

router.route('/register').post( upload.fields([
    {
        "name" : "profilePhoto",
        "maxCount" : 1
    }
]), registerSeller);
router.route('/login').post(loginSeller);
router.route('/logout').get(logoutSeller);

export default router;