const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak, token tidak ditemukan atau format salah",
        data: null,
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: "Pengguna tidak ditemukan atau telah dinonaktifkan",
        data: null,
      });
    }

    // Pasang objek user lengkap ke req.user agar middleware/controller setelah ini bisa mengaksesnya
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau telah kedaluwarsa",
      data: null,
    });
  }
};
