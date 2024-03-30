import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    buyerId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Buyer',
    },
    sellerId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Seller',
    },
    content: {
        type: String,
    },
},
{
    timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);

export default Message;