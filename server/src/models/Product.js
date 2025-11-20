const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      
    },
    category: {
      type: String,
     
    },
    description: {
      type: String,
      
    },
    price: {
      type: Number,
     
      default: 0,
    },
    quantity: {
      type: Number,
     
      default: 0,
    },
    sku: {
      type: String,
      
      unique: true,
    },
    imageUrl: {
      type: String,
      
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
