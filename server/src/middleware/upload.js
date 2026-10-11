const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(__dirname, '../../uploads/signatures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `signature-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed for signatures.'), false);
  }
};

const uploadSignature = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  }
});

// Helper to save base64 data URL signature
function saveBase64Signature(base64Data) {
  if (!base64Data || !base64Data.startsWith('data:image/')) {
    return null;
  }

  const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `signature-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, buffer);
  return `/uploads/signatures/${filename}`;
}

module.exports = {
  uploadSignature,
  saveBase64Signature,
  uploadDir
};
