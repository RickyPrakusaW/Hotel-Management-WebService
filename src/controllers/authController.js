const { User } = require("../models");
const jwt = require("jsonwebtoken");
const emailService = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // 1. Validasi manual
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi (name, email, password, phone)",
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

    // 3. Buat 6 digit OTP acak
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // berlaku 2 menit

    // 4. Simpan ke database (password di-hash otomatis oleh pre-save hook di User model)
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || "Customer",
      phone,
      otpCode,
      otpExpiresAt,
    });

    // 5. Kirim OTP via Gmail SMTP
    try {
      await emailService.sendOTP(newUser.email, otpCode, newUser.name);
    } catch (emailError) {
      console.error("Gagal mengirim email OTP saat register:", emailError);
      // Tetap kembalikan sukses registrasi tapi beri tahu di message jika email gagal kirim
    }

    return res.status(201).json({
      success: true,
      message:
        "Registrasi berhasil. Silakan cek email Anda untuk kode OTP verifikasi.",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        isVerified: newUser.isVerified,
        otpExpiresAt: newUser.otpExpiresAt,
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

    // 2. Cari user di database beserta rolenya
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
        data: null,
      });
    }

    // Cek apakah user sudah terverifikasi OTP
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Akun Anda belum terverifikasi. Silakan verifikasi OTP terlebih dahulu.",
        data: {
          email: user.email,
          isVerified: false,
        },
      });
    }

    // 3. Cek password
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
      { expiresIn: "1d" }, // 2h, 10m
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

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    // 1. Validasi input
    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: "Email dan kode OTP wajib diisi",
        data: null,
      });
    }

    // 2. Cari user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
        data: null,
      });
    }

    // 3. Cek jika sudah diverifikasi sebelumnya
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Akun sudah diverifikasi sebelumnya, silakan langsung login",
        data: null,
      });
    }

    // 4. Cocokkan kode OTP
    if (user.otpCode !== otpCode) {
      return res.status(400).json({
        success: false,
        message: "Kode OTP salah",
        data: null,
      });
    }

    // 5. Cek apakah OTP kedaluwarsa
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Kode OTP telah kedaluwarsa, silakan minta kode OTP baru",
        data: null,
      });
    }

    // 6. Set status menjadi terverifikasi dan hapus data OTP
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Akun berhasil diverifikasi. Silakan masuk (login).",
      data: {
        email: user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Error Verify OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
        data: null,
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
        data: null,
      });
    }

    // Verifikasi password untuk keamanan pengiriman ulang OTP
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
        data: null,
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Akun ini sudah terverifikasi sebelumnya",
        data: null,
      });
    }

    // Mencegah spam resend OTP sebelum waktunya habis
    if (user.otpExpiresAt && user.otpExpiresAt > new Date()) {
      const timeLeftMs = user.otpExpiresAt - new Date();
      const timeLeftSec = Math.ceil(timeLeftMs / 1000);
      return res.status(429).json({
        success: false,
        message: `Silakan tunggu ${timeLeftSec} detik lagi sebelum meminta OTP baru`,
        data: null,
      });
    }

    // Buat OTP baru
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 menit

    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Kirim ulang via emailService
    await emailService.sendOTP(user.email, otpCode, user.name);

    return res.status(200).json({
      success: true,
      message: "Kode OTP baru telah dikirim ke email Anda",
      data: {
        email: user.email,
        isVerified: false,
        otpExpiresAt: user.otpExpiresAt,
      },
    });
  } catch (error) {
    console.error("Error Resend OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
