require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database"); // Pastikan path ini sesuai dengan struktur foldermu
const User = require("./src/models/User");
const Category = require("./src/models/Category");
const Hotel = require("./src/models/Hotel");

const seedData = async () => {
  try {
    // 1. Koneksi ke Database
    await connectDB();
    console.log("Mulai proses Seeding Data...");

    // 2. Hapus data lama supaya tidak dobel (opsional, hati-hati jika dipakai di production)
    console.log("Menghapus data lama...");
    await User.deleteMany();
    await Category.deleteMany();
    await Hotel.deleteMany();

    // 3. Buat User Admin & Hotel Manager
    console.log("Membuat akun Admin & Manager...");
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@hotel.com",
      password: "Password123!", // Otomatis di-hash oleh model User
      role: "Admin",
      phone: "081111111111",
      isVerified: true, // Langsung diverifikasi supaya bisa login
    });

    const manager = await User.create({
      name: "Budi Manajer",
      email: "manager@hotel.com",
      password: "Password123!",
      role: "HotelManager",
      phone: "082222222222",
      isVerified: true,
    });

    // 4. Buat Kategori Hotel
    console.log("Membuat Kategori Hotel...");
    const catResort = await Category.create({
      name: "Resort",
      description: "Penginapan berkonsep alam luas",
    });
    const catBudget = await Category.create({
      name: "Budget",
      description: "Penginapan ramah kantong",
    });

    // 5. Buat Data Hotel & Tipe Kamar
    console.log("Membuat contoh Hotel & Kamar...");
    await Hotel.create({
      name: "Grand Ambarrukmo Resort",
      description:
        "Resort bintang 5 dengan pemandangan indah dan fasilitas lengkap.",
      address: "Jl. Laksda Adisucipto No. 82",
      city: "Yogyakarta",
      categoryId: catResort._id,
      ownerId: manager._id,
      isFeatured: true,
      room_types: [
        {
          name: "Deluxe Room",
          pricePerNight: 850000,
          totalQuota: 20,
          available_quota: 20,
          capacity: 2,
          facilities: ["Wi-Fi", "AC", "TV 42 Inch", "Breakfast"],
        },
        {
          name: "Executive Suite",
          pricePerNight: 2000000,
          totalQuota: 5,
          available_quota: 5,
          capacity: 4,
          facilities: ["Wi-Fi", "AC", "Smart TV", "Private Pool", "Breakfast"],
        },
      ],
    });

    console.log("✅ Seeding berhasil! Data dummy sudah masuk ke Database.");
    process.exit(); // Matikan proses setelah selesai
  } catch (error) {
    console.error("❌ Seeding gagal:", error);
    process.exit(1); // Matikan proses dengan kode error
  }
};

// Jalankan fungsi
seedData();
