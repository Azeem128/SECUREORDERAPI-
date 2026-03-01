const Order = require("../models/Order");
const mongoose = require("mongoose");
const AuditLog = require('../models/AuditLog');

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { product, quantity, category } = req.body;

    if (!product || !quantity || quantity < 1 || !category) {
      return res.status(400).json({ message: "Product, quantity and category are required" });
    }

    const [order] = await Order.create(
      [{
        user: req.user.id,
        category,
        product,
        quantity,
        unitPrice: 0,        
        totalPrice: 0,
        notes: [{
          text: `Order created by ${req.user.name || "User"}`,
          userName: req.user.name || "User",
        }],
      }],
      { session }
    );

    await session.commitTransaction();
    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name || 'User',
      role: req.user.role,
      action: 'created',
      orderId: order._id,
      orderProduct: order.product,
      details: `Created order for ${order.quantity} x ${order.product} (${order.category}) – price pending`,
    });

    req.io.to(req.user.id.toString()).emit("orderCreated", order);

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, cancelReason, unitPrice } = req.body;

    const allowedStatuses = ["pending", "processing", "completed", "cancelled"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const filter = req.user.role === 'admin'
      ? { _id: id }
      : { _id: id, user: req.user.id, status: 'pending' };

    const updateData = {};
    if (status) updateData.status = status;
    if (unitPrice !== undefined && unitPrice !== null) {
      updateData.unitPrice = Number(unitPrice);
    }
    const noteText = note || (status ? `Status changed to ${status} by ${req.user.name || "User"}` : null);
    if (noteText) {
      updateData.$push = {
        notes: {
          text: noteText,
          userName: req.user.name || "User",
        }
      };
    }

    if (status === 'cancelled' && !cancelReason) {
      return res.status(400).json({ message: "Cancel reason required when cancelling" });
    }
    if (cancelReason) {
      updateData.cancelReason = cancelReason;
    }

    let order = await Order.findOne(filter);
    if (!order) {
      return res.status(404).json({ message: "Order not found or no permission" });
    }


    Object.assign(order, updateData);

    await order.save();

    order = await Order.findById(order._id).populate('user', 'name email');

    // Audit logging
    let action = 'updated';
    let details = '';

    if (status) {
      action = 'updated_status';
      details = `Status changed to ${status}`;
    }
    if (unitPrice !== undefined) {
      action = 'updated_price';
      details = `Unit price set to $${unitPrice} (Total: $${order.totalPrice})`;
    }
    if (note) {
      details += note ? (details ? ' + ' : '') + `Note: "${note}"` : '';
    }
    if (status === 'cancelled') {
      action = 'cancelled';
      details = `Cancelled with reason: ${cancelReason || 'No reason'}`;
    }

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name || 'User',
      role: req.user.role,
      action,
      orderId: order._id,
      orderProduct: order.product,
      details,
    });

    req.io.emit("orderUpdated", order);

    res.json(order);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const filter = req.user.role === 'admin'
      ? { _id: id }
      : { _id: id, user: req.user.id, status: 'pending' };

    const order = await Order.findOneAndDelete(filter);

    if (!order) {
      return res.status(404).json({ message: "Order not found or no permission" });
    }

    await AuditLog.create({
      user: req.user.id,
      userName: req.user.name || 'User',
      role: req.user.role,
      action: 'deleted',
      orderId: order._id,
      orderProduct: order.product,
      details: `Order deleted`,
    });

    req.io.emit("orderDeleted", id);

    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const match = req.user.role === 'admin' ? {} : { user: userId };

    const stats = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = { pending: 0, processing: 0, completed: 0, cancelled: 0 };
    stats.forEach(s => {
      if (s._id in statusMap) statusMap[s._id] = s.count;
    });

    res.json({
      labels: ['Pending', 'Processing', 'Completed', 'Cancelled'],
      data: [
        statusMap.pending,
        statusMap.processing,
        statusMap.completed,
        statusMap.cancelled
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Analytics error' });
  }
};

exports.getAuditLog = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .populate('user', 'name email role');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit log' });
  }
};