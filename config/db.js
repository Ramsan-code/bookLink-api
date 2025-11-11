import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are now default in Mongoose 6+, but included for clarity
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on("connected", () => {
      console.log(" Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      console.error(` Mongoose connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("  Mongoose disconnected from DB");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("  Mongoose connection closed due to app termination");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(` Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;