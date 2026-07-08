module.exports = (err, req, res, next) => {
  console.error("Error Handler Caught:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Terjadi kesalahan pada server";
  let errors = err.errors || null;

  // Tangani Error Validasi Joi
  if (err.isJoi) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
  }

  // Tangani Error Cast (misal format MongoDB ObjectId salah)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Format ID tidak valid untuk field: ${err.path}`;
  }

  // Tangani Error Duplicate Key MongoDB (misal email atau kode voucher ganda)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue)[0];
    message = `Data '${duplicateField}' sudah terdaftar, silakan gunakan nilai lain`;
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  return res.status(statusCode).json(response);
};
