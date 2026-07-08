const { User } = require("../models");
const jwt = require("jsonwebtoken");

// Menggunakan hardcode JWT_SECRET karena ini project kuliah dan diminta mudah dipahami
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validasi manual (sederhana & mudah dipahami)
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi (name, email, password, role)",
        data: null,
      });
    }

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan, silakan gunakan email lain",
        data: null,
      });
    }

    // 3. Simpan ke database (password di-hash otomatis oleh pre-save hook di User model)
    const newUser = await User.create({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error Register:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
        data: null,
      });
    }

    // 2. Cari user di database (password diset select: false di model, jadi harus explicit select)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
        data: null,
      });
    }

    // 3. Cek password menggunakan comparePassword method di model User
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
        data: null,
      });
    }

    // 4. Buat Token JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Error Login:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
