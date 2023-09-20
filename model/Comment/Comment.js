// const mongoose = require('mongoose');
import mongoose, {Schema} from 'mongoose';
//schema 
const commentSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
        }, 
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Post'
        },

    },{
        timestamps: true,
    }
);

const Comment = mongoose.model("Comment", commentSchema)

export default Comment;
// module.exports = Comment