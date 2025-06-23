const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const searchRoutes = require("./routes/search.routes");
const { connectDB } = require("./config");
const errorHandler = require("./middlewares/error.middleware");
const limiter = require("./middlewares/rateLimiter.middleware");
const { initSocket } = require("./sockets");
const likeRoutes = require("./routes/like.routes");

// Load env vars
dotenv.config();

// Init app + middleware
const app = express();
const corsOptions = {
  origin: "*", // 👈 Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(limiter);

// Connect DB
connectDB();

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/posts", require("./routes/post.routes"));
app.use("/api/comments", require("./routes/comment.routes"));
app.use("/api/follows", require("./routes/follow.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/likes", likeRoutes);
app.use("/api/search", searchRoutes);

// Error handler
app.use(errorHandler);

// Setup server and socket
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
