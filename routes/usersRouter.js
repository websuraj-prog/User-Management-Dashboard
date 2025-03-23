const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const User = require("../models/userSchema");
const Login = require("../models/logicSchema");
const controllers = require('../controllers/Authcontrollers');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();


// ✅ Signup Route (Fixed)
router.post("/signup", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.redirect("/signup?error=Please provide all required fields!");
        }

        const existingUser = await User.findOne({ email });
        const existingLogin = await Login.findOne({ email });

        if (existingUser || existingLogin) {
            return res.redirect("/signup?error=Email already exists!");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, phone });
        await newUser.save();

        const newLogin = new Login({ email, password: hashedPassword });
        await newLogin.save();

        return res.redirect("/signup?success=true");

    } catch (err) {
        console.error("Signup Error:", err);
        return res.redirect("/signup?error=Internal Server Error");
    }
});



// ✅ Login Route (Fixed)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check in `logins` collection
        const loginUser = await Login.findOne({ email });

        if (!loginUser) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, loginUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ email: loginUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });

        return res.redirect('/dashboard');

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Error logging in", error: err });
    }
};


router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).send('Please provide a search query');
        }

        // Perform case-insensitive search on the 'name' field
        const users = await User.find({
            name: { $regex: name, $options: 'i' }
        });

        res.render('search', { users });
    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).send('Server error');
    }
});




// ✅ Routes
router.get('/dashboard', authenticate, controllers.getDashboard);
router.get('/signup', controllers.loadsignup);
router.get('/login', controllers.loadlogin);
router.get('/logout', controllers.loadlogout);
router.get('/delete/:id', authenticate, controllers.deleteUser);
router.get('/add', authenticate, controllers.loadAddPage);
router.get('/edit/:id', authenticate, controllers.loadEditPage);
router.get('/search', controllers.searchUsers);

router.post('/login', login); // ✅ Register Login Function
router.post('/signup', controllers.signup);
router.post('/add', authenticate, controllers.addUser);
router.post('/update/:id', authenticate, controllers.updateUser);

router.get("/signup", (req, res) => {
    const success = req.query.success === "true";  
    const error = req.query.error || "";  
    res.render("signup", { success, error });
});





module.exports = router;
