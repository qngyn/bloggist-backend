// const mongoose = require('mongoose');
import mongoose, {Schema} from 'mongoose';
//schema 
const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        }, 
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        shares: {
            type: Number,
            default: 0,
        },
        posts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
                
            }
        ],

    },{
        timestamps: true,
    }
);

const Category = mongoose.model("Category", categorySchema)

export default Category;
// module.exports = Category