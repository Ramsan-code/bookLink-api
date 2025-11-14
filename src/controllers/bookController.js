import Book from "../models/Book.js";
import { paginationResponse } from "../utils/paginate.js";

/**
 * Get all books with advanced search and filters
 */
export const getAllBooks = async (req, res) => {
  try {
    const {
      search,
      category,
      condition,
      mode,
      minPrice,
      maxPrice,
      available,
      isApproved,
      isFeatured,
      owner,
      sort,
      page = 1,
      limit = 10,
      lat,
      lng,
      radius,
    } = req.query;

    // Build query
    const query = {};

    // Text search in title, author, description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Condition filter
    if (condition) {
      query.condition = condition;
    }

    // Mode filter (Sell/Rent)
    if (mode) {
      query.mode = mode;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Availability filter
    if (available !== undefined) {
      query.available = available === "true";
    }

    // Approval filter (default to approved for public)
    if (isApproved !== undefined) {
      query.isApproved = isApproved === "true";
    } else {
      // By default, show only approved books to users
      query.isApproved = true;
    }

    // Featured filter
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    // Owner filter
    if (owner) {
      query.owner = owner;
    }

    // Location-based search (books within radius)
    if (lat && lng && radius) {
      const radiusInRadians = parseFloat(radius) / 6378.1; // Earth radius in km
      query.location = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians],
        },
      };
    }

    // Sort
    let sortQuery = { createdAt: -1 }; // Default: newest first
    if (sort) {
      sortQuery = {};
      const sortFields = sort.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sortQuery[field.substring(1)] = -1;
        } else {
          sortQuery[field] = 1;
        }
      });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const books = await Book.find(query)
      .populate("owner", "name email location")
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    const total = await Book.countDocuments(query);
    const response = paginationResponse(books, pageNum, limitNum, total);

    // Add filters info to response
    response.filters = {
      search,
      category,
      condition,
      mode,
      priceRange: minPrice || maxPrice ? { minPrice, maxPrice } : null,
      location: lat && lng && radius ? { lat, lng, radius } : null,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Search books near a location
 */
export const getBooksNearLocation = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query; // Default 10km

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const books = await Book.find({
      isApproved: true,
      available: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    })
      .populate("owner", "name email")
      .limit(20);

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get featured books
 */
export const getFeaturedBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const books = await Book.find({
      isFeatured: true,
      isApproved: true,
      available: true,
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Book.countDocuments({
      isFeatured: true,
      isApproved: true,
    });

    const response = paginationResponse(books, pageNum, limitNum, total);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get available books for rent or sale
 */
export const getAvailableBooks = async (req, res) => {
  try {
    const { mode, page = 1, limit = 10 } = req.query; // mode: Sell or Rent

    const query = {
      available: true,
      isApproved: true,
    };

    if (mode) {
      query.mode = mode;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const books = await Book.find(query)
      .populate("owner", "name email location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Book.countDocuments(query);
    const response = paginationResponse(books, pageNum, limitNum, total);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Advanced search with multiple filters
 */
export const advancedSearch = async (req, res) => {
  try {
    const {
      q, // General search query
      categories, // Comma-separated categories
      conditions, // Comma-separated conditions
      modes, // Comma-separated modes
      minPrice,
      maxPrice,
      sortBy = "relevance", // relevance, price-asc, price-desc, newest, oldest
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isApproved: true };

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Multiple categories
    if (categories) {
      const categoryList = categories.split(",");
      query.category = { $in: categoryList };
    }

    // Multiple conditions
    if (conditions) {
      const conditionList = conditions.split(",");
      query.condition = { $in: conditionList };
    }

    // Multiple modes
    if (modes) {
      const modeList = modes.split(",");
      query.mode = { $in: modeList };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sortQuery = { createdAt: -1 };
    switch (sortBy) {
      case "price-asc":
        sortQuery = { price: 1 };
        break;
      case "price-desc":
        sortQuery = { price: -1 };
        break;
      case "newest":
        sortQuery = { createdAt: -1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "title":
        sortQuery = { title: 1 };
        break;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const books = await Book.find(query)
      .populate("owner", "name email")
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    const total = await Book.countDocuments(query);
    const response = paginationResponse(books, pageNum, limitNum, total);

    // Add search metadata
    response.searchQuery = q;
    response.appliedFilters = {
      categories: categories?.split(","),
      conditions: conditions?.split(","),
      modes: modes?.split(","),
      priceRange: { minPrice, maxPrice },
      sortBy,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get books by category with filters
 */
export const getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10, sort, minPrice, maxPrice } = req.query;

    const query = {
      category: { $regex: new RegExp(category, "i") },
      isApproved: true,
    };

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let sortQuery = { createdAt: -1 };
    if (sort) {
      sortQuery = sort.startsWith("-")
        ? { [sort.substring(1)]: -1 }
        : { [sort]: 1 };
    }

    const books = await Book.find(query)
      .populate("owner", "name email")
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    const total = await Book.countDocuments(query);

    if (books.length === 0) {
      return res.status(404).json({
        message: `No books found in category: ${category}`,
      });
    }

    const response = paginationResponse(books, pageNum, limitNum, total);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= KEEP YOUR EXISTING CRUD OPERATIONS =============

export const getBooksById = async (req, res) => {
  try {
    const bookID = req.params.id;
    const book = await Book.findById(bookID).populate("owner", "name email location");
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Increment views
    book.views = (book.views || 0) + 1;
    await book.save();

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.title) {
      return res
        .status(400)
        .json({ errors: [{ field: "title", message: "title already taken" }] });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({ errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const bookID = req.params.id;
    const updateData = req.body;
    const updateBook = await Book.findByIdAndUpdate(bookID, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updateBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(updateBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const bookID = req.params.id;
    const deleteBook = await Book.findByIdAndDelete(bookID);
    if (!deleteBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Keep backward compatibility with old method name
export const getBooksByGenre = getBooksByCategory;