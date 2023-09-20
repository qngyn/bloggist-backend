import express from 'express'
import { createComment, deleteComment, updateComment } from '../../controllers/comments/commentsControllers.js';
import isLogin from '../../middlewares/isLogin.js';

const commentsRouter = express.Router();
commentsRouter.post('/:postId', isLogin, createComment)
commentsRouter.put('/:id', isLogin, updateComment)
commentsRouter.delete('/:id', isLogin, deleteComment)

export default commentsRouter;