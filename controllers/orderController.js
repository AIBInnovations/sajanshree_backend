const Order = require("../models/orderModel");
const OrderOption = require("../models/orderOptionModel");

// Create a new order with image upload
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      deliveryDate,
      orderType = "walk-in",
      items,
    } = req.body;

    // Validate required fields
    if (!customerName || !deliveryDate || !items || !items.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate item structure
    for (const item of items) {
      if (!item.product || !item.sizes || typeof item.sizes !== "object") {
        return res.status(400).json({ message: "Invalid item format" });
      }
    }

    const newOrder = new Order({
      customerName,
      phone,
      email,
      deliveryDate,
      orderType,
      items: items.map((item) => ({
        category: item.product,
        sizes: item.sizes,
      })),
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

// order options
// @route POST /apiorder-options
// @desc Create a new orderOption configuration
// @access Private
exports.createOrderOption = async (req, res) => {
  try {
    const { name, sizes, details } = req.body;
    const orderOption = new OrderOption({ name, sizes, details });
    await orderOption.save();
    res.status(201).json(orderOption);
  } catch (error) {
    console.error("Create orderOption error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route GET /apiorder-options
// @desc Fetch all orderOption configurations
// @access Private
exports.getOrderOptions = async (req, res) => {
  try {
    const orderOptions = await OrderOption.find();
    res.json(orderOptions);
  } catch (error) {
    console.error("Fetch orderOptions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route GET /apiorder-options/:id
// @desc Fetch a single orderOption by ID
// @access Private
exports.getOrderOptionById = async (req, res) => {
  try {
    const orderOption = await OrderOption.findById(req.params.id);
    if (!orderOption) {
      return res.status(404).json({ message: "OrderOption not found" });
    }
    res.json(orderOption);
  } catch (error) {
    console.error("Fetch orderOption error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route PUT /apiorder-options/:id
// @desc Update a orderOption configuration
// @access Private
exports.updateOrderOption = async (req, res) => {
  try {
    const { name, sizes, details } = req.body;
    const orderOption = await OrderOption.findByIdAndUpdate(
      req.params.id,
      { name, sizes, details, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!orderOption) {
      return res.status(404).json({ message: "OrderOption not found" });
    }
    res.json(orderOption);
  } catch (error) {
    console.error("Update orderOption error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route DELETE /apiorder-options/:id
// @desc Delete a orderOption configuration
// @access Private
exports.deleteOrderOption = async (req, res) => {
  try {
    const orderOption = await OrderOption.findByIdAndDelete(req.params.id);
    if (!orderOption) {
      return res.status(404).json({ message: "OrderOption not found" });
    }
    res.json({ message: "OrderOption deleted" });
  } catch (error) {
    console.error("Delete orderOption error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
