require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Case = require("../models/Case");

const clear = async () => {
  try {
    await connectDB();
    console.log("Database connected. Deleting all users and cases...");
    
    await Promise.all([
      User.deleteMany(),
      Case.deleteMany(),
    ]);

    const usersCheck = await User.countDocuments();
    const casesCheck = await Case.countDocuments();
    
    console.log(`Deletion complete.`);
    console.log(`Remaining Users: ${usersCheck}`);
    console.log(`Remaining Cases: ${casesCheck}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error connecting to the database or deleting documents:", error);
    process.exit(1);
  }
};

clear();
