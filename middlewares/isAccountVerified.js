import User from "../model/User/User.js";
const checkAccountVerification = async (req, res, next) => {
    try {
      //find the login user
      const user = await User.findById(req.userAuth._id);

      //check if user is verified
      if (user?.isVerified) {
        next();
      } else {
        res.status(401).json({ message: "account not verified" });
      }
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  };
  

export default checkAccountVerification;