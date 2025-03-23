const User = require('../models/userSchema');
const Login = require('../models/logicSchema');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');
const app = require('../index');

// Render Pages
const loadlogin = (req, res) => {
    res.render('login');
};

const loadlogout = (req, res) => {
    res.redirect('/login');
};

const loadsignup = (req, res) => {
    res.render('signup', { success: req.query.success });
};

// Signup Function
const signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("signup", { error: "User already exists!", success: false });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone
        });

        await newUser.save();

        // Redirect to signup with success message
        res.redirect("/signup?success=true"); 

    } catch (error) {
        console.error("Signup Error:", error);
        res.render("signup", { error: "An error occurred. Please try again.", success: false });
    }
};




// Login Function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check email in logins collection
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
        console.log(err);
        return res.status(500).json({ message: "Error logging in", error: err });
    }
};

// Get Dashboard
// Get Dashboard (Fixed)
const getDashboard = async (req, res) => {
    try {
        const users = await User.find({});
        console.log(users);

 // ✅ Debugging ke liye

        res.render("dashboard", { Users: users });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).send("Error loading dashboard");
    }
};


const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // ✅ Ensure user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(userId); 
        await Login.findOneAndDelete({ email: user.email }); 

        console.log("User deleted successfully");
        return res.redirect('/dashboard');
    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({ message: "Error deleting user" });
    }
};

// Load Add User Page
const loadAddPage = (req, res) => {
    res.render("add"); 
};

// Add New User
const addUser = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User Already Exists" });
        }

        const newUser = new User({ name, email, phone });
        await newUser.save();

        console.log("User added successfully");
        res.redirect("/dashboard");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding user");
    }
};

// Load Edit Page
const loadEditPage = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.render('edit', { User: user });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading edit page");
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        const updatedUser = await User.findByIdAndUpdate(req.params.id, { name, email, phone }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("User updated successfully");
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating user");
    }
};


// Search Function
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).send('Please provide a search query');
        }

        // Perform case-insensitive search on the 'name' field
        const users = await User.find({
            name: { $regex: query, $options: 'i' }
        });

        res.render('searchResults', { users });
    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).send('Server error');
    }
};




// ✅ Ensure this is exported properly
module.exports = { 
    getDashboard,
    loadlogin, 
    loadsignup, 
    signup, 
    login, 
    loadlogout, 
    deleteUser, 
    loadAddPage, 
    addUser, 
    loadEditPage, 
    updateUser,
    searchUsers
};
