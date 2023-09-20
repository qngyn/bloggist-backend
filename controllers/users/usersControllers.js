// register a new user 
// route POST /api/v1/users/register 
// access public
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from "../../model/User/User.js";
import generateToken from '../../utils/generateToken.js';
import asyncHandler from "express-async-handler";
import expressAsyncHandler from 'express-async-handler';
import sendEmail from '../../utils/sendEmail.js';
import sendVerification from '../../utils/sendAccountVerification.js';


const register = asyncHandler(async (req, res) => {
    // try {
    const {username, password, email } = req.body

    //check if user exists
    const user = await User.findOne({username})
    if(user) {
        throw new Error('User already exists')
    }

    //create new user
    const newUser = new User({
        username, 
        email, 
        password,
        profilePicture: user?.profilePic
    })
    //hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    await newUser.save()
    res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        _id: newUser?._id,
        username: newUser?.username,
        email: newUser?.email,
        role: newUser?.role,
    })
    // } catch (error) {
    //     res.json({
    //         status: 'error',
    //         message: error?.message
    //     })

    // }
})

// login a new user 
// route POST /api/v1/users/login 
// access public
const login = asyncHandler(async (req, res) => {
    // try {
    const {username, password} = req.body

    //check if user exists
    const user = await User.findOne({username})

    if (!user) {
        throw new Error('Invalid username or password')
    } 

    //compare password
    const isMatch = await bcrypt.compare(password, user?.password) 
    if(!isMatch) {
        throw new Error('Invalid username or password')
    }

    //update last login
    user.lastLogin = new Date()
    res.json({
        status: 'success',
        email: user?.email,
        _id: user?._id,
        username: user?.username,
        role: user?.role,
        token: generateToken(user)
    })
// } catch (error) {
//     res.json({
//         status: 'error',
//         message: error?.message
//     })
// }
})

// get profile
// route get /api/v1/users/profile/ 
// access private
const profile = asyncHandler(async (req, res, next) => {
    //console.log(req.userAuth)
    // try {
        //get user id from params
    const user = await User
      .findById(req.userAuth._id)
      .populate({
        path: "posts",
        model: "Post",
      })
      .populate({
        path: "following",
        model: "User",
      })
      .populate({
        path: "followers",
        model: "User",
      })
      .populate({
        path: "blockedUsers",
        model: "User",
      })
      .populate({
        path: "profileViewers",
        model: "User",
      })

    res.json({
        status: 'success',
        message: 'User profile fetched successfully',
        user,
    });

    // } catch (error){
    //     res.json({
    //         status: 'error',
    //         message: error?.message
    //     })
    // }
})

// block a user
// route put /api/v1/users/block/:userIdToBlock
// access private
const blockUser = asyncHandler(async (req, res) => {
    //find user to block
    const userIdToBlock = req.params.userIdToBlock;
    const userToBlock = await User.findById(userIdToBlock);

    //check if user exists
    if (!userToBlock) {
      throw new Error("user to block not found");
    }

    //user who is blocking 
    const userBlocking = req.userAuth._id;

    // check if user is blocking itself
    if (userIdToBlock.toString() === userBlocking.toString()) {
      throw new Error("cannot block yourself");
    }

    //find the current user
    const currentUser = await User.findById(userBlocking);
    // Check if user already blocked
    if (currentUser?.blockedUsers?.includes(userIdToBlock)) {
      throw new Error("user already blocked");
    }
    //push the user to be blocked in the array of the current user
    currentUser.blockedUsers.push(userIdToBlock);

    await currentUser.save();

    res.json({
      message: "user successfully blocked",
      status: "success",
    });
});



// unblock a user
// route put /api/v1/users/unblock/:userIDToUnBlock
// access private  
const unblockUser = asyncHandler(async (req, res) => {
    //find user to unblock
    const userIdToUnBlock = req.params.userIdToUnBlock;
    const userToUnBlock = await User.findById(userIdToUnBlock);


    if (!userToUnBlock) {
      throw new Error("user to be unblock not found");
    }

    //find the current user
    const userUnBlocking = req.userAuth._id;
    const currentUser = await User.findById(userUnBlocking);
  
    //check if user is blocked before unblocking
    if (!currentUser.blockedUsers.includes(userIdToUnBlock)) {
      throw new Error("user not block");
    }

    //remove the user from the current user blocked users array
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      (id) => id.toString() !== userIdToUnBlock.toString()
    );

    //resave the current user
    await currentUser.save();
    res.json({
      status: "success",
      message: "user unblocked successfully",
    });
});

//who viewed my profile
//route get /api/v1/users/profile-viewer/:userProfileId
//access private
const profileViewers = asyncHandler(async (req, res) => {
    //find that we want to view profile
    const userProfileId = req.params.userProfileId;
  
    const userProfile = await User.findById(userProfileId);
    if (!userProfile) {
      throw new Error("this profile does not exist");
    }
  
    //find the current user
    const currentUserId = req.userAuth._id;

    //check if user already viewed the profile
    if (userProfile?.profileViewers?.includes(currentUserId)) {
      throw new Error("You have already viewed this profile");
    }

    //push the user current user id into the user profile
    userProfile.profileViewers.push(currentUserId);
    await userProfile.save();

    res.json({
      message: "you just viewed this profile",
      status: "success",
    });
});

//following users
//route get /api/v1/users/following/:userToFollowId
//access private
const followingUsers = asyncHandler(async (req, res) => {
    //find the current user
    const currentUserId = req.userAuth._id;

    //find the user to follow
    const userToFollowId = req.params.userToFollowId;

    //users can't follow themselves
    if (currentUserId.toString() === userToFollowId.toString()) {
      throw new Error("You cannot follow yourself");
    }
    //push the usertofolowID into the current user following field
    await User.findByIdAndUpdate(
      currentUserId,
      {
        $addToSet: { following: userToFollowId },
      },
      {
        new: true,
      }
    );
    //push the currentUserId into the user to follow followers field
    await User.findByIdAndUpdate(
      userToFollowId,
      {
        $addToSet: { followers: currentUserId },
      },
      {
        new: true,
      }
    );

    //send the response
    res.json({
      status: "success",
      message: "you have followed the user successfully",
    });
  });

//unfollowing users
// put /api/v1/users/unfollowing/:userToUnFollowId
// access private
const unFollowingUser = asyncHandler(async (req, res) => {
    //find the current user
    const currentUserId = req.userAuth._id;
    //find the user to unfollow
    const userToUnFollowId = req.params.userToUnFollowId;
  
    //avoid user unfollowing himself
    if (currentUserId.toString() === userToUnFollowId.toString()) {
      throw new Error("you cannot unfollow yourself");
    }
    //remove the usertoUnffolowID from the current user following field
    await User.findByIdAndUpdate(
      currentUserId,
      {
        $pull: { following: userToUnFollowId },
      },
      {
        new: true,
      }
    );
    //remove the currentUserId from the user to unfollow followers field
    await User.findByIdAndUpdate(
      userToUnFollowId,
      {
        $pull: { followers: currentUserId },
      },
      {
        new: true,
      }
    );
    //send the response
    res.json({
      status: "success",
      message: "You have unfollowed the user successfully",
    });
  });
  
//forgot password
//post /api/v1/users/forgot-password
//access public
const forgotPassword = expressAsyncHandler(async (req, res) => {
    const { email } = req.body;

    //find email in the database
    const userFound = await User.findOne({ email });
    if (!userFound) {
      throw new Error("no email is found");
    }
    //create token
    const resetToken = await userFound.generatePasswordResetToken();

    //resave the user
    await userFound.save();
  
    //send email
    sendEmail(email, resetToken);
    res.status(200).json({ message: "password reset email sent", resetToken });
  });


const resetPassword = expressAsyncHandler(async (req, res) => {
    //get the token from email 
    const { resetToken } = req.params;
    const { password } = req.body;

    //convert the token to actual token that has been saved in the database
    const cryptoToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //find the user by the crypto token
    const userFound = await User.findOne({
      passwordResetToken: cryptoToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!userFound) {
      throw new Error("password reset token is invalid or has expired");
    }

    //update the user password
    const salt = await bcrypt.genSalt(10);
    userFound.password = await bcrypt.hash(password, salt);
    userFound.passwordResetExpires = undefined;
    userFound.passwordResetToken = undefined;

    //resave the user
    await userFound.save();
    res.status(200).json({ 
        message: "password reset successfully" });
  });

//account verification email sent
//put /api/v1/users/account-verification-email/
//access private 
const verifyAccountEmail =  expressAsyncHandler(async (req, res) => {
    //Find the login user email
    const user = await User.findById(req?.userAuth?._id);
    if (!user) {
      throw new Error("user not found");
    }
    //send the token
    const token = await user.generateAccVerificationToken();
    //resave
    await user.save();
    //send the email
    sendVerification(user?.email, token);
    res.status(200).json({
      message: `account verification email sent ${user?.email}`,
    });
});

// account verification 
// post /api/v1/users/verify-account/:verifyToken
// access private
const verifyAccount = expressAsyncHandler(async (req, res) => {
  //Get the id/token params
  const { verifyToken } = req.params;

  //convert the token to actual token that has been saved in the db
  const cryptoToken = crypto.createHash("sha256").update(verifyToken).digest("hex");

  //find the user by the crypto token
  const userFound = await User.findOne({
    accountVerificationToken: cryptoToken,
    accountVerificationExpires: { $gt: Date.now() },
  });

  if (!userFound) {
    throw new Error("account verification token is invalid or has expired");
  }

  //Update user account
  userFound.isVerified = true;
  userFound.accountVerificationExpires = undefined;
  userFound.accountVerificationToken = undefined;
  //resave the user
  await userFound.save();
  res.status(200).json({ 
      message: "account verified successfully" });
  });
  
export { 
    register, 
    login, 
    profile, 
    blockUser, 
    unblockUser, 
    profileViewers, 
    followingUsers, 
    unFollowingUser,
    resetPassword,
    forgotPassword,
    verifyAccountEmail, 
    verifyAccount
};