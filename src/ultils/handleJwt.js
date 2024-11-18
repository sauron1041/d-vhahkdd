import jwt from 'jsonwebtoken';

const signJwt = (data, secret, expiresIn) => {
    try {
        let token = jwt.sign({
            data: data
        }, secret, { expiresIn: expiresIn });
        return token;
    } catch (error) {
        throw error;
    }
}

const verify = (token, secret) => {
    try {
        let myDecoded = null;
        jwt.verify(token, secret, (err, decoded) => {
            myDecoded = decoded;
            if (err) {
                throw err;
            }
        });
        return myDecoded;
    } catch (error) {
        throw error
    }
}

const extractToken = (req) => {
    try {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    signJwt,
    verify,
    extractToken
}
