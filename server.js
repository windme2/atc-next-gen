require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const uptimeLogger = require('./src/middleware/uptimeLogger');
const connectDB = require('./db');
const authRoutes = require('./src/routes/auth.routes');
const productRoutes = require('./src/routes/product.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(uptimeLogger);

app.get('/api/status', (req, res) => {
  res.json({
    server: "ATC Next Gen API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

app.use('/api', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
