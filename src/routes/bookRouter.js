import express from "express";
import {
  getAllBooks,
  getBooksById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByCategory,
  getBooksNearLocation,
  getFeaturedBooks,
  getAvailableBooks,
  advancedSearch,
  getBooksByGenre, // For backward compatibility
} from "../controllers/bookController.js";

const router = express.Router();

// ==================== NEW: SEARCH & FILTER ROUTES ====================

// Advanced search endpoint
router.get("/search/advanced", advancedSearch);

// Location-based search
router.get("/search/nearby", getBooksNearLocation);

// Get featured books
router.get("/featured", getFeaturedBooks);

// Get available books (for sale or rent)
router.get("/available", getAvailableBooks);

// Get books by category
router.get("/category/:category", getBooksByCategory);

// Keep backward compatibility with old route
router.get("/genre/:genre", getBooksByGenre);

// ==================== EXISTING CRUD ROUTES ====================

// Get all books (now with advanced filters)
router.get("/", getAllBooks);

// Get book by ID
router.get("/:id", getBooksById);

// Create new book
router.post("/", createBook);

// Update book
router.put("/:id", updateBook);

// Delete book
router.delete("/:id", deleteBook);

export default router;