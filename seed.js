require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const User = require("./src/models/User");
const Category = require("./src/models/Category");
const Hotel = require("./src/models/Hotel");
const Voucher = require("./src/models/Voucher");
const Wallet = require("./src/models/Wallet");
const WalletTransaction = require("./src/models/WalletTransaction");
const Booking = require("./src/models/Booking");
const Review = require("./src/models/Review");

const seedData = async () => {
  try {
    // 1. Koneksi ke Database
    await connectDB();
    console.log("Mulai proses Seeding Data...");

    // 2. Hapus data lama (Clear database)
    console.log("Menghapus data lama...");
    await User.deleteMany();
    await Category.deleteMany();
    await Hotel.deleteMany();
    await Voucher.deleteMany();
    await Wallet.deleteMany();
    await WalletTransaction.deleteMany();
    await Booking.deleteMany();

    // 3. Buat User Admin, Hotel Manager, dan Customer
    console.log("Membuat akun Admin, Manager, dan Customer...");
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@hotel.com",
      password: "Password123!", // Otomatis di-hash oleh model User
      role: "Admin",
      phone: "081111111111",
      isVerified: true,
    });

    const manager = await User.create({
      name: "Budi Manajer",
      email: "manager@hotel.com",
      password: "Password123!",
      role: "HotelManager",
      phone: "082222222222",
      isVerified: true,
    });

    const customer = await User.create({
      name: "Ricky Customer",
      email: "customer@hotel.com",
      password: "Password123!",
      role: "Customer",
      phone: "08123456789",
      isVerified: true,
    });

    // 4. Inisialisasi E-Wallet untuk Customer dengan saldo awal
    console.log("Membuat E-Wallet & saldo awal untuk Customer...");
    const wallet = await Wallet.create({
      userId: customer._id,
      balance: 500000, // Berikan saldo awal Rp500.000 untuk mempermudah testing booking
    });

    // Catat mutasi saldo awal di transaksi wallet
    await WalletTransaction.create({
      userId: customer._id,
      type: "topup",
      amount: 500000,
      balanceBefore: 0,
      balanceAfter: 500000,
      referenceId: `SEED-TOPUP-${Date.now()}`,
      status: "success",
      note: "Saldo awal dari sistem seeder untuk testing",
    });

    // 5. Buat Kategori Hotel
    console.log("Membuat Kategori Hotel...");
    const catResort = await Category.create({
      name: "Resort",
      description: "Penginapan berkonsep alam luas dan mewah",
    });
    const catBudget = await Category.create({
      name: "Budget",
      description: "Penginapan murah ramah kantong",
    });
    const catCity = await Category.create({
      name: "City Hotel",
      description: "Hotel praktis di pusat kota besar",
    });

    // 6. Buat Data Voucher Diskon
    console.log("Membuat Voucher Diskon...");
    await Voucher.create({
      code: "DISKONHEBAT",
      type: "fixed",
      value: 25000,
      quota: 100,
      startDate: new Date("2026-01-01"),
      expiredDate: new Date("2026-12-31T23:59:59Z"),
      createdBy: admin._id,
    });

    await Voucher.create({
      code: "COBAHEMAT",
      type: "percentage",
      value: 10, // 10% diskon
      maxDiscount: 50000,
      quota: 50,
      startDate: new Date("2026-01-01"),
      expiredDate: new Date("2026-12-31T23:59:59Z"),
      createdBy: admin._id,
    });

    // 7. Buat Data Hotel & Tipe Kamar
    console.log("Membuat data Hotel & Tipe Kamar...");
    const hotel1 = await Hotel.create({
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
          pricePerNight: 150000,
          totalQuota: 20,
          available_quota: 19, // Berkurang 1 karena ada booking dummy
          capacity: 2,
          facilities: ["Wi-Fi", "AC", "TV 42 Inch", "Breakfast"],
        },
        {
          name: "Executive Suite",
          pricePerNight: 400000,
          totalQuota: 5,
          available_quota: 5,
          capacity: 4,
          facilities: ["Wi-Fi", "AC", "Smart TV", "Private Pool", "Breakfast"],
        },
      ],
    });

    const hotel2 = await Hotel.create({
      name: "Amaris Hotel Yogyakarta",
      description: "Pilihan menginap ekonomis di pusat kota Yogyakarta.",
      address: "Jl. Diponegoro No. 87",
      city: "Yogyakarta",
      categoryId: catBudget._id,
      ownerId: manager._id,
      isFeatured: false,
      room_types: [
        {
          name: "Smart Room Double",
          pricePerNight: 80000,
          totalQuota: 15,
          available_quota: 14, // Berkurang 1 karena ada booking dummy
          capacity: 2,
          facilities: ["Wi-Fi", "AC", "TV 32 Inch", "Breakfast"],
        },
      ],
    });

    // 8. Buat Data Booking & Review Dummy
    console.log("Membuat data Booking & Review dummy...");

    // Booking 1: Sudah Selesai (Checked Out)
    const checkIn1 = new Date();
    checkIn1.setDate(checkIn1.getDate() - 5);
    const checkOut1 = new Date();
    checkOut1.setDate(checkOut1.getDate() - 3);

    const roomTypeDeluxe = hotel1.room_types[0];
    const subtotal1 = roomTypeDeluxe.pricePerNight * 1 * 2; // 1 kamar, 2 malam

    const booking1 = await Booking.create({
      bookingCode: `BK-20260705-1234-0001`,
      customerId: customer._id,
      hotelId: hotel1._id,
      checkInDate: checkIn1,
      checkOutDate: checkOut1,
      details: [
        {
          roomTypeId: roomTypeDeluxe._id,
          roomTypeName: roomTypeDeluxe.name,
          pricePerNight: roomTypeDeluxe.pricePerNight,
          quantity: 1,
          nights: 2,
          subtotal: subtotal1,
        },
      ],
      subtotal: subtotal1,
      discountAmount: 0,
      totalAmount: subtotal1,
      paymentMethod: "wallet",
      status: "checked_out",
      expiresAt: new Date(),
    });

    // Ulasan (Review) untuk Booking 1
    await Review.create({
      hotelId: hotel1._id,
      customerId: customer._id,
      bookingId: booking1._id,
      rating: 5,
      comment: "Sangat menyenangkan menginap di Grand Ambarrukmo Resort! Kamar Deluxe bersih dan breakfast-nya lezat.",
    });

    // Update rata-rata rating di hotel1
    hotel1.rating = 5;
    hotel1.reviewCount = 1;
    await hotel1.save();

    // Booking 2: Sedang Aktif / Terkonfirmasi (Confirmed)
    const checkIn2 = new Date();
    checkIn2.setDate(checkIn2.getDate() + 1); // Besok
    const checkOut2 = new Date();
    checkOut2.setDate(checkOut2.getDate() + 3); // Lusa + 1 malam

    const roomTypeSmart = hotel2.room_types[0];
    const subtotal2 = roomTypeSmart.pricePerNight * 1 * 2; // 1 kamar, 2 malam

    await Booking.create({
      bookingCode: `BK-20260710-5678-0002`,
      customerId: customer._id,
      hotelId: hotel2._id,
      checkInDate: checkIn2,
      checkOutDate: checkOut2,
      details: [
        {
          roomTypeId: roomTypeSmart._id,
          roomTypeName: roomTypeSmart.name,
          pricePerNight: roomTypeSmart.pricePerNight,
          quantity: 1,
          nights: 2,
          subtotal: subtotal2,
        },
      ],
      subtotal: subtotal2,
      discountAmount: 0,
      totalAmount: subtotal2,
      paymentMethod: "midtrans",
      status: "confirmed",
      expiresAt: new Date(),
      payment: {
        snapToken: "bk-dummy-snap-token-2",
        redirectUrl: "https://app.sandbox.midtrans.com/snap/v2/vtweb/bk-dummy-2",
        paidAt: new Date(),
      },
    });

    console.log(
      "✅ Seeding berhasil! Seluruh data dummy pengujian telah dimasukkan ke Database.",
    );
    process.exit();
  } catch (error) {
    console.error("Seeding gagal:", error);
    process.exit(1);
  }
};

// Jalankan fungsi
seedData();
