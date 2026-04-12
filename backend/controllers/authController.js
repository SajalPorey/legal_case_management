const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If someone tries to register as Admin, check if one already exists
    if (role === "Admin") {
      const existingAdmin = await User.findOne({ role: "Admin" });
      if (existingAdmin) {
        // Register them as Lawyer and send a request to Admin
        const newUser = await User.create({
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: "Lawyer",
        });

        const AdminRequest = require("../models/AdminRequest");
        await AdminRequest.create({ userId: newUser._id });

        return res.status(201).json({
          message:
            "You don't have credentials to be the admin. Your request has been sent to the Admin for approval. You have been registered as a Lawyer for now.",
          token: generateToken(newUser._id),
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
        });
      }
    }

    const resolvedRole = role === "Admin" ? "Admin" : "Lawyer";

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: resolvedRole,
    });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    res.json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllUsers,
};
