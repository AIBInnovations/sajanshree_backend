const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");

// CREATE
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, gstNumber, companyName, notes } =
      req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res
        .status(400)
        .json({ message: "Customer with this phone already exists" });
    }

    const customer = new Customer({
      name,
      phone,
      email,
      address,
      gstNumber,
      companyName,
      notes,
    });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// READ ALL (with optional ?search=)
exports.getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      const regex = new RegExp(search, "i");
      query = { $or: [{ name: regex }, { phone: regex }, { companyName: regex }] };
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error("Fetch customers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// READ ONE
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Fetch customer error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// READ a customer's orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    // Orders reference the customer by name (customerName), not by id.
    const orders = await Order.find({ customerName: customer.name }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error("Fetch customer orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE
exports.updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, gstNumber, companyName, notes } =
      req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, email, address, gstNumber, companyName, notes },
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
