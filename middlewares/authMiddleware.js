const jwt = require("jsonwebtoken");

const Users = require("../models/usersModel");

const protect = async (req, res, next) => {
  try {
    // Extract token from authorization header
    const token =
      req.headers.authorization?.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Not authorized" });
    }

    // Use async version of token verification
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id decoded from token
    const user = await Users.findById(decodedToken.id);

    if (!user || !user.token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

module.exports = { protect };
