const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // อ้างอิง User ที่สั่งซื้อ
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // รายการสินค้าในออเดอร์
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    price: { 
      type: Number, 
      required: true 
    }
  }],
  
  // รวมราคาทั้งหมด
  totalAmount: { 
    type: Number, 
    required: true 
  },
  
  // สถานะออเดอร์
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  
  // ข้อมูลการจัดส่ง
  shippingAddress: {
    street: String,
    city: String,
    zipCode: String,
    country: { type: String, default: 'Thailand' }
  },
  
  // วันที่สั่งซื้อและอัปเดต
  orderDate: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Index เพื่อเพิ่มประสิทธิภาพการค้นหา
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);
