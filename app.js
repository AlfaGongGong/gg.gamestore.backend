import express, { json, urlencoded } from "express";
import mysql from "mysql2";
import authRoutes from "./src/routes/authRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT;

// MySQL connection setup
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

connection.connect((error) => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));

// Routes
app.use("/api", authRoutes);

// Start the server
app.listen(port, (error) => {
  if (error) {
    console.error(`Error starting the server: ${error}`);
    return;
  }
  console.log(`Server running on port ${port}`);
});

export default app;
