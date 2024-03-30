import { Router } from "express";
import { createProperty, getAllProperties, getPropertyById, updatePropertyById, deletePropertyById, getPropertyByFilters, initialRequest } from "../controllers/property.controllers.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/', getAllProperties);
router.route('/filters').get(getPropertyByFilters);
router.post('/', createProperty);
router.put('/:id', updatePropertyById);
router.delete('/:id', deletePropertyById);

router.route('/initial-req').get(initialRequest);

export default router;