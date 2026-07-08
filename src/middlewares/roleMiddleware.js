module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, informasi user tidak ditemukan",
        data: null,
      });
    }

    // Ubah allowedRoles ke bentuk array jika berupa single string untuk kemudahan perbandingan
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "Akses ditolak, Anda tidak memiliki izin (role) untuk mengakses resource ini",
        data: null,
      });
    }

    next();
  };
};
