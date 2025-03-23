const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.cookies.token; 
    if (!token) {
        return res.redirect('/login'); 
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); // ✅ User Authenticated, Proceed to Dashboard
    } catch (err) {
        res.clearCookie('token'); 
        return res.redirect('/login');
    }
};

module.exports = authenticate;
