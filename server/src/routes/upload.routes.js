const express = require('express');
const router = express.Router();
const { uploadSignature } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

router.post('/signature', authenticateToken, uploadSignature.single('signature'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded or file format rejected. Please upload a valid image (PNG, JPG, WEBP).'
    });
  }

  const relativeUrl = `/uploads/signatures/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Signature uploaded successfully.',
    data: {
      url: relativeUrl,
      filename: req.file.filename,
      size: req.file.size
    }
  });
});

module.exports = router;
