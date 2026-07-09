# Panduan Pengujian & Tutorial Web Service Hotel Management

Dokumen ini menjelaskan langkah-langkah untuk menjalankan server, mengonfigurasi jalur pembayaran Midtrans Sandbox, dan cara menguji seluruh alur dari registrasi hingga Top-up Wallet menggunakan Midtrans Simulator.

1. Kirim OTP via Gmail SMTP
---

## 1. Menjalankan Server Lokal

Jalankan perintah berikut di terminal root proyek untuk menyalakan database dan server development:

```bash
# Menjalankan server development dengan Nodemon
npm run dev
```

*Catatan: Server akan berjalan secara default di port `3000` (`http://localhost:3000`).*

---

## 2. Mengaktifkan Webhook Midtrans (Notifikasi Pembayaran)

Midtrans membutuhkan URL publik (https) agar server Sandbox mereka dapat mengirimkan notifikasi status pembayaran (webhook) ke server lokal Anda.

### Opsi A: Menggunakan Localtunnel
Buka terminal baru, jalankan:
```bash
npx localtunnel --port 3000
```
*Output akan berupa link seperti: `https://xxxx.loca.lt`*

### Opsi B: Menggunakan Ngrok
Buka terminal baru, jalankan:
```bash
ngrok http 3000
```
*Output akan berupa link seperti: `https://xxxx.ngrok-free.app`*

### Registrasi di Dashboard Midtrans
1. Salin URL publik yang Anda dapatkan di atas.
2. Buka dan login ke [Midtrans Merchant Dashboard (Sandbox)](https://dashboard.sandbox.midtrans.com/).
3. Masuk ke menu **Settings** -> **Configuration**.
4. Isi kolom **Payment Notification URL** dengan URL publik Anda diikuti dengan path webhook:
   ```text
   https://<domain-publik-anda>/api/v1/payments/webhook
   ```
5. Klik **Update** untuk menyimpan konfigurasi.

---

## 3. Alur Pengujian Fitur Wallet & Top-Up (Langkah demi Langkah)

Gunakan Postman untuk melakukan pengujian dengan urutan sebagai berikut:

### Langkah 1: Registrasi Akun Baru
* **Endpoint**: `POST /api/v1/auth/register`
* **Body (JSON)**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "Password123!",
    "phone": "08123456789"
  }
  ```
* **Aksi**: Cek terminal/konsol server Anda untuk melihat kode OTP 6-digit yang dikirimkan via Gmail.

### Langkah 2: Verifikasi Kode OTP
* **Endpoint**: `POST /api/v1/auth/verify-otp`
* **Body (JSON)**:
  ```json
  {
    "email": "budi@example.com",
    "otpCode": "123456" // Ganti dengan OTP dari konsol
  }
  ```

### Langkah 3: Login Akun
* **Endpoint**: `POST /api/v1/auth/login`
* **Body (JSON)**:
  ```json
  {
    "email": "budi@example.com",
    "password": "Password123!"
  }
  ```
* **Aksi**: Salin token JWT dari respons (`data.token`). Tempelkan token ini ke bagian Headers Postman sebagai `Authorization: Bearer <token_jwt>` pada langkah-langkah berikutnya.

### Langkah 4: Cek Saldo & Riwayat Awal (Harus 0)
* **Endpoint**: `GET /api/v1/wallets`
* **Headers**: `Authorization: Bearer <token_jwt>`
* **Verifikasi**: Memastikan `balance` bernilai `0` dan array `transactions` kosong.

### Langkah 5: Ajukan Permintaan Top-Up
* **Endpoint**: `POST /api/v1/wallets/topup`
* **Headers**: `Authorization: Bearer <token_jwt>`
* **Body (JSON)**:
  ```json
  {
    "amount": 100000
  }
  ```
* **Aksi**: 
  1. Salin `redirectUrl` yang ada di dalam `data.payment.redirectUrl`.
  2. Buka tautan tersebut di browser Anda untuk masuk ke halaman pembayaran Midtrans Snap.

### Langkah 6: Melakukan Pembayaran di Simulator
1. Di halaman Snap Midtrans yang terbuka di browser, pilih metode pembayaran, misalnya **Bank Transfer** -> **Permata** atau **BCA** (atau bank lainnya).
2. Salin nomor Virtual Account (VA) yang ditampilkan.
3. Buka **[Midtrans Sandbox Simulator](https://simulator.sandbox.midtrans.com/)**.
4. Pilih menu sesuai metode pembayaran Anda (misalnya **Permata VA** atau **BCA VA**).
5. Tempelkan nomor VA yang sudah disalin ke kolom simulator, lalu klik **Pay**.
6. Konfirmasi pembayaran. Di halaman Snap browser Anda, status pembayaran akan berubah menjadi sukses secara real-time.

### Langkah 7: Verifikasi Saldo & Riwayat Akhir
* **Aksi**: Di terminal server lokal, Anda akan melihat log `[Midtrans Webhook] Top-up ... berhasil diproses`.
* **Endpoint**: `GET /api/v1/wallets`
* **Headers**: `Authorization: Bearer <token_jwt>`
* **Verifikasi**: Saldo dompet Anda sekarang harus bernilai `100000` dan tercatat satu transaksi bertipe `topup` dengan status `success`.

### Langkah 8: Membatalkan Top-Up Pending (Opsional)
* Jika ingin menguji pembatalan, ajukan permintaan top-up baru (Langkah 5), salin `topupId` (misal `TOPUP-xxxx`).
* **Endpoint**: `PUT /api/v1/wallets/topup/:topupId/cancel`
* **Headers**: `Authorization: Bearer <token_jwt>`
* **Verifikasi**: Kirim permintaan, pastikan merespons sukses `cancelled`. Dan jika di-GET saldo dompet tidak berubah, status transaksi tercatat `failed` di database.