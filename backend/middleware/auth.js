// Import jsonwebtoken for verifying JWTs
const jwt = require("jsonwebtoken");

// Load the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to authenticate requests using JWT.
 * This function verifies the JWT provided in the `Authorization` header and attaches the decoded user information to `req.user`.
 *
 * @param {Object} req - The request object, which should include the `Authorization` header with a valid JWT.
 * @param {Object} res - The response object used to send error messages if authentication fails.
 * @param {Function} next - The next middleware function to call if authentication is successful.
 */
function authenticateJWT(req, res, next) {
  // 1. Extract the Authorization header from the request
  const authHeader = req.headers.authorization;

  // 2. Check if the Authorization header exists and starts with "Bearer "
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]; // Extract the token from the header

    try {
      // 3. Verify the JWT using the secret key
      const decoded = jwt.verify(token, JWT_SECRET);

      // 4. Attach the decoded user information to the request object
      req.user = decoded;

      // 5. Proceed to the next middleware or route handler
      next();
    } catch (err) {
      // 6. Handle errors during JWT verification (e.g., invalid or expired token)
      console.error("JWT verification failed:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  } else {
    // 7. Handle the case where no token is provided
    return res.status(401).json({ error: "No token provided" });
  }
}

// Export the middleware function
module.exports = authenticateJWT;
