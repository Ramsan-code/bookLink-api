import express from "express";
import {
  getAllReviews,
  createReview,
  getReviewsByBook,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getAllReviews);
router.get("/:bookId", getReviewsByBook);

router.post("/:bookId", createReview);
router.delete("/:id", deleteReview);

export default router;
