const mongoose = require("mongoose");

const mongoURI = "mongodb+srv://root:root@cluster0.wsogf.mongodb.net/crud_operation?retryWrites=true&w=majority&appName=Cluster0"; 

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {

        });
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1); 
    }
};

module.exports = connectDB;

