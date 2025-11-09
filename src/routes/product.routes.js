const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const productController = require('../controllers/product.controller');

// ทุก route ต้องผ่าน JWT authentication ก่อน
router.use(auth);

// POST /api/products → เพิ่มสินค้าใหม่
router.post('/', productController.create);

// GET /api/products → ดึงสินค้าทั้งหมด  
router.get('/', productController.list);

// PUT /api/products/:id → แก้ไขข้อมูลสินค้า
router.put('/:id', productController.update);

// DELETE /api/products/:id → ลบสินค้า
router.delete('/:id', productController.remove);

// === Query Endpoints ===
// Query 1: ดึงสินค้าทั้งหมด (รายละเอียดเพิ่มเติม)
router.get('/query/all', productController.getAllProducts);

// Query 2: ดึงสินค้าที่มี stock < 10
router.get('/query/low-stock', productController.getLowStockProducts);

// Query 3: รวมราคาสินค้าทั้งหมดในระบบ 
router.get('/query/total-value', productController.getTotalValue);

module.exports = router;