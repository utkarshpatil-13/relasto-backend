import { Router } from "express";
import { createProperty, getAllProperties, getPropertyById, updatePropertyById, deletePropertyById, getPropertyByFilters, initialRequest } from "../controllers/property.controllers.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";
import {upload} from '../middlewares/multer.middleware.js' 

const router = Router();

router.get('/', getAllProperties);
router.get('/id/:id', getPropertyById);
router.route('/filters').get(getPropertyByFilters);
router.route('/').post(upload.fields([
        {
            name: "images",
            maxCount: 7
        },
    ]), createProperty);
router.put('/:id', updatePropertyById);
router.delete('/:id', deletePropertyById);

router.route('/initial-req').get(initialRequest);

export default router;