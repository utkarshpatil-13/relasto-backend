import Seller from "../models/seller.models.js";
import bcrypt from 'bcrypt'

const createSeller = async(req, res) => {
    const {companyName, contactPerson, email, password, phone, properties} = req.body;
    try{
        const existingSeller = await Seller.findOne({email});
        
        if(existingSeller){
            return res.status(400).json({message: 'Seller already exists'});
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
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}

const authenticateSeller = async(req, res) => {

    const {email, password} = req.body;

    try{
        const seller = await Seller.findOne({email});

        if(!seller) {
            return res.status(404).json({isAuthenticated: false});
        }

        const isPasswordValid = await bcrypt.compare(password, seller.password);

        if(!isPasswordValid){
            return res.status(401).json({isAuthenticated: false});
        }

        return res.status(201).json(seller._id);
    }
    catch(error){
        res.status(500).json({message : error.message});
    }
}

const getAllSellers = async (req, res) => {
    try{
        const sellers = await Seller.find({});

        if(!sellers){
            res.status(404).json({message: 'Sellers not found'});
        }

        res.status(201).json(sellers);
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}

const getSellerById = async (req, res) => {
    const { id } = req.params;

    try{
        const seller = await Seller.findById(id);

        if(!seller){
            return res.status(404).json({message: "Seller not found"});
        }

        res.status(201).json(seller);
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}

const updateSellerById = async(req, res) => {
    try{
        const {id} = req.params;
        const updates = req.body;
    
        const updatedSeller = await Seller.findByIdAndUpdate(id, updates, {new: true});
    
        if(!updatedSeller){
            res.status(404).json({message: 'Seller not found'});
        }
    
        res.status(201).json(updatedSeller);
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
}

const deleteSellerById = async (req, res) => {
    try{
        const {id} = req.params;

        const deletedSeller = req.findByIdAndDelete(id);

        if(!deletedSeller){
            res.status(404).json({message: 'Seller not found'});
        }

        res.status(201).json({message: 'Seller Deleted Sucessfully'});
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

export {
    createSeller,
    authenticateSeller,
    getAllSellers,
    getSellerById,
    updateSellerById,
    deleteSellerById,
} 