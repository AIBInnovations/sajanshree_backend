const Order = require("../models/orderModel");
const { cloudinary } = require("../config/cloudinary");

// Create a new order with image upload

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
        deliveryDate: req.body.deliveryDate,
        product: req.body.product,
        items: req.body.items ? JSON.parse(req.body.items) : []
      };
    }

    const {
      orderId,
      customerName,
      deliveryDate,
      product,
      items
    } = requestData;

    // Validate required fields
    if (!customerName || !deliveryDate || !product || !items || !items.length) {
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

    // Process items with details
    const processedItems = items.map((item) => ({
      product: item.product,
      sizes: item.sizes,
      details: item.details || {}
    }));

    const newOrder = new Order({
      orderId: finalOrderId,
      customerName,
      product,
      deliveryDate,
      items: processedItems,
      orderImage: req.file ? {
        url: req.file.path,
        publicId: req.file.filename
      } : null
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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Handle both JSON and FormData requests
    let requestData;
    if (req.body && typeof req.body === 'object' && req.body.items && !req.file) {
      // JSON request
      requestData = req.body;
    } else if (req.file || req.body.items) {
      // FormData request
      requestData = {
        customerName: req.body.customerName,
        deliveryDate: req.body.deliveryDate,
        product: req.body.product,
        items: req.body.items ? JSON.parse(req.body.items) : undefined,
        orderDescription: req.body.orderDescription,
        status: req.body.status
      };
    } else {
      requestData = req.body;
    }

    // Update fields if provided
    if (requestData.customerName) order.customerName = requestData.customerName;
    if (requestData.deliveryDate) order.deliveryDate = requestData.deliveryDate;
    if (requestData.product) order.product = requestData.product;
    if (requestData.items) order.items = requestData.items;
    if (requestData.orderDescription) order.orderDescription = requestData.orderDescription;
    if (requestData.status) order.status = requestData.status;

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (order.orderImage && order.orderImage.publicId) {
        await cloudinary.uploader.destroy(order.orderImage.publicId);
      }

      order.orderImage = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    await order.save();

    res.status(200).json({
      message: "Order updated successfully",
      order: order
    });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Delete image from Cloudinary if exists
    if (order.orderImage && order.orderImage.publicId) {
      await cloudinary.uploader.destroy(order.orderImage.publicId);
    }

    await order.deleteOne();

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
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
