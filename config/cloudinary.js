const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
console.log('🔧 Configuring Cloudinary...');
console.log('📍 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
console.log('🔑 API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
console.log('🔐 API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary connection
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connected successfully!'))
  .catch((err) => console.error('❌ Cloudinary connection failed:', err.message));

// Storage for order images
const orderImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    console.log('📸 Processing order image upload...');
    console.log('📁 File details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    return {
      folder: 'sajan-shree/orders',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    };
  },
});

console.log('📦 Order image storage configured');

// Storage for product detail images
const productDetailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sajan-shree/product-details',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const uploadOrderImage = multer({ storage: orderImageStorage });
const uploadProductDetailImage = multer({ storage: productDetailStorage });

module.exports = {
  cloudinary,
  uploadOrderImage,
  uploadProductDetailImage,
};
