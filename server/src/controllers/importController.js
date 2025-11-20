const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// @desc    Import products from CSV
// @route   POST /api/products/import
// @access  Private/Admin
const importProductsFromCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const products = [];
  const errors = [];
  let lineNumber = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv({
      skipEmptyLines: true,
      trim: true
    }))
    .on('data', (row) => {
      lineNumber++;
      try {
        // Try to find name field (most flexible mapping)
        const name = row.name || row.Name || row.NAME || 
                     row.product || row.Product || row.PRODUCT ||
                     row.title || row.Title || row.TITLE ||
                     row.item || row.Item || row.ITEM ||
                     Object.values(row)[0]; // First column as fallback

        // Skip truly empty rows
        if (!name || name.trim() === '') {
          return;
        }

        // Generate SKU if not provided
        const sku = row.sku || row.SKU || row.code || row.Code || 
                    `SKU-${Date.now()}-${lineNumber}`;

        // Get category or use default
        const category = row.category || row.Category || row.CATEGORY || 
                        row.type || row.Type || row.TYPE || 
                        'Uncategorized';

        // Parse numeric values with defaults
        const price = parseFloat(row.price || row.Price || row.PRICE || row.cost || row.Cost || 0) || 0;
        const quantity = parseInt(row.quantity || row.Quantity || row.QUANTITY || row.stock || row.Stock || row.qty || 0) || 0;

        // Build product object with all available data
        products.push({
          name: String(name).trim(),
          sku: String(sku).trim(),
          category: String(category).trim(),
          price: price,
          quantity: quantity,
          description: (row.description || row.Description || row.desc || row.Desc || 'No description').trim(),
          imageUrl: (row.imageUrl || row.imageurl || row.ImageUrl || row.image || row.Image || 'https://via.placeholder.com/300').trim()
        });
        
        console.log(`Line ${lineNumber} imported: ${products[products.length - 1].name}`);
      } catch (error) {
        console.error(`Line ${lineNumber} error:`, error.message);
        // Continue processing other rows
      }
    })
    .on('end', async () => {
      try {
        console.log(`\n=== CSV Import Summary ===`);
        console.log(`Total lines processed: ${lineNumber}`);
        console.log(`Valid products found: ${products.length}`);
        console.log(`Errors: ${errors.length}`);
        
        if (products.length > 0) {
          console.log('\nProducts to import:');
          products.forEach((p, i) => console.log(`  ${i+1}. ${p.name} (${p.sku})`));
        }
        
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        if (products.length === 0) {
          console.log('\nERROR: No valid products found!');
          return res.status(400).json({ 
            message: 'No valid products found in CSV. Check that your CSV has columns: name, sku, category (required). Price and quantity are optional.',
            errors,
            imported: 0
          });
        }

        // Insert products
        const insertedProducts = await Product.insertMany(products, { ordered: false });

        // Log activity
        await ActivityLog.create({
          user: req.user._id,
          action: 'BULK_CREATE',
          details: `Imported ${insertedProducts.length} products from CSV`
        });

        res.status(201).json({
          message: `Successfully imported ${insertedProducts.length} products${errors.length > 0 ? ` (${errors.length} rows skipped)` : ''}`,
          imported: insertedProducts.length,
          skipped: errors.length,
          products: insertedProducts
        });
      } catch (error) {
        console.error('Error importing products:', error);
        res.status(500).json({ 
          message: 'Error importing products',
          error: error.message 
        });
      }
    })
    .on('error', (error) => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ message: 'Error reading CSV file', error: error.message });
    });
};

module.exports = { upload, importProductsFromCSV };
