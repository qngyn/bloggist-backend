import express from 'express'
import { 
    register, 
    login, 
    profile,
    blockUser,
    unblockUser,
    profileViewers,
    followingUsers,
    unFollowingUser,
    forgotPassword,
    resetPassword, 
    verifyAccountEmail,
    verifyAccount
} from '../../controllers/users/usersControllers.js';
import isLogin from '../../middlewares/isLogin.js';
import storage from '../../utils/fileUpload.js';
import multer from 'multer';


const usersRouter = express.Router();

const upload = multer({ storage });

//register
usersRouter.post('/register', upload.single('profilePic'), register); 

//login
usersRouter.post('/login', login); 

//profile
usersRouter.get('/profile/', isLogin, profile); 

//block user
usersRouter.put('/block/:userIdToBlock', isLogin, blockUser); 

//unblock user
usersRouter.put('/unblock/:userIdToUnBlock', isLogin, unblockUser); 

//profile viewers
usersRouter.get('/profile-viewer/:userProfileId', isLogin, profileViewers); 

//following users
usersRouter.put('/following/:userToFollowId', isLogin, followingUsers); 

//unfollowing users
usersRouter.put("/unfollowing/:userToUnFollowId", isLogin, unFollowingUser); 

//forgot password
usersRouter.post('/forgot-password', forgotPassword);

//reset password
usersRouter.put('/reset-password/:resetToken', resetPassword)

//verify account email /api/v1/users/verify-account
usersRouter.put("/account-verification-email", isLogin, verifyAccountEmail);

//verify account 
usersRouter.get("/account-verification/:verifyToken", isLogin, verifyAccount);

//export 
export default usersRouter;
