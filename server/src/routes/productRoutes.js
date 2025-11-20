const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { upload, importProductsFromCSV } = require('../controllers/importController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(getProducts).post(protect, createProduct);
router.post('/import', protect, admin, upload.single('file'), importProductsFromCSV);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
