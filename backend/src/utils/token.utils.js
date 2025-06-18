const jwt = require("jsonwebtoken");

exports.decodeToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
