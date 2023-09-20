import asyncHandler from "express-async-handler";
import expressAsyncHandler from "express-async-handler";
import Post from "../../model/Post/Post.js";
import User from "../../model/User/User.js";
import Category from "../../model/Category/Category.js";

//create new post
//post
//access private
const createPost = asyncHandler(async (req, res) => {
    //get the payload 
    const {title, content, categoryId} = req.body

    //check if post exists
    const foundPost = await Post.findOne({title})
    if (foundPost) {
        throw new Error('Post already exists')
    }
    //create new post
    const post = await Post.create({
        title, 
        content, 
        category: categoryId, 
        author: req?.userAuth?._id,
        image: req?.file?.path,
    })
    //associate the post with the user
    const user = User.findByIdAndUpdate(
        req?.userAuth?._id, 
        {
        $push: {posts: post?._id}
        }, 
        {
            new: true
        }
    )
    //push post into category
    await Category.findByIdAndUpdate(
        req?.userAuth?._id,
        {
          $push: { posts: post._id },
        },
        {
          new: true,
        }
    )

    //send response
    res.json({
        status: "success",
        message: "post created successfully",
        post,
      })
})

// get all posts
// get /API/v1/posts
// access public
const getPosts = asyncHandler(async (req, res) => { 
    //get the user who have blocked the logged-in user
    const loggedInUserId = req.userAuth?._id;

    //the users who have blocked the logged-in user unable to see the post of the logged-in user
    const usersBlockingLoggedInuser = await User.find({
        blockedUsers: loggedInUserId,
    });
    const blockingUsersIds = usersBlockingLoggedInuser?.map((user) => user?._id);

    //get the current time -> prevent seeing the schedule post 
    const currentTime = new Date();

    let query = {
        author: { $nin: blockingUsersIds },
        $or: [
          {
            schedulePublished: { $lte: currentTime },
            schedulePublished: null,
          },
        ],
    };

    const posts = await Post
        .find(query)
        .populate({
            path: "author",
            model: "User",
            select: "email role username",
        })
        .populate("category")

    res.json({
        status: "success",
        message: "posts fetched successfully",
        posts,
    })

})

// get one post
// get /API/v1/posts/:id
// access public
const getPost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('comments')
    res.status(201).json({
        status: "success",
        message: "post fetched successfully",
        post,
    })
})

// update a post
// put /api/v1/posts/:id
// access private
const updatePost = asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    )

    res.status(201).json({
        status: "success",
        message: "post updated successfully",
        post,
    })
})

//get only 5 posts
//get /api/v1/posts
//access public

const getPublicPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({}).sort({
         createdAt: -1 
        }).limit(5)
        .populate("category")

    res.status(201).json({
      status: "success",
      message: "Posts successfully fetched",
      posts,
    })

})

//delete a post
// delete /api/v1/posts/:id
// access private
const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    res.status(201).json({
        status: "success",
        message: "post deleted successfully",
    });
});

//like a post 
//put /api/v1/posts/likes/:id
// access private
const likePost = expressAsyncHandler(async (req, res) => {
    //get the id of the post
    const { id } = req.params;

    //get the login user
    const userId = req.userAuth._id;

    //find the post
    const post = await Post.findById(id);
    if (!post) {
      throw new Error("post not found or it has been removed");
    }

    //push the user into post likes
    await Post.findByIdAndUpdate(
      id,
      {
        $addToSet: { likes: userId },
      },
      { new: true }
    )

    // remove the user from the dislikes array if present
    post.dislikes = post.dislikes.filter(
      (dislike) => dislike.toString() !== userId.toString()
    )

    //resave the post
    await post.save();
    res.status(200).json({ 
        message: "post successfully liked.", 
        post 
    })
})

//dislike a post 
//put /api/v1/posts/dislikes/:id
// access private

const disLikePost = expressAsyncHandler(async (req, res) => {
    //get the id of the post
    const { id } = req.params;

    //get the login user
    const userId = req.userAuth._id;

    //find the post
    const post = await Post.findById(id);
    if (!post) {
      throw new Error("post not found or it has been removed");
    }

    //push the user into post dislikes
    await Post.findByIdAndUpdate(
      id,
      {
        $addToSet: { dislikes: userId },
      },
      { new: true }
    )

    // remove the user from the likes array if present
    post.likes = post.likes.filter(
      (like) => like.toString() !== userId.toString()
    )

    //resave the post
    await post.save();
    res.status(200).json({ 
        message: "post successfully disliked",
        post });
})

//@desc   clapong a Post
//@route  PUT /api/v1/posts/claps/:id
//@access Private

const clappingPost = expressAsyncHandler(async (req, res) => {
    //get the id of the post
    const { id } = req.params;

    //find the post
    const post = await Post.findById(id);

    if (!post) {
      throw new Error("post not found or it has been removed");
    }
    //implement the claps
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        $inc: { claps: 1 },
      },
      {
        new: true,
      }
    )
    res.status(200).json({ 
        message: "Post clapped successfully.", 
        updatedPost 
    })

})

const schedulePost = expressAsyncHandler(async (req, res) => {
    //get the payload
    const { scheduledPublish } = req.body;
    const { postId } = req.params;


    //check if postid and scheduledpublished found
    if (!postId || !scheduledPublish) {
      throw new Error("PostID and schedule date are required");
    }

    //find the post
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }
    //check if the user is the author of the post
    if (post.author.toString() !== req.userAuth._id.toString()) {
      throw new Error("You can schedulle your own post ");
    }

    // check if the scheduledPublish date is in the past
    const scheduleDate = new Date(scheduledPublish);
    const currentDate = new Date();
    if (scheduleDate < currentDate) {
      throw new Error("The scheduled publish date cannot be in the past. Try again!");
    }

    //update the post
    post.schedulePublished = scheduledPublish;
    await post.save();
    res.json({
      status: "success",
      message: "post successfully scheduled",
      post,
    })
  })
  
export { 
    createPost, 
    getPosts,
    getPost, 
    updatePost, 
    deletePost, 
    getPublicPosts,
    likePost,
    disLikePost,
    clappingPost,
    schedulePost
}
