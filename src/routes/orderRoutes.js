
const express = require("express");
const router = express.Router();


const User = require("../models/User");
const Order = require("../models/Order");


const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrder,
  deleteOrder,
  getOrderAnalytics,
  getAuditLog,  
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Routes
router.post("/", protect, createOrder);
router.get("/myorders", protect, getUserOrders);
router.get("/", protect, authorize("admin"), getAllOrders);
router.put("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);

// NEW: Audit Log route (admin only)
router.get('/audit-log', protect, authorize('admin'), getAuditLog);

// GET ALL USERS (admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// GET ORDERS BY USER ID (admin only)
router.get('/user/:userId/orders', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user orders' });
  }
});

// Analytics
router.get("/analytics", protect, getOrderAnalytics);

module.exports = router;