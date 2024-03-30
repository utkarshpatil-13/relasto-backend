import { Router } from "express";
import { getSellerById, getAllSellers, createSeller, updateSellerById, deleteSellerById, authenticateSeller } from "../controllers/seller.controllers.js";

const router = Router();

router.get('/', getAllSellers);
router.get('/:id', getSellerById);
router.post('/auth', authenticateSeller);
router.post('/', createSeller);
router.put('/:id', updateSellerById);
router.delete('/:id', deleteSellerById);

export default router;