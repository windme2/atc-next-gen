const Product = require('../models/Product');

// เพิ่มสินค้าใหม่ (POST /api/products)
exports.create = async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    
    const product = new Product({
      name,
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0
    });
    
    await product.save();
    
    res.status(201).json({
      message: 'เพิ่มสินค้าสำเร็จ',
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock
      }
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'ไม่สามารถเพิ่มสินค้าได้', 
      error: error.message 
    });
  }
};

// ดึงสินค้าทั้งหมด (GET /api/products)
exports.list = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('name price stock createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'รายการสินค้าทั้งหมด',
      count: products.length,
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'ไม่สามารถดึงข้อมูลสินค้าได้', 
      error: error.message 
    });
  }
};

// แก้ไขข้อมูลสินค้า (PUT /api/products/:id)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    
    const updated = await Product.findByIdAndUpdate(
      id, 
      {
        name,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0
      }, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'ไม่พบสินค้าที่ต้องการแก้ไข' });
    }
    
    res.json({
      message: 'แก้ไขสินค้าสำเร็จ',
      product: {
        id: updated._id,
        name: updated.name,
        price: updated.price,
        stock: updated.stock
      }
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'ไม่สามารถแก้ไขสินค้าได้', 
      error: error.message 
    });
  }
};

// ลบสินค้า (DELETE /api/products/:id)
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Product.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'ไม่พบสินค้าที่ต้องการลบ' });
    }
    
    res.json({ 
      message: 'ลบสินค้าสำเร็จ',
      deletedProduct: {
        id: deleted._id,
        name: deleted.name
      }
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'ไม่สามารถลบสินค้าได้', 
      error: error.message 
    });
  }
};

// Query 1: ดึงสินค้าทั้งหมด (GET /api/products/query/all)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .select('name price stock createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'ดึงสินค้าทั้งหมดสำเร็จ',
      totalProducts: products.length,
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        createdAt: product.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: 'ไม่สามารถดึงข้อมูลสินค้าได้',
      error: error.message
    });
  }
};

// Query 2: ดึงสินค้าที่มี stock < 10 (GET /api/products/query/low-stock)
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name price stock')
      .sort({ stock: 1 });
    
    res.json({
      message: 'สินค้าที่ stock น้อยกว่า 10 ชิ้น',
      totalLowStock: lowStockProducts.length,
      products: lowStockProducts.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        status: product.stock === 0 ? 'หมด' : 'ใกล้หมด'
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: 'ไม่สามารถดึงข้อมูลสินค้า stock ต่ำได้',
      error: error.message
    });
  }
};

// Query 3: รวมราคาสินค้าทั้งหมดในระบบ (GET /api/products/query/total-value)
exports.getTotalValue = async (req, res) => {
  try {
    // ใช้ Aggregation Pipeline
    const result = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStockQuantity: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          averagePrice: { $avg: "$price" },
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" }
        }
      }
    ]);
    
    if (result.length === 0) {
      return res.json({
        message: 'ไม่มีสินค้าในระบบ',
        totalValue: 0
      });
    }
    
    const stats = result[0];
    
    res.json({
      message: 'สถิติมูลค่าสินค้าทั้งหมด',
      summary: {
        totalProducts: stats.totalProducts,
        totalStockQuantity: stats.totalStockQuantity,
        totalValue: stats.totalValue.toFixed(2),
        averagePrice: stats.averagePrice.toFixed(2),
        maxPrice: stats.maxPrice,
        minPrice: stats.minPrice
      },
      currency: 'THB'
    });
  } catch (error) {
    res.status(500).json({
      message: 'ไม่สามารถคำนวณมูลค่าสินค้าได้',
      error: error.message
    });
  }
};
