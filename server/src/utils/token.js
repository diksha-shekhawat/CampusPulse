// ==============================================================================
// Token and Cookie Utility (server/src/utils/token.js)
// ==============================================================================
// This file handles JSON Web Token (JWT) generation and setting httpOnly cookies.
// Per the V1 Technical Blueprint:
// - JWTs are issued after successful authentication.
// - Tokens are stored in an httpOnly cookie so JavaScript cannot read them (XSS protection).

const jwt = require("jsonwebtoken");

// Fallback secret for local development if JWT_SECRET is not set in .env
const JWT_SECRET = process.env.JWT_SECRET || "campuspulse_default_jwt_secret_key_2026";
const TOKEN_EXPIRE_DAYS = 7;

/**
 * Generate a signed JWT token containing the account id and role.
 * @param {string} id - The MongoDB _id of the User or Organisation
 * @param {string} role - 'student', 'organisation', or 'admin'
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: `${TOKEN_EXPIRE_DAYS}d`
  });
};

/**
 * Send HTTP response with JWT stored securely in an httpOnly cookie.
 * @param {Object} account - The authenticated User or Organisation document
 * @param {string} role - 'student', 'organisation', or 'admin'
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendTokenResponse = (account, role, statusCode, res, message = "Success") => {
  const token = generateToken(account._id, role);

  // Cookie options
  const cookieOptions = {
    // 7 days in milliseconds
    expires: new Date(Date.now() + TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000),
    // Viva Point: httpOnly prevents client-side JS from accessing the cookie (XSS protection)
    httpOnly: true,
    // SameSite protects against CSRF attacks
    sameSite: "lax",
    // Only send over HTTPS in production
    secure: process.env.NODE_ENV === "production"
  };

  // Safe user representation (without passwordHash)
  const safeData = account.toJSON ? account.toJSON() : account;

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      role,
      data: safeData
    });
};

/**
 * Clear the session cookie on logout.
 */
const clearTokenResponse = (res, message = "Logged out successfully") => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0) // Expire immediately
    })
    .json({
      success: true,
      message
    });
};

module.exports = {
  generateToken,
  sendTokenResponse,
  clearTokenResponse,
  JWT_SECRET
};
