const { Booking, Hotel, User, Voucher, Wallet, WalletTransaction, Review } = require("../models");
const walletService = require("../services/walletService");
const midtransService = require("../services/midtransService");

// Booking Actions
exports.createBooking = async (req, res) => {
  try {
    const { hotelId, checkInDate, checkOutDate, details, paymentMethod, voucherCode } = req.body;
    const customerId = req.user._id;

    if (!hotelId || !checkInDate || !checkOutDate || !details || !details.length) {
      return res.status(400).json({
        success: false,
        message: "Parameter hotelId, checkInDate, checkOutDate, dan details wajib diisi",
        data: null,
      });
    }

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inDate < today) {
      return res.status(400).json({
        success: false,
        message: "Tanggal check-in tidak boleh kurang dari hari ini",
        data: null,
      });
    }

    if (outDate <= inDate) {
      return res.status(400).json({
        success: false,
        message: "Tanggal check-out harus lebih besar dari tanggal check-in",
        data: null,
      });
    }

    // Hitung jumlah malam
    const diffTime = Math.abs(outDate - inDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Cari Hotel
    const hotel = await Hotel.findOne({ _id: hotelId, isDeleted: false });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel tidak ditemukan",
        data: null,
      });
    }

    // Validasi tipe kamar dan kuota
    const bookingDetails = [];
    let subtotal = 0;

    for (const item of details) {
      const { roomTypeId, quantity } = item;
      if (!roomTypeId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "roomTypeId dan quantity (minimal 1) wajib valid untuk setiap item details",
          data: null,
        });
      }

      const roomType = hotel.room_types.id(roomTypeId);
      if (!roomType) {
        return res.status(404).json({
          success: false,
          message: `Tipe kamar dengan ID ${roomTypeId} tidak ditemukan pada hotel ini`,
          data: null,
        });
      }

      if (roomType.available_quota < quantity) {
        return res.status(400).json({
          success: false,
          message: `Kuota kamar '${roomType.name}' tidak mencukupi (Tersedia: ${roomType.available_quota}, Diminta: ${quantity})`,
          data: null,
        });
      }

      const itemSubtotal = roomType.pricePerNight * quantity * nights;
      subtotal += itemSubtotal;

      bookingDetails.push({
        roomTypeId,
        roomTypeName: roomType.name,
        pricePerNight: roomType.pricePerNight,
        quantity,
        nights,
        subtotal: itemSubtotal,
      });
    }

    // Proses Voucher jika ada
    let discountAmount = 0;
    let appliedVoucher = null;

    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isDeleted: false });
      if (!voucher || !voucher.isActive) {
        return res.status(404).json({
          success: false,
          message: "Voucher tidak ditemukan atau sudah tidak aktif",
          data: null,
        });
      }

      const now = new Date();
      if (now < voucher.startDate || now > voucher.expiredDate) {
        return res.status(400).json({
          success: false,
          message: "Masa berlaku voucher belum dimulai atau sudah habis",
          data: null,
        });
      }

      if (voucher.quota <= voucher.usedCount) {
        return res.status(400).json({
          success: false,
          message: "Kuota penggunaan voucher sudah habis",
          data: null,
        });
      }

      if (subtotal < voucher.minTransaction) {
        return res.status(400).json({
          success: false,
          message: `Minimal transaksi untuk menggunakan voucher ini adalah Rp${voucher.minTransaction.toLocaleString("id-ID")}`,
          data: null,
        });
      }

      if (voucher.hotelId && voucher.hotelId.toString() !== hotelId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Voucher ini tidak dapat digunakan untuk hotel ini",
          data: null,
        });
      }

      // Hitung potongan harga
      if (voucher.type === "fixed") {
        discountAmount = voucher.value;
      } else if (voucher.type === "percentage") {
        discountAmount = (subtotal * voucher.value) / 100;
        if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount;
        }
      }

      // Voucher tidak boleh menghasilkan total negatif
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }

      appliedVoucher = voucher;
    }

    const totalAmount = subtotal - discountAmount;

    // Generate bookingCode BK-YYYYMMDD-Timestamp-Random
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const bookingCode = `BK-${dateStr}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Setup waktu kadaluarsa (30 menit)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Kurangi kuota kamar
    for (const item of details) {
      const roomType = hotel.room_types.id(item.roomTypeId);
      roomType.available_quota -= item.quantity;
    }
    await hotel.save();

    // Kurangi kuota voucher jika berhasil diaplikasikan
    if (appliedVoucher) {
      appliedVoucher.usedCount += 1;
      await appliedVoucher.save();
    }

    // Buat dokumen Booking
    const booking = new Booking({
      bookingCode,
      customerId,
      hotelId,
      checkInDate: inDate,
      checkOutDate: outDate,
      details: bookingDetails,
      subtotal,
      voucherCode: appliedVoucher ? appliedVoucher.code : null,
      discountAmount,
      totalAmount,
      paymentMethod: paymentMethod || "midtrans",
      status: "pending_payment",
      expiresAt,
    });

    // Proses Pembayaran E-Wallet
    if (paymentMethod === "wallet") {
      const wallet = await walletService.getOrCreateWallet(customerId);
      if (wallet.balance < totalAmount) {
        // Restore kuota kamar dan voucher karena gagal bayar
        for (const item of details) {
          const roomType = hotel.room_types.id(item.roomTypeId);
          roomType.available_quota += item.quantity;
        }
        await hotel.save();

        if (appliedVoucher) {
          appliedVoucher.usedCount -= 1;
          await appliedVoucher.save();
        }

        return res.status(400).json({
          success: false,
          message: `Saldo E-Wallet tidak mencukupi (Saldo: Rp${wallet.balance.toLocaleString("id-ID")}, Total: Rp${totalAmount.toLocaleString("id-ID")})`,
          data: null,
        });
      }

      const balanceBefore = wallet.balance;
      wallet.balance -= totalAmount;
      await wallet.save();

      const walletTx = await WalletTransaction.create({
        userId: customerId,
        type: "payment",
        amount: totalAmount,
        balanceBefore,
        balanceAfter: wallet.balance,
        referenceId: bookingCode,
        status: "success",
        note: `Pembayaran booking hotel ${hotel.name}`,
      });

      booking.status = "confirmed";
      booking.walletTransactionId = walletTx._id;
      booking.payment.paidAt = new Date();
    } else {
      // Proses Pembayaran Midtrans Snap
      const userDetails = {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || "",
      };

      const midtransPayment = await midtransService.createSnapToken(bookingCode, totalAmount, userDetails);
      booking.payment.snapToken = midtransPayment.token;
      booking.payment.redirectUrl = midtransPayment.redirect_url;
    }

    await booking.save();

    return res.status(201).json({
      success: true,
      message: paymentMethod === "wallet" ? "Booking berhasil dibuat dan dibayar menggunakan E-Wallet" : "Booking berhasil dibuat, silakan selesaikan pembayaran",
      data: booking,
    });

  } catch (error) {
    console.error("Error Create Booking:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.getBookings = async (req, res) => {
  try {
    let filter = { isDeleted: false };
    
    // Jika Customer, hanya tampilkan miliknya
    if (req.user.role === "Customer") {
      filter.customerId = req.user._id;
    } else if (req.user.role === "HotelManager") {
      // Jika HotelManager, cari hotel yang dia miliki terlebih dahulu
      const ownedHotels = await Hotel.find({ ownerId: req.user._id, isDeleted: false });
      const hotelIds = ownedHotels.map(h => h._id);
      filter.hotelId = { $in: hotelIds };
    }

    const bookings = await Booking.find(filter)
      .populate("hotelId", "name address city")
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar booking",
      data: bookings,
    });
  } catch (error) {
    console.error("Error Get Bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, isDeleted: false })
      .populate("hotelId")
      .populate("customerId", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
        data: null,
      });
    }

    // Verifikasi otorisasi
    const isCustomerOwner = req.user.role === "Customer" && booking.customerId._id.toString() === req.user._id.toString();
    const isHotelOwner = req.user.role === "HotelManager" && booking.hotelId.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "Admin";

    if (!isCustomerOwner && !isHotelOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda tidak berhak melihat data booking ini.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil detail booking",
      data: booking,
    });
  } catch (error) {
    console.error("Error Get Booking By ID:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, isDeleted: false })
      .populate("hotelId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
        data: null,
      });
    }

    // Hanya customer pemilik booking, manager hotel terkait, atau admin yang bisa cancel
    const isCustomerOwner = req.user.role === "Customer" && booking.customerId.toString() === req.user._id.toString();
    const isHotelOwner = req.user.role === "HotelManager" && booking.hotelId.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "Admin";

    if (!isCustomerOwner && !isHotelOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak untuk membatalkan booking ini",
        data: null,
      });
    }

    // Booking hanya bisa dibatalkan jika masih pending_payment atau confirmed
    if (booking.status !== "pending_payment" && booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Booking tidak bisa dibatalkan karena berstatus '${booking.status}'`,
        data: null,
      });
    }

    // Kembalikan available_quota kamar
    const hotel = await Hotel.findById(booking.hotelId._id);
    if (hotel) {
      for (const item of booking.details) {
        const roomType = hotel.room_types.id(item.roomTypeId);
        if (roomType) {
          roomType.available_quota += item.quantity;
        }
      }
      await hotel.save();
    }

    // Lakukan Refund Saldo jika statusnya sudah confirmed
    if (booking.status === "confirmed") {
      if (booking.paymentMethod === "wallet") {
        const wallet = await walletService.getOrCreateWallet(booking.customerId);
        const balanceBefore = wallet.balance;
        wallet.balance += booking.totalAmount;
        await wallet.save();

        await WalletTransaction.create({
          userId: booking.customerId,
          type: "refund",
          amount: booking.totalAmount,
          balanceBefore,
          balanceAfter: wallet.balance,
          referenceId: booking.bookingCode,
          status: "success",
          note: `Refund pembatalan booking ${booking.bookingCode}`,
        });

        booking.status = "refunded";
      } else {
        // Midtrans payment refund (diset ke request_refund karena butuh tindakan admin manual)
        booking.status = "refund_requested";
      }
    } else {
      // Jika pending_payment, ubah status langsung ke cancelled
      booking.status = "cancelled";
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: booking.status === "refunded" ? "Booking berhasil dibatalkan dan saldo di-refund ke E-Wallet" : "Booking berhasil dibatalkan",
      data: booking,
    });
  } catch (error) {
    console.error("Error Cancel Booking:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.refundBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, isDeleted: false });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
        data: null,
      });
    }

    if (booking.status !== "refund_requested") {
      return res.status(400).json({
        success: false,
        message: "Booking tidak memiliki pengajuan refund aktif",
        data: null,
      });
    }

    // Lakukan refund manual dari admin ke E-wallet
    const wallet = await walletService.getOrCreateWallet(booking.customerId);
    const balanceBefore = wallet.balance;
    wallet.balance += booking.totalAmount;
    await wallet.save();

    await WalletTransaction.create({
      userId: booking.customerId,
      type: "refund",
      amount: booking.totalAmount,
      balanceBefore,
      balanceAfter: wallet.balance,
      referenceId: booking.bookingCode,
      status: "success",
      note: `Refund disetujui admin untuk booking ${booking.bookingCode}`,
    });

    booking.status = "refunded";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Refund berhasil disetujui, saldo dikembalikan ke E-Wallet customer",
      data: booking,
    });
  } catch (error) {
    console.error("Error Process Refund Booking:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.extendBooking = async (req, res) => {
  try {
    const { additionalNights } = req.body;
    if (!additionalNights || additionalNights <= 0) {
      return res.status(400).json({
        success: false,
        message: "Jumlah tambahan malam (additionalNights) minimal 1 malam",
        data: null,
      });
    }

    const booking = await Booking.findOne({ _id: req.params.id, isDeleted: false })
      .populate("hotelId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
        data: null,
      });
    }

    if (booking.status !== "confirmed" && booking.status !== "checked_in") {
      return res.status(400).json({
        success: false,
        message: "Hanya booking berstatus 'confirmed' atau 'checked_in' yang bisa diperpanjang",
        data: null,
      });
    }

    // Hitung biaya tambahan untuk setiap tipe kamar di booking
    let additionalSubtotal = 0;
    for (const item of booking.details) {
      additionalSubtotal += item.pricePerNight * item.quantity * additionalNights;
    }

    // Jika bayar menggunakan wallet
    if (booking.paymentMethod === "wallet") {
      const wallet = await walletService.getOrCreateWallet(booking.customerId);
      if (wallet.balance < additionalSubtotal) {
        return res.status(400).json({
          success: false,
          message: `Saldo E-Wallet tidak mencukupi untuk perpanjangan (Saldo: Rp${wallet.balance.toLocaleString("id-ID")}, Biaya Tambahan: Rp${additionalSubtotal.toLocaleString("id-ID")})`,
          data: null,
        });
      }

      const balanceBefore = wallet.balance;
      wallet.balance -= additionalSubtotal;
      await wallet.save();

      await WalletTransaction.create({
        userId: booking.customerId,
        type: "payment",
        amount: additionalSubtotal,
        balanceBefore,
        balanceAfter: wallet.balance,
        referenceId: booking.bookingCode,
        status: "success",
        note: `Biaya perpanjangan menginap (+${additionalNights} malam) untuk booking ${booking.bookingCode}`,
      });
    } else {
      // Jika bayar lewat Midtrans, buat snap token tambahan untuk extension
      const customer = await User.findById(booking.customerId);
      const userDetails = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      };

      const extCode = `${booking.bookingCode}-EXT-${Date.now()}`;
      const midtransPayment = await midtransService.createSnapToken(extCode, additionalSubtotal, userDetails);
      
      // Simpan snap token tambahan ke booking details/remarks
      booking.payment.snapToken = midtransPayment.token;
      booking.payment.redirectUrl = midtransPayment.redirect_url;
    }

    // Update checkOutDate dan totalAmount booking
    const newCheckOutDate = new Date(booking.checkOutDate);
    newCheckOutDate.setDate(newCheckOutDate.getDate() + additionalNights);
    
    booking.checkOutDate = newCheckOutDate;
    booking.subtotal += additionalSubtotal;
    booking.totalAmount += additionalSubtotal;
    
    // Update data malam di details
    for (const item of booking.details) {
      item.nights += additionalNights;
      item.subtotal += item.pricePerNight * item.quantity * additionalNights;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: booking.paymentMethod === "wallet" 
        ? `Berhasil memperpanjang booking sebanyak +${additionalNights} malam` 
        : `Berhasil mengajukan perpanjangan, silakan bayar tagihan tambahan senilai Rp${additionalSubtotal.toLocaleString("id-ID")}`,
      data: booking,
    });
  } catch (error) {
    console.error("Error Extend Booking:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, isDeleted: false })
      .populate("hotelId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
        data: null,
      });
    }

    // Verifikasi hak akses hotel owner/manager atau admin
    const isHotelOwner = req.user.role === "HotelManager" && booking.hotelId.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "Admin";

    if (!isHotelOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya pengelola hotel yang bisa memproses check-in.",
        data: null,
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: `Booking tidak bisa check-in karena berstatus '${booking.status}' (Harus 'confirmed')`,
        data: null,
      });
    }

    booking.status = "checked_in";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Check-in berhasil diproses",
      data: booking,
    });
  } catch (error) {
    console.error("Error Check In:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, isDeleted: false })
      .populate("hotelId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
        data: null,
      });
    }

    const isHotelOwner = req.user.role === "HotelManager" && booking.hotelId.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "Admin";

    if (!isHotelOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Hanya pengelola hotel yang bisa memproses check-out.",
        data: null,
      });
    }

    if (booking.status !== "checked_in") {
      return res.status(400).json({
        success: false,
        message: `Booking tidak bisa check-out karena berstatus '${booking.status}' (Harus 'checked_in')`,
        data: null,
      });
    }

    // Kembalikan available_quota kamar karena tamu sudah checkout
    const hotel = await Hotel.findById(booking.hotelId._id);
    if (hotel) {
      for (const item of booking.details) {
        const roomType = hotel.room_types.id(item.roomTypeId);
        if (roomType) {
          roomType.available_quota += item.quantity;
        }
      }
      await hotel.save();
    }

    booking.status = "checked_out";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Check-out berhasil diproses, kuota kamar hotel dipulihkan",
      data: booking,
    });
  } catch (error) {
    console.error("Error Check Out:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { bookingId } = req.params;
    const customerId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating wajib bernilai antara 1 s/d 5",
        data: null,
      });
    }

    const booking = await Booking.findOne({ _id: bookingId, customerId, isDeleted: false });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
        data: null,
      });
    }

    if (booking.status !== "checked_out") {
      return res.status(400).json({
        success: false,
        message: "Anda hanya bisa memberikan ulasan setelah selesai menginap (checked_out)",
        data: null,
      });
    }

    // Cek apakah ulasan untuk booking ini sudah pernah dibuat
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Anda sudah memberikan ulasan untuk booking pemesanan ini",
        data: null,
      });
    }

    const review = await Review.create({
      hotelId: booking.hotelId,
      customerId,
      bookingId,
      rating,
      comment,
    });

    // Hitung dan update rating rata-rata hotel
    const hotelReviews = await Review.find({ hotelId: booking.hotelId, isDeleted: false });
    const totalReviews = hotelReviews.length;
    const sumRating = hotelReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = (sumRating / totalReviews).toFixed(1);

    await Hotel.findByIdAndUpdate(booking.hotelId, {
      rating: parseFloat(avgRating),
      reviewCount: totalReviews,
    });

    return res.status(201).json({
      success: true,
      message: "Terima kasih atas ulasan Anda",
      data: review,
    });
  } catch (error) {
    console.error("Error Create Review:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.getHotelReviews = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const reviews = await Review.find({ hotelId, isDeleted: false })
      .populate("customerId", "name avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil ulasan hotel",
      data: reviews,
    });
  } catch (error) {
    console.error("Error Get Hotel Reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.healthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "System is healthy (Health Check)",
    data: {
      uptime: process.uptime(),
      timestamp: new Date(),
    },
  });
};
