require("dotenv").config();
const MongoStore = require("connect-mongo");
const express = require("express");
const connectDB = require("./config/db");
const session = require("express-session");
const cors = require("cors");
require('./models/TeamMember');

const app = express();
connectDB();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // <-- your MongoDB URI
      collectionName: "sessions",
    }),
    cookie: {
      secure: false, // true if using HTTPS
      httpOnly: true,
      sameSite: "lax", // change to "none" if using HTTPS and cross-site
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/teamRoutes"));
app.use("/api", require("./routes/tournamentRoutes"));

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Add 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
