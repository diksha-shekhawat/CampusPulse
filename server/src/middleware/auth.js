// ==============================================================================
// Authentication & Role Middleware (server/src/middleware/auth.js)
// ==============================================================================
// Protects routes by verifying the JWT cookie and checking user permissions.
// Per the V1 Technical Blueprint:
// - Verifies the JWT session from httpOnly cookies (or Authorization header).
// - Attaches the authenticated account and role to `req.user` and `req.role`.
// - Restricts access based on account roles: 'student', 'organisation', or 'admin'.

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/token");
const { User, Organisation } = require("../models");

/**
 * Protect middleware: Ensures the request is authenticated.
 */
const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Read token from httpOnly cookie (primary method)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback: Read token from Authorization Bearer header (helpful for Postman testing)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please log in to access this resource."
      });
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET);

    let account = null;

    // Fetch the account from database based on the role in the token
    if (decoded.role === "student" || decoded.role === "admin") {
      account = await User.findById(decoded.id);
    } else if (decoded.role === "organisation") {
      account = await Organisation.findById(decoded.id);
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Account not found or session has expired."
      });
    }

    if (!account.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact the administrator."
      });
    }

    // Attach authenticated data to the request object
    req.user = account;
    req.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session invalid or expired. Please log in again."
    });
  }
};

/**
 * Authorize middleware: Checks if the authenticated user has one of the required roles.
 * Example: authorize('organisation') or authorize('admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(", ")}] only.`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
