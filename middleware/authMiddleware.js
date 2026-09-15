const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode & verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      // A validly-signed token for a user who no longer exists must NOT pass.
      // Without this check every handler receives req.user = null and has to
      // remember to guard for it, and a token minted from a leaked secret for
      // a made-up id sails straight through.
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user no longer exists" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;
