const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, '..', 'Project-Hotel-Management.postman_collection.json');
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Deskripsi untuk Folder
const folderDescriptions = {
  '1. Auth & Security': 'Modul untuk registrasi pengguna baru, verifikasi kode OTP, pengiriman ulang kode OTP, dan otentikasi login pengguna.',
  '2. User Profile': 'Mengelola detail profil pengguna terautentikasi, upload foto profil menggunakan Multer, hapus foto, serta menonaktifkan akun.',
  '3. E-Wallet & Payments': 'Mengelola detail saldo e-wallet pengguna, request pembayaran topup via Midtrans Snap, pembatalan topup, dan penanganan status webhook callback dari Midtrans.',
  '4. Categories': 'Modul CRUD master data kategori hotel (Resort, Budget, City Hotel, dll).',
  '5. Vouchers': 'Modul manajemen voucher diskon promosi untuk memotong harga total pemesanan kamar.',
  '6. Hotels & Room': 'Modul untuk mengelola data master Hotel beserta sub-dokumen Tipe Kamar (Room Types). Akses modifikasi (POST, PUT, DELETE) dibatasi hanya untuk Admin dan HotelManager.',
  'Kamar': 'Sub-modul untuk mengelola Tipe Kamar (Room Types) yang disematkan di dalam dokumen hotel.',
  '7. Bookings & Transactions': 'Modul utama untuk melakukan transaksi pemesanan kamar hotel oleh Customer dengan opsi pembayaran saldo E-Wallet atau integrasi Snap Midtrans.',
  '8. Check-In, Check-Out & Ulasan': 'Modul tambahan untuk check-in/out tamu hotel dan pemberian ulasan/review bintang.',
  '9. System Health Check': 'Mengecek kesehatan sistem server web service.',
  '10. Weather Forecast (OpenWeatherMap)': 'Modul tambahan cuaca setempat menggunakan OpenWeatherMap API (Opsional).'
};

// Deskripsi untuk Requests
const requestDescriptions = {
  // Auth
  '1.1 Register': 'Mendaftarkan akun baru ke sistem.\n\n**Role**: Public / Guest\n**Body Parameters (urlencoded)**:\n- `name` (Wajib) Nama lengkap pengguna\n- `email` (Wajib) Email unik untuk login\n- `password` (Wajib) Min. 8 karakter\n- `phone` (Wajib) Nomor telepon aktif\n- `role` (Opsional) Pilihan: \'Customer\', \'HotelManager\', \'Admin\' (Default: \'Customer\')',
  '1.2 Login': 'Melakukan autentikasi masuk ke sistem menggunakan email dan password untuk mendapatkan token JWT.\n\n**Role**: Public / Guest\n**Body Parameters (urlencoded)**:\n- `email` (Wajib) Email terdaftar\n- `password` (Wajib) Password terdaftar',
  '1.3 Verifikasi Token OTP': 'Memverifikasi akun pengguna yang baru didaftarkan dengan kode OTP yang dikirimkan ke email.\n\n**Role**: Public / Guest\n**Body Parameters (urlencoded)**:\n- `email` (Wajib) Email pengguna\n- `otp` (Wajib) Kode OTP 6 digit',
  '1.4 Resend OTP': 'Mengirimkan kembali kode verifikasi OTP yang baru ke email pengguna.\n\n**Role**: Public / Guest\n**Body Parameters (urlencoded)**:\n- `email` (Wajib) Email pengguna',

  // Profile
  '2.1 Get Profile User': 'Mengambil informasi detail profil lengkap dari pengguna yang sedang masuk (logged-in).\n\n**Role**: Logged-In User\n**Header**: `Authorization: Bearer <token>`',
  '2.2 Upload Foto Profil (Avatar)': 'Mengunggah berkas foto profil baru menggunakan middleware Multer.\n\n**Role**: Logged-In User\n**Header**: `Authorization: Bearer <token>`\n**Body (form-data)**:\n- `avatar` (Wajib, File gambar, maks. 2MB)',
  '2.3 Hapus Foto Profil (Avatar)': 'Menghapus foto profil avatar pengguna saat ini dan mengembalikannya ke avatar default.\n\n**Role**: Logged-In User\n**Header**: `Authorization: Bearer <token>`',
  '2.4 Hapus / Menonaktifkan Akun (Soft Delete)': 'Menonaktifkan akun pengguna saat ini secara lunak (Soft Delete).\n\n**Role**: Logged-In User\n**Header**: `Authorization: Bearer <token>`',

  // Wallet & Payments
  '3.1 Get Wallet & History': 'Mendapatkan saldo dompet digital serta seluruh riwayat mutasi transaksi (topup, payment, refund).\n\n**Role**: Customer / Logged-In User\n**Header**: `Authorization: Bearer <token>`',
  '3.2 Request Top-Up Saldo': 'Membuat permintaan top-up saldo baru dan men-generate token transaksi serta redirect url pembayaran Midtrans Snap.\n\n**Role**: Customer\n**Header**: `Authorization: Bearer <token>`\n**Body (urlencoded)**:\n- `amount` (Wajib) Nominal top-up minimal Rp10.000',
  '3.3 Batalkan Top-Up Pending': 'Membatalkan transaksi top-up yang masih berstatus pending.\n\n**Role**: Customer\n**Header**: `Authorization: Bearer <token>`',
  '3.4 Midtrans Webhook (Public)': 'Webhook callback otomatis dari server Midtrans untuk memperbarui status transaksi (topup sukses, expired, dll) secara instan di database.\n\n**Role**: Public / Midtrans Server\n**Body (JSON)**: Payload callback standar dari Midtrans',

  // Categories
  '4.1 Create Category': 'Membuat kategori hotel baru.\n\n**Role**: Admin\n**Header**: `Authorization: Bearer <token>`\n**Body (urlencoded)**:\n- `name` (Wajib) Nama kategori\n- `description` (Wajib) Deskripsi kategori',
  '4.2 Get All Categories': 'Mengambil seluruh daftar kategori hotel yang aktif di sistem.\n\n**Role**: Public / Guest',
  '4.3 Update Category': 'Memperbarui data detail kategori berdasarkan ID.\n\n**Role**: Admin\n**Header**: `Authorization: Bearer <token>`\n**Body (urlencoded)**:\n- `name` / `description` (Opsional)',
  '4.4 Delete Category': 'Menghapus data kategori hotel secara lunak berdasarkan ID.\n\n**Role**: Admin\n**Header**: `Authorization: Bearer <token>`',

  // Vouchers
  '5.1 Create Voucher': 'Membuat voucher diskon promosi baru.\n\n**Role**: Admin / HotelManager\n**Header**: `Authorization: Bearer <token>`\n**Body (urlencoded)**:\n- `code` (Wajib) Kode voucher unik (Auto-Uppercase)\n- `type` (Wajib) percentage / fixed\n- `value` (Wajib) Nominal/persen diskon\n- `quota` (Wajib) Total kuota pemakaian\n- `startDate` (Wajib) YYYY-MM-DD\n- `expiredDate` (Wajib) YYYY-MM-DD',
  '5.2 Get All Vouchers': 'Mengambil seluruh voucher diskon yang ada di sistem.\n\n**Role**: Admin / HotelManager\n**Header**: `Authorization: Bearer <token>`',
  '5.3 Check Voucher Code Valid': 'Mengecek keabsahan dan detail kuota kode voucher sebelum digunakan untuk booking.\n\n**Role**: Customer\n**Header**: `Authorization: Bearer <token>`',
  '5.4 Update Voucher': 'Mengubah data detail voucher berdasarkan ID.\n\n**Role**: Admin / HotelManager\n**Header**: `Authorization: Bearer <token>`',
  '5.5 Delete Voucher': 'Menghapus voucher secara lunak berdasarkan ID.\n\n**Role**: Admin / HotelManager\n**Header**: `Authorization: Bearer <token>`',

  // Hotels & Room
  'TambahHotel': 'Membuat data hotel baru.\n\n**Role**: Admin / HotelManager\n**Header**: `Authorization: Bearer <token>`\n**Body (urlencoded)**:\n- `name` (Wajib) Nama hotel\n- `address` (Wajib) Alamat lengkap\n- `city` (Wajib) Kota hotel\n- `categoryId` (Wajib) ID Kategori hotel',
  'Lihat Semua Hotel': 'Mengambil seluruh daftar hotel yang terdaftar di database.\n\n**Role**: Public / Guest',
  'melihat satu Hotel': 'Mendapatkan informasi detail lengkap satu hotel berdasarkan ID.\n\n**Role**: Public / Guest',
  'Ubah Data Hotel': 'Memperbarui detail data hotel.\n\n**Role**: Admin / HotelManager (Hanya owner hotel terkait)\n**Header**: `Authorization: Bearer <token>`',
  'Hapus hotel': 'Menghapus hotel secara soft delete.\n\n**Role**: Admin / HotelManager (Hanya owner hotel terkait)\n**Header**: `Authorization: Bearer <token>`',

  // Kamar
  'Tambah Kamar baru di hotel': 'Menambahkan tipe kamar baru di array room_types hotel.\n\n**Role**: Admin / HotelManager\n**Header**: `Authorization: Bearer <token>`\n**Body (urlencoded)**:\n- `name` (Wajib) Nama kamar\n- `pricePerNight` (Wajib) Harga per malam\n- `totalQuota` (Wajib) Total kuota kamar',
  'Get kamar di hotel': 'Mengambil seluruh daftar tipe kamar untuk hotel tertentu.\n\n**Role**: Public / Guest',
  'Update Tipe Kamar': 'Memperbarui data tipe kamar berdasarkan hotelId dan roomId.\n\n**Role**: Admin / HotelManager\n**Header**: `Authorization: Bearer <token>`',
  'Delete Kamar': 'Menghapus tipe kamar dari hotel.\n\n**Role**: Admin / HotelManager\n**Header**: `Authorization: Bearer <token>`',

  // Bookings
  '7.1 Create Booking Room': 'Membuat transaksi pemesanan kamar hotel baru. Mendukung diskon voucher, pembayaran saldo E-Wallet instan, atau pembayaran Midtrans Snap.\n\n**Role**: Customer\n**Header**: `Authorization: Bearer <token>`\n**Body (JSON)**:\n- `hotelId` (Wajib) ID Hotel\n- `checkInDate` (Wajib) Format YYYY-MM-DD\n- `checkOutDate` (Wajib) Format YYYY-MM-DD\n- `paymentMethod` (Wajib) wallet / midtrans\n- `details` (Wajib) Array tipe kamar dan kuota\n- `voucherCode` (Opsional) Kode diskon voucher',
  '7.2 Get Bookings List': 'Mengambil riwayat transaksi booking. Customer hanya melihat datanya sendiri. Manager melihat booking hotel miliknya. Admin melihat semua.\n\n**Role**: Logged-In User\n**Header**: `Authorization: Bearer <token>`',
  '7.3 Get Booking Details by ID': 'Mendapatkan informasi detail pemesanan hotel berdasarkan ID.\n\n**Role**: Admin / HotelManager (Owner hotel terkait) / Customer (Pemilik booking)\n**Header**: `Authorization: Bearer <token>`',
  '7.4 Cancel Booking': 'Membatalkan pemesanan. Bila status confirmed dan bayar via wallet, saldo akan otomatis direfund secara instan.\n\n**Role**: Customer (Pemilik booking) / Manager / Admin\n**Header**: `Authorization: Bearer <token>`',
  '7.5 Process Booking Refund (Admin Only)': 'Menyetujui permohonan refund pembayaran booking yang diajukan customer.\n\n**Role**: Admin\n**Header**: `Authorization: Bearer <token>`',

  // CheckIn/Checkout & Reviews
  '8.1 Check-In Guest': 'Memproses check-in tamu ketika sampai di hotel.\n\n**Role**: Admin / HotelManager\n**Header**: `Authorization: Bearer <token>`',
  '8.2 Check-Out Guest': 'Memproses check-out tamu ketika selesai menginap dan otomatis memulihkan kuota kamar hotel.\n\n**Role**: Admin / HotelManager\n**Header**: `Authorization: Bearer <token>`',
  '8.3 Create Review Ulasan': 'Memberikan ulasan rating bintang (1-5) dan komentar ulasan setelah check-out.\n\n**Role**: Customer (Pemilik booking)\n**Header**: `Authorization: Bearer <token>`\n**Body (urlencoded)**:\n- `rating` (Wajib) 1 s/d 5\n- `comment` (Opsional)',
  '8.4 Get Hotel Reviews List': 'Mengambil seluruh ulasan ulasan tamu untuk hotel tertentu.\n\n**Role**: Public / Guest',

  // Health
  '9.1 Get Health Status': 'Mendapatkan status kesehatan server Node.js dan uptime sistem.\n\n**Role**: Public / Guest',

  // Weather
  '10.1 Get Current Weather by City': 'Mengambil cuaca real-time di kota tertentu.\n\n**Role**: Public / Guest',
  '10.2 Get 5 Days Weather Forecast': 'Mengambil ramalan perkiraan cuaca 5 hari di kota tertentu.\n\n**Role**: Public / Guest',
  '10.3 Get Weather by Hotel ID': 'Mengambil cuaca real-time berdasarkan kota hotel terkait.\n\n**Role**: Public / Guest'
};

// Fungsi rekursif untuk memperbarui deskripsi di Postman
function updateItem(item) {
  if (item.name && folderDescriptions[item.name]) {
    item.description = folderDescriptions[item.name];
  }
  if (item.name && requestDescriptions[item.name]) {
    if (item.request) {
      item.request.description = requestDescriptions[item.name];
    }
  }

  if (item.item && Array.isArray(item.item)) {
    item.item.forEach(subItem => updateItem(subItem));
  }
}

// Proses seluruh item
collection.item.forEach(item => updateItem(item));

// Simpan kembali berkas JSON
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf8');
console.log('Postman Collection descriptions successfully updated!');
