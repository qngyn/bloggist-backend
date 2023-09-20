import mongoose, {Schema} from 'mongoose';
import crypto from 'crypto';
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
        }, 
        email: {
            type: String,
            required: true,
        }, 
        role: {
            type: String,
            required: true,
            enum: ['user', 'admin'],
            default: 'user'
        }, 
        password: {
            type: String,
            required: true,
        },
        lastLogin: {
            type: Date,
            default: Date.now(),
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        level: {
            type: String,
            enum: ["bronze", "silver", "gold", "diamond"],
            default: "bronze",
        }, 
        profilePic: {
            type: String,
            default: ""
        }, 
        coverImage: {
            type: String,
            default: ""
        },
        bio: {
            type: String,
        }, 
        gender: {
            type: String,
            enum: ["male", "female", "non-binary", "Prefer not to says"],

        }, 
        location: {
            type: String,
        }, 
        notificationPreferences: {
            email: { type: String, default: true },

        }, 
        profileViewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
        likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
        passwordResetToken: {
            type: String
        },
        passwordResetExpires: {
            type: Date
        }, 
        accountVerificationToken: {
            type: String,
        }, 
        accountVerificationExpires: {
            type: Date,
        }
    },
    {
        timestamps: true,
        toJSON: {
          virtuals: true,
        },
        toObject: {
          virtuals: true,
        },
    }
);

//generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //update the passwordresetexpires and when to expire
    this.passwordResetExpires = Date.now() + 10 * (60 * 1000);

    return resetToken;
};

//generate token for account verification
userSchema.methods.generateAccVerificationToken = function () {
    //generate token

    const resetToken = crypto.randomBytes(20).toString("hex");

    //assign the token to accountVerificationToken field
    this.accountVerificationToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  
    //Update the accountVerificationExpires and when to expire
    this.accountVerificationExpires = Date.now() + 10 * (60 * 1000); //10 minutes
    return resetToken;
};

const User = mongoose.model("User", userSchema)
export default User;

// module.exports = User