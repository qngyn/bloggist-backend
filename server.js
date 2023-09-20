import http from 'http';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/globalErrorHandler.js';
import categoriesRouter from './routes/categories/categoriesRouter.js';
import usersRouter from './routes/users/usersRouter.js';
import postsRouter from './routes/posts/postsRouter.js';
import commentRouter from './routes/comments/commentsRouter.js';
import sendEmail from './utils/sendEmail.js';
import { send } from 'process';

dotenv.config();


// sendEmail("ngth.ngquynh@gmail.com", '138438HBE');
connectDB();


//Server
const app = express();
app.use(cors());


//Middleware
app.use(express.json()); //parse json data from the body
//Routes
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/categories', categoriesRouter)
app.use('/api/v1/posts', postsRouter)
app.use('/api/v1/comments', commentRouter)

const server = http.createServer(app); //create more flexibility to extend more functionality about the server

//not found middleware
app.use(notFoundHandler)

//error middleware
app.use(globalErrorHandler);

//Start the server
const PORT = process.env.PORT || 3001; 
server.listen(PORT, console.log(`Server is running on port ${PORT}`))