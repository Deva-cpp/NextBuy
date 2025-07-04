import express from "express";
import { honeypotCheck, deviceFingerprinting, analyzeIP, botDetection } from "../middleware/botProtection.js";

const router = express.Router();

// Sample product data (in a real app, this would come from a database)
const sampleProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 99.99,
    category: "Electronics",
    description: "High-quality wireless headphones with noise cancellation"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 299.99,
    category: "Electronics", 
    description: "Advanced fitness tracking and notification features"
  },
  {
    id: 3,
    name: "Laptop Stand",
    price: 49.99,
    category: "Accessories",
    description: "Ergonomic aluminum laptop stand"
  },
  {
    id: 4,
    name: "Coffee Mug",
    price: 14.99,
    category: "Home",
    description: "Ceramic coffee mug with thermal insulation"
  },
  {
    id: 5,
    name: "Backpack",
    price: 79.99,
    category: "Accessories",
    description: "Waterproof travel backpack with multiple compartments"
  }
];

// GET all products
router.get("/", [deviceFingerprinting, analyzeIP], async (req, res) => {
  try {
    // Check for bot activity
    if (req.isBot && req.botScore > 0.8 && !req.isLegitimateBot) {
      return res.status(403).json({
        error: "Access denied",
        message: "Automated access detected"
      });
    }

    // Return products
    res.json({
      success: true,
      products: sampleProducts,
      total: sampleProducts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Unable to fetch products" 
    });
  }
});

// GET product by ID
router.get("/:id", [deviceFingerprinting, analyzeIP], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Basic input validation
    const productId = parseInt(id);
    if (isNaN(productId) || productId < 1) {
      return res.status(400).json({
        error: "Invalid product ID",
        message: "Product ID must be a positive number"
      });
    }

    const product = sampleProducts.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        error: "Product not found",
        message: `No product found with ID ${productId}`
      });
    }

    res.json({
      success: true,
      product,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Unable to fetch product" 
    });
  }
});

// Search products
router.get("/search/:query", [deviceFingerprinting, analyzeIP], async (req, res) => {
  try {
    const { query } = req.params;
    
    // Basic input validation and sanitization
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid search query",
        message: "Search query cannot be empty"
      });
    }

    // Check for malicious patterns in search query
    const maliciousPatterns = [
      /(\bor\b|\|\|)/i,
      /(\band\b|\&\&)/i,
      /(select|insert|update|delete|drop|union|script)/i,
      /[<>'"(){}[\];]/,
      /(\-\-|\/\*|\*\/)/
    ];

    const isMalicious = maliciousPatterns.some(pattern => pattern.test(query));
    
    if (isMalicious) {
      return res.status(400).json({
        error: "Invalid search query",
        message: "Search query contains prohibited characters"
      });
    }

    const searchTerm = query.toLowerCase().trim();
    const results = sampleProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );

    res.json({
      success: true,
      query: searchTerm,
      results,
      total: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Unable to search products" 
    });
  }
});

export default router;
