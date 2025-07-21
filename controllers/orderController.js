const Order = require("../models/orderModel");

// Create a new order with image upload
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      deliveryDate,
      orderType = "walk-in",
      items
    } = req.body;

    // Validate required fields
    if (!customerName || !deliveryDate || !items || !items.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate item structure
    for (const item of items) {
      if (!item.product || !item.sizes || typeof item.sizes !== 'object') {
        return res.status(400).json({ message: "Invalid item format" });
      }
    }

    const newOrder = new Order({
      customerName,
      phone,
      email,
      deliveryDate,
      orderType,
      items: items.map(item => ({
        category: item.product,
        sizes: item.sizes
      }))
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
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
    const pendingOrders = orders.filter(order => order.status === "Pending");
    if (pendingOrders.length > 0) {
      console.log(`🔔 Notification: There are ${pendingOrders.length} pending orders.`);
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
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
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
