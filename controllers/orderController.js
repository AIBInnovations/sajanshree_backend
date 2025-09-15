const Order = require("../models/orderModel");

// Create a new order with image upload
// In orderController.js - update the createOrder function:

exports.createOrder = async (req, res) => {
  try {
    // Handle both JSON and FormData requests
    let requestData;
    if (req.body && typeof req.body === 'object' && req.body.items) {
      // JSON request
      requestData = req.body;
    } else {
      // FormData request - parse JSON fields
      requestData = {
        orderId: req.body.orderId,
        customerName: req.body.customerName,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        deliveryDate: req.body.deliveryDate,
        orderType: req.body.orderType || "walk-in",
        product: req.body.product,
        items: req.body.items ? JSON.parse(req.body.items) : [],
        advancePayments: req.body.advancePayments ? JSON.parse(req.body.advancePayments) : []
      };
    }

    const {
      orderId,
      customerName,
      phone,
      email,
      address,
      deliveryDate,
      orderType = "walk-in",
      product,
      items,
      advancePayments = []
    } = requestData;

    // Validate required fields
    if (!customerName || !deliveryDate || !product || !phone || !items || !items.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate item structure
    for (const item of items) {
      if (!item.product || !item.sizes || typeof item.sizes !== "object") {
        return res.status(400).json({ message: "Invalid item format" });
      }
    }

    // Generate orderId if not provided
    const finalOrderId = orderId || `ORD-${Date.now()}`;

    // Process advance payments
    const processedAdvancePayments = advancePayments.map(payment => ({
      amount: parseFloat(payment.amount) || 0,
      date: payment.date ? new Date(payment.date) : new Date()
    }));

    // Process items with details
    const processedItems = items.map((item) => ({
      product: item.product,
      sizes: item.sizes,
      details: item.details || {}
    }));

    const newOrder = new Order({
      orderId: finalOrderId,
      customerName,
      mobileNumber: phone,
      email,
      address,
      product,
      deliveryDate,
      orderType,
      items: processedItems,
      advancePayments: processedAdvancePayments,
      orderImage: req.file ? req.file.path : null
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get all orders
// Get all orders with pending notifications
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    // Notify admin if there are pending orders
    const pendingOrders = orders.filter((order) => order.status === "Pending");
    if (pendingOrders.length > 0) {
      console.log(
        `🔔 Notification: There are ${pendingOrders.length} pending orders.`
      );
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Check if status is valid
    const validStatuses = ["Pending", "Processing", "Completed", "Shipped"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
