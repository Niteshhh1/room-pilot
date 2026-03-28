import Tenant from '../models/Tenant.js';
import Room from '../models/Room.js';

// @desc    Get all tenants for a specific room
// @route   GET /api/tenants/room/:roomId
// @access  Private
export const getTenantsByRoom = async (req, res) => {
  try {
    const tenants = await Tenant.find({ room: req.params.roomId });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tenants across all PGs
// @route   GET /api/tenants
// @access  Private
export const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({})
      .populate('room', 'roomNumber floorNumber')
      .populate('pg', 'name address')
      .sort({ createdAt: -1 });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Payment from '../models/Payment.js';

// @desc    Get Tenant by ID
// @route   GET /api/tenants/:id
// @access  Private
export const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('room', 'roomNumber floorNumber')
      .populate('pg', 'name address');

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Dynamic Payment Logic
    // Check if tenant has paid rent for the current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    
    // Default current rent status
    let rentStatus = 'Unpaid';
    
    // If the moveInDate is in the future, rent is not yet due
    if (new Date(tenant.moveInDate) > currentDate) {
      rentStatus = 'Upcoming';
    } else {
      // Check for a payment spanning the current month
      const currentMonthPayment = await Payment.findOne({
        tenantId: tenant._id,
        month: currentMonth,
        year: currentYear,
        paymentStatus: 'paid'
      });
      
      if (currentMonthPayment) {
        rentStatus = 'Paid';
      }
    }

    // Attach rentStatus dynamically to the response
    const tenantData = { ...tenant.toObject(), rentStatus };
    res.json(tenantData);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a tenant
// @route   POST /api/tenants
// @access  Private
export const createTenant = async (req, res) => {
  try {
    const {
      room,
      pg,
      name,
      email,
      contactNumber,
      bloodGroup,
      hometown,
      aadharNumber,
      emergencyContact,
      moveInDate,
      monthlyRent,
      securityDeposit,
    } = req.body;

    const phoneRegex = /^[6-9]\d{9}$/;
    
    if (!phoneRegex.test(contactNumber)) {
      return res.status(400).json({ message: 'Invalid primary contact number. Must be a 10 digit Indian number.' });
    }
    
    if (emergencyContact && !phoneRegex.test(emergencyContact)) {
      return res.status(400).json({ message: 'Invalid emergency contact number. Must be a 10 digit Indian number.' });
    }

    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const existingAadhar = await Tenant.findOne({ aadharNumber });
    if (existingAadhar) {
      return res.status(400).json({ message: `This user already has an account with Aadhar card number ${aadharNumber}` });
    }

    const existingEmail = await Tenant.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: `This email address is already in use by another tenant` });
    }

    const existingPhone = await Tenant.findOne({ contactNumber });
    if (existingPhone) {
      return res.status(400).json({ message: `This contact number is already registered` });
    }

    const tenant = new Tenant({
      room,
      pg,
      name,
      email,
      contactNumber,
      bloodGroup,
      hometown,
      aadharNumber,
      emergencyContact,
      moveInDate,
      monthlyRent,
      securityDeposit,
      status: 'Active',
    });

    const createdTenant = await tenant.save();
    res.status(201).json(createdTenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tenant status (Mark Active/Inactive)
// @route   PUT /api/tenants/:id/status
// @access  Private
export const updateTenantStatus = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (tenant) {
      tenant.status = req.body.status || tenant.status;
      const updatedTenant = await tenant.save();
      res.json(updatedTenant);
    } else {
      res.status(404).json({ message: 'Tenant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tenant details
// @route   PUT /api/tenants/:id
// @access  Private
export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const phoneRegex = /^[6-9]\d{9}$/;

    const contactNumber = req.body.contactNumber || tenant.contactNumber;
    const emergencyContact = req.body.emergencyContact;

    if (!phoneRegex.test(contactNumber)) {
      return res.status(400).json({ message: 'Invalid primary contact number. Must be a 10 digit Indian number.' });
    }

    if (emergencyContact && !phoneRegex.test(emergencyContact)) {
      return res.status(400).json({ message: 'Invalid emergency contact number. Must be a 10 digit Indian number.' });
    }

    if (req.body.aadharNumber && req.body.aadharNumber !== tenant.aadharNumber) {
      const existingAadhar = await Tenant.findOne({ aadharNumber: req.body.aadharNumber });
      if (existingAadhar) {
        return res.status(400).json({ message: `This user already has an account with Aadhar card number ${req.body.aadharNumber}` });
      }
    }

    if (req.body.email && req.body.email !== tenant.email) {
      const existingEmail = await Tenant.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({ message: `This email address is already in use by another tenant` });
      }
    }

    if (contactNumber && contactNumber !== tenant.contactNumber) {
      const existingPhone = await Tenant.findOne({ contactNumber });
      if (existingPhone) {
        return res.status(400).json({ message: `This contact number is already registered` });
      }
    }

    tenant.name = req.body.name || tenant.name;
    tenant.email = req.body.email || tenant.email;
    tenant.contactNumber = contactNumber;
    tenant.bloodGroup = req.body.bloodGroup !== undefined ? req.body.bloodGroup : tenant.bloodGroup;
    tenant.hometown = req.body.hometown !== undefined ? req.body.hometown : tenant.hometown;
    tenant.aadharNumber = req.body.aadharNumber || tenant.aadharNumber;
    tenant.emergencyContact = emergencyContact !== undefined ? emergencyContact : tenant.emergencyContact;
    tenant.moveInDate = req.body.moveInDate !== undefined ? req.body.moveInDate : tenant.moveInDate;
    tenant.monthlyRent = req.body.monthlyRent !== undefined ? Number(req.body.monthlyRent) : tenant.monthlyRent;
    tenant.securityDeposit = req.body.securityDeposit !== undefined ? Number(req.body.securityDeposit) : tenant.securityDeposit;

    const updatedTenant = await tenant.save();
    res.json(updatedTenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get past members for a specific room
// @route   GET /api/tenants/room/:roomId/past
// @access  Private
export const getPastTenantsByRoom = async (req, res) => {
  try {
    const tenants = await Tenant.find({ room: req.params.roomId, status: 'Inactive' });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
