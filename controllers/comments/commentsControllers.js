import asyncHandler from "express-async-handler";
import mongoose from 'mongoose'
import Comment from "../../model/Comment/Comment.js";
import Post from "../../model/Post/Post.js";

//create a new comment
//post
//access private

const createComment = asyncHandler(async (req, res) => {
    //get the payload
    const { text, author } = req.body;
    const postId = req.params.postId;
    //create comment 
    const comment = await Comment.create({
        text,
        author: req?.userAuth?._id,
        postId,
    });

    //push comment into post
    await Post.findByIdAndUpdate(postId, {
        $push: { comments: comment._id },
    }, {
        new: true,
    });
    //return response
    res.json({
        status: "success",
        message: "comment created successfully",
        comment
    })
})

// update a comment
// put /api/v1/comments/:id
// access private

const updateComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findByIdAndUpdate(
        req.params.id,
      {
        text: req.body.text,
      },
      {
        new: true,
      }
    );
    res.status(201).json({
      status: "success",
      message: "Comment successfully updated",
      comment,
    })

  });

//delete comment
// delete /api/v1/comments/:id
// access private

const deleteComment = asyncHandler(async (req, res) => {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(201).json({
      status: "success",
      message: "Comment successfully deleted",
    });
  });

export { createComment, updateComment, deleteComment }

