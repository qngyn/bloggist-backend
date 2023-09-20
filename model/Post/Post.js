// const mongoose = require('mongoose');
import mongoose, {Schema} from 'mongoose';
//schema 
const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        }, 
        image: {
            type: String,
            default: true,
        }, 
        claps: {
            type: Number,
            default: 0,
        }, 
        content: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Category'
        },
        schedulePublished: {
            type: Date,
            default:null,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
                
            }
        ],
        dislikes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
                
            }
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment'
                
            }
        ],


    },
    {
        timestamps: true,
        toJSON: {
          virtuals: true,
        },
        toObject: {
          virtuals: true,
        },
    }
);

const Post = mongoose.model("Post", postSchema)

export default Post;