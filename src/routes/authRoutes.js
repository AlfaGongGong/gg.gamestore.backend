import { Router } from "express";
const router = Router();
import { hash, compare } from "bcrypt";
import { pool } from "../models/mysql/pool.js";
import { createToken, verifyToken } from "../controllers/authController.js";
import "../config/jwtConfig.js";

// Middleware to verify token
router.use(verifyToken);

// Register a new user

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await hash(password, 10);

  const [rows] = await pool.execute(
    `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
    [username, email, hashedPassword]
  );

  res.json({ id: rows.insertId, username, email });
});

// Login user

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);

  if (rows.length === 0) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const user = rows[0];

  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = createToken(user.id);

  res.json({ token });
});

// Get user details

router.get("/user", async (req, res) => {
  const userId = req.userId;

  const [rows] = await pool.execute(
    `SELECT id, username, email FROM users WHERE id = ?`,
    [userId]
  );

  res.json(rows[0]);
});

// user logout
router.get("/logout", async (req, res) => {
  res.json({ message: "User logged out" });
});

// user delete account
router.delete("/delete", async (req, res) => {
  const userId = req.userId;

  await pool.execute(`DELETE FROM users WHERE id = ?`, [userId]);

  res.json({ message: "User deleted" });
});

// user update account
router.put("/update", async (req, res) => {
  const userId = req.userId;
  const { username, email } = req.body;

  await pool.execute(`UPDATE users SET username = ?, email = ? WHERE id = ?`, [
    username,
    email,
    userId,
  ]);

  res.json({ message: "User updated" });
});

// user change password
router.put("/change-password", async (req, res) => {
  const userId = req.userId;
  const { password } = req.body;

  const hashedPassword = await hash(password, 10);

  await pool.execute(`UPDATE users SET password = ? WHERE id = ?`, [
    hashedPassword,
    userId,
  ]);

  res.json({ message: "Password changed" });
});

// user forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);

  if (rows.length === 0) {
    return res.status(400).json({ message: "Invalid email" });
  }

  res.json({ message: "Password reset email sent" });
});

// user reset password
router.put("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await hash(password, 10);

  await pool.execute(`UPDATE users SET password = ? WHERE email = ?`, [
    hashedPassword,
    email,
  ]);

  res.json({ message: "Password reset" });
});

// user add to wishlist
router.post("/wishlist", async (req, res) => {
  const userId = req.userId;
  const { gameId } = req.body;

  await pool.execute(`INSERT INTO wishlist (user_id, game_id) VALUES (?, ?)`, [
    userId,
    gameId,
  ]);

  res.json({ message: "Game added to wishlist" });
});

// user remove from wishlist
router.delete("/wishlist", async (req, res) => {
  const userId = req.userId;
  const { gameId } = req.body;

  await pool.execute(`DELETE FROM wishlist WHERE user_id = ? AND game_id = ?`, [
    userId,
    gameId,
  ]);

  res.json({ message: "Game removed from wishlist" });
});

// user get wishlist
router.get("/wishlist", async (req, res) => {
  const userId = req.userId;

  const [rows] = await pool.execute(
    `SELECT game_id FROM wishlist WHERE user_id = ?`,
    [userId]
  );

  res.json(rows);
});

// user add to cart
router.post("/cart", async (req, res) => {
  const userId = req.userId;
  const { gameId } = req.body;

  await pool.execute(`INSERT INTO cart (user_id, game_id) VALUES (?, ?)`, [
    userId,
    gameId,
  ]);

  res.json({ message: "Game added to cart" });
});

// user remove from cart
router.delete("/cart", async (req, res) => {
  const userId = req.userId;
  const { gameId } = req.body;

  await pool.execute(`DELETE FROM cart WHERE user_id = ? AND game_id = ?`, [
    userId,
    gameId,
  ]);

  res.json({ message: "Game removed from cart" });
});

// user get cart
router.get("/cart", async (req, res) => {
  const userId = req.userId;

  const [rows] = await pool.execute(
    `SELECT game_id FROM cart WHERE user_id = ?`,
    [userId]
  );

  res.json(rows);
});

// user purchase
router.post("/purchase", async (req, res) => {
  const userId = req.userId;
  const { gameId } = req.body;

  await pool.execute(`INSERT INTO purchase (user_id, game_id) VALUES (?, ?)`, [
    userId,
    gameId,
  ]);

  res.json({ message: "Game purchased" });
});

// user get purchase history
router.get("/purchase", async (req, res) => {
  const userId = req.userId;

  const [rows] = await pool.execute(
    `SELECT game_id FROM purchase WHERE user_id = ?`,
    [userId]
  );

  res.json(rows);
});

// protected admin Routes
router.get("/admin", async (req, res) => {
  res.json({ message: "Admin protected route" });
});

router.get("/admin/users", async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM users`);

  res.json(rows);
});

router.get("/admin/games", async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM games`);

  res.json(rows);
});

router.get("/admin/orders", async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM purchase`);

  res.json(rows);
});

router.get("/admin/wishlist", async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM wishlist`);

  res.json(rows);
});

router.get("/admin/cart", async (req, res) => {
  const [rows] = await pool.execute(`SELECT * FROM cart`);

  res.json(rows);
});

router.get("/admin/users/:id", async (req, res) => {
  const { id } = req.params;

  const [rows] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [id]);

  res.json(rows[0]);
});

router.get("/admin/games/:id", async (req, res) => {
  const { id } = req.params;

  const [rows] = await pool.execute(`SELECT * FROM games WHERE id = ?`, [id]);

  res.json(rows[0]);
});

router.get("/admin/orders/:id", async (req, res) => {
  const { id } = req.params;

  const [rows] = await pool.execute(`SELECT * FROM purchase WHERE id = ?`, [
    id,
  ]);

  res.json(rows[0]);
});

router.get("/admin/wishlist/:id", async (req, res) => {
  const { id } = req.params;

  const [rows] = await pool.execute(`SELECT * FROM wishlist WHERE id = ?`, [
    id,
  ]);

  res.json(rows[0]);
});

router.get("/admin/cart/:id", async (req, res) => {
  const { id } = req.params;

  const [rows] = await pool.execute(`SELECT * FROM cart WHERE id = ?`, [id]);

  res.json(rows[0]);
});

router.delete("/admin/users/:id", async (req, res) => {
  const { id } = req.params;

  await pool.execute(`DELETE FROM users WHERE id = ?`, [id]);

  res.json({ message: "User deleted" });
});

router.delete("/admin/games/:id", async (req, res) => {
  const { id } = req.params;

  await pool.execute(`DELETE FROM games WHERE id = ?`, [id]);

  res.json({ message: "Game deleted" });
});

router.delete("/admin/orders/:id", async (req, res) => {
  const { id } = req.params;

  await pool.execute(`DELETE FROM purchase WHERE id = ?`, [id]);

  res.json({ message: "Order deleted" });
});

router.delete("/admin/wishlist/:id", async (req, res) => {
  const { id } = req.params;

  await pool.execute(`DELETE FROM wishlist WHERE id = ?`, [id]);

  res.json({ message: "Wishlist deleted" });
});

router.delete("/admin/cart/:id", async (req, res) => {
  const { id } = req.params;

  await pool.execute(`DELETE FROM cart WHERE id = ?`, [id]);

  res.json({ message: "Cart deleted" });
});

router.put("/admin/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  await pool.execute(`UPDATE users SET username = ?, email = ? WHERE id = ?`, [
    username,
    email,
    id,
  ]);

  res.json({ message: "User updated" });
});

router.put("/admin/games/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, price } = req.body;

  await pool.execute(
    `UPDATE games SET title = ?, description = ?, price = ? WHERE id = ?`,
    [title, description, price, id]
  );

  res.json({ message: "Game updated" });
});

router.put("/admin/orders/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, game_id } = req.body;

  await pool.execute(
    `UPDATE purchase SET user_id = ?, game_id = ? WHERE id = ?`,
    [user_id, game_id, id]
  );

  res.json({ message: "Order updated" });
});

router.put("/admin/wishlist/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, game_id } = req.body;

  await pool.execute(
    `UPDATE wishlist SET user_id = ?, game_id = ? WHERE id = ?`,
    [user_id, game_id, id]
  );

  res.json({ message: "Wishlist updated" });
});

router.put("/admin/cart/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, game_id } = req.body;

  await pool.execute(`UPDATE cart SET user_id = ?, game_id = ? WHERE id = ?`, [
    user_id,
    game_id,
    id,
  ]);

  res.json({ message: "Cart updated" });
});

export default router;
