const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true // ✅ Ensuring email is unique
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Login', loginSchema);
