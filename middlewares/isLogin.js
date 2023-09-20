import jwt from 'jsonwebtoken';
import User from '../model/User/User.js';

const isLogin = (req, res, next) => {
    //get token from header
    const token = req.headers.authorization?.split(' ')[1];

    //verify token
    jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
        //get user id
        const userId = decoded?.user?.id;
        const user = await User.findById(userId).select('username email role _id')

        //save user to req.user
        req.userAuth = user;
        if (err) {
            // res.json({
            //     status: 'error',
            //     message: 'Invalid token'
            // })
            const err =  new Error('Invalid token')
            next(err)
        } else {
            // req.user = decoded.user;
            next();
        }
    });
    //save user to req.user

}

export default isLogin;