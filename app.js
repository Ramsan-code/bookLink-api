// Basic server setup
import express from "express";
import mongoose from "mongoose";
import readerRouter from "./routes/readerRouter.js";
import bookRouter from "./routes/bookRouter.js";
import reviewRouter from "./routes/reviewRouter.js";
import transactionRouter from "./routes/transactionRouter.js";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/book-link");
    console.log(" MongoDB Connected!");
  } catch (error) {
    console.error(" Error connecting to MongoDB:", error);
  }
};

connectDB();
const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/api/readers", readerRouter);
app.use("/api/books", bookRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/transactions", transactionRouter);

app.get("/", (req, res) => {
  res.send("Hello Express!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
