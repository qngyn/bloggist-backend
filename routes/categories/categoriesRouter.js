import express from 'express'
import { createCategory, getCategories, deleteCategory, updateCategory } from '../../controllers/categories/categoriesControllers.js';
import isLogin from '../../middlewares/isLogin.js';

const categoriesRouter = express.Router();
categoriesRouter.post('/', isLogin ,createCategory)
categoriesRouter.get('/', getCategories)
categoriesRouter.delete('/:id', isLogin, deleteCategory);
categoriesRouter.put("/:id", isLogin, updateCategory)

export default categoriesRouter;