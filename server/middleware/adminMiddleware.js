const admin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "moderator")) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin/moderator" });
  }
};

module.exports = { admin };
