import express from 'express'
import isLogin from '../../middlewares/isLogin.js';
import isAccountVerified from '../../middlewares/isAccountVerified.js';
import {
    createPost, 
    updatePost, 
    deletePost, 
    getPost, 
    getPosts, 
    getPublicPosts,
    likePost,
    disLikePost, 
    clappingPost,
    schedulePost
} from '../../controllers/posts/postsControllers.js'
import storage from '../../utils/fileUpload.js';
import multer from 'multer';

const postsRouter = express.Router();

//file upload middleware
const upload = multer({ storage });
//create post 
postsRouter.post('/', isLogin, upload.single('file'), createPost)

//get all posts
postsRouter.get('/', isLogin, getPosts)

//get a post
postsRouter.get('/:id', getPost)

//get public post (5)
postsRouter.get('/public', getPublicPosts);

//update post 
postsRouter.put('/:id', isLogin, updatePost)

//delete post
postsRouter.delete('/:id', isLogin, deletePost)

//like post 
postsRouter.put("/likes/:id", isLogin, likePost);

//dislike post 
postsRouter.put("/dislikes/:id", isLogin, disLikePost);

//clapping at post 
postsRouter.put("/claps/:id", isLogin, clappingPost);

//schedule post
postsRouter.put("/schedule/:postId", isLogin, schedulePost);

export default postsRouter;