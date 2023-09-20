import jwt from 'jsonwebtoken';

const generateToken = (user) => {
    //create payload for user 
    const payload = {
        user: {
            id: user.id,
        }
    }

    //sign token with secret key
    const token = jwt.sign(payload, process.env.JWT_KEY, {expiresIn: '1d'});
    return token
}; 
export default generateToken;
