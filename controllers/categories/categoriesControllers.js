import Category from "../../model/Category/Category.js";
import asyncHandler from "express-async-handler";
import mongoose from 'mongoose'

//create new category
//post 
//access private
const createCategory = asyncHandler(async (req, res) => {
    const {name, author} = req.body

    //if exists
    const categoryFound = await Category.findOne({name})

    if(categoryFound) {
        throw new Error('Category already exists')
    } 
    const category = await Category.create({
        name: name, 
        author: req.userAuth?._id
    })

    res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        category,
    });
});

//get all catergories
// get
// access private

const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category
                            .find({})
                            .populate({
                              path: "posts",
                              model: "Post",
                            });

    res.status(201).json({
        status: 'success',
        message: 'Categories fetched successfully',
        categories,
    })
    
});

//update all catergories
// put
// access private

const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
      {
        name: req.body.name,
      },
      {
        new: true,
      }
    );
    res.status(201).json({
      status: "success",
      message: "Categories successfully updated",
      category,
    })

  });

//delete all catergories
// delete /api/v1/categories/:id
// access private

const deleteCategory = asyncHandler(async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.status(201).json({
      status: "success",
      message: "Categoryies successfully deleted",
    });
  });

export {createCategory, getCategories, updateCategory, deleteCategory}