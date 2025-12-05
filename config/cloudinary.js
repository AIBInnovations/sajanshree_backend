const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for order images
const orderImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sajan-shree/orders',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
  },
});

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
