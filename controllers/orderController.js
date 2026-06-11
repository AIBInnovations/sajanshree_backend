const Order = require("../models/orderModel");
const { cloudinary } = require("../config/cloudinary");

// Create a new order with image upload

exports.createOrder = async (req, res) => {
  try {
    console.log('\n🆕 ===== CREATE ORDER REQUEST =====');
    console.log('📥 Request body keys:', Object.keys(req.body));
    console.log('📸 File uploaded:', req.file ? 'YES' : 'NO');

    if (req.file) {
      console.log('📁 Uploaded file info:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: `${(req.file.size / 1024).toFixed(2)} KB`,
        cloudinaryPath: req.file.path,
        cloudinaryFilename: req.file.filename
      });
    }

    // Handle both JSON and FormData requests.
    // With FormData (image upload), `items` arrives as a JSON string and must be parsed.
    // With a JSON request, `items` is already an array. Detect by type, not truthiness.
    let parsedItems = req.body.items;
    if (typeof parsedItems === 'string') {
      console.log('📋 Request type: FormData (items sent as JSON string)');
      try {
        parsedItems = JSON.parse(parsedItems);
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid items: could not parse JSON', error: parseError.message });
      }
    } else {
      console.log('📋 Request type: JSON');
    }

    const requestData = {
      orderId: req.body.orderId,
      customerName: req.body.customerName,
      deliveryDate: req.body.deliveryDate,
      product: req.body.product,
      items: Array.isArray(parsedItems) ? parsedItems : []
    };

    console.log('📦 Parsed request data:', {
      orderId: requestData.orderId,
      customerName: requestData.customerName,
      deliveryDate: requestData.deliveryDate,
      product: requestData.product,
      itemsCount: requestData.items?.length
    });

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

    // Validate item structure (fall back to the order-level product when an item omits it)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemProduct = item.product || product;
      if (!itemProduct) {
        return res.status(400).json({
          message: `Invalid item format: item[${i}] is missing "product"`,
          item
        });
      }
      if (!item.sizes || typeof item.sizes !== "object") {
        return res.status(400).json({
          message: `Invalid item format: item[${i}] "sizes" must be an object, got ${typeof item.sizes}`,
          item
        });
      }
    }

    // Generate orderId if not provided
    const finalOrderId = orderId || `ORD-${Date.now()}`;

    // Process items with details (inherit the order product when the item has none)
    const processedItems = items.map((item) => ({
      product: item.product || product,
      sizes: item.sizes,
      details: item.details || {}
    }));

    const orderImageData = req.file ? {
      url: req.file.path,
      publicId: req.file.filename
    } : null;

    console.log('🖼️ Order image data:', orderImageData ? 'Image attached' : 'No image');

    const newOrder = new Order({
      orderId: finalOrderId,
      customerName,
      product,
      deliveryDate,
      items: processedItems,
      orderImage: orderImageData
    });

    console.log('💾 Saving order to database...');
    await newOrder.save();
    console.log('✅ Order saved successfully with ID:', newOrder._id);

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("\n❌ ===== CREATE ORDER ERROR =====");
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Check if it's a Cloudinary error
    if (error.http_code) {
      console.error('☁️ Cloudinary Error Code:', error.http_code);
      console.error('☁️ Cloudinary Error:', error.message);
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    console.log('\n🔄 ===== UPDATE ORDER REQUEST =====');
    console.log('🆔 Order ID:', req.params.id);
    console.log('📥 Request body keys:', Object.keys(req.body));
    console.log('📸 New file uploaded:', req.file ? 'YES' : 'NO');

    if (req.file) {
      console.log('📁 New uploaded file info:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: `${(req.file.size / 1024).toFixed(2)} KB`,
        cloudinaryPath: req.file.path,
        cloudinaryFilename: req.file.filename
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      console.log('❌ Order not found with ID:', req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log('📦 Existing order found:', {
      orderId: order.orderId,
      customerName: order.customerName,
      hasImage: order.orderImage ? 'YES' : 'NO',
      existingImagePublicId: order.orderImage?.publicId
    });

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
      console.log('🔄 Processing new image upload...');

      // Delete old image from Cloudinary if exists
      if (order.orderImage && order.orderImage.publicId) {
        console.log('🗑️ Deleting old image from Cloudinary:', order.orderImage.publicId);
        try {
          const deleteResult = await cloudinary.uploader.destroy(order.orderImage.publicId);
          console.log('✅ Old image deleted:', deleteResult);
        } catch (deleteError) {
          console.error('⚠️ Error deleting old image:', deleteError.message);
          // Continue anyway - new image will still be uploaded
        }
      }

      order.orderImage = {
        url: req.file.path,
        publicId: req.file.filename
      };
      console.log('✅ New image data saved to order');
    }

    console.log('💾 Saving updated order to database...');
    await order.save();
    console.log('✅ Order updated successfully with ID:', order._id);

    res.status(200).json({
      message: "Order updated successfully",
      order: order
    });
  } catch (error) {
    console.error("\n❌ ===== UPDATE ORDER ERROR =====");
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Check if it's a Cloudinary error
    if (error.http_code) {
      console.error('☁️ Cloudinary Error Code:', error.http_code);
      console.error('☁️ Cloudinary Error:', error.message);
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    console.log('\n🗑️ ===== DELETE ORDER REQUEST =====');
    console.log('🆔 Order ID:', req.params.id);

    const order = await Order.findById(req.params.id);

    if (!order) {
      console.log('❌ Order not found with ID:', req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log('📦 Order found:', {
      orderId: order.orderId,
      customerName: order.customerName,
      hasImage: order.orderImage ? 'YES' : 'NO',
      imagePublicId: order.orderImage?.publicId
    });

    // Delete image from Cloudinary if exists
    if (order.orderImage && order.orderImage.publicId) {
      console.log('🗑️ Deleting image from Cloudinary:', order.orderImage.publicId);
      try {
        const deleteResult = await cloudinary.uploader.destroy(order.orderImage.publicId);
        console.log('✅ Image deleted from Cloudinary:', deleteResult);
      } catch (deleteError) {
        console.error('⚠️ Error deleting image from Cloudinary:', deleteError.message);
        // Continue to delete order even if image deletion fails
      }
    }

    console.log('💾 Deleting order from database...');
    await order.deleteOne();
    console.log('✅ Order deleted successfully');

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("\n❌ ===== DELETE ORDER ERROR =====");
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Check if it's a Cloudinary error
    if (error.http_code) {
      console.error('☁️ Cloudinary Error Code:', error.http_code);
      console.error('☁️ Cloudinary Error:', error.message);
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
