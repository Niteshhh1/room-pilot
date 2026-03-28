import Room from '../models/Room.js';
import PG from '../models/PG.js';
import Tenant from '../models/Tenant.js';

// @desc    Get all rooms (globally)
// @route   GET /api/rooms
// @access  Private
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('pgId', 'name address');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all empty/partially empty rooms
// @route   GET /api/rooms/empty
// @access  Private
export const getEmptyRooms = async (req, res) => {
  try {
    const { pgId, floorNumber } = req.query;
    let query = {};
    if (pgId) query.pgId = pgId;
    if (floorNumber) query.floorNumber = Number(floorNumber);

    const rooms = await Room.find(query).populate('pgId', 'name city');
    
    // Check tenant counts
    const emptyRooms = [];
    for (let room of rooms) {
      const tenantCount = await Tenant.countDocuments({ room: room._id, status: 'Active' });
      if (room.capacity > tenantCount) {
        emptyRooms.push({
          ...room.toObject(),
          activeTenants: tenantCount,
          availableBeds: room.capacity - tenantCount
        });
      }
    }

    // Sort by available beds descending
    emptyRooms.sort((a, b) => b.availableBeds - a.availableBeds);

    res.json(emptyRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all rooms for a specific PG
// @route   GET /api/rooms/pg/:pgId
// @access  Private
export const getRoomsByPG = async (req, res) => {
  try {
    const rooms = await Room.find({ pgId: req.params.pgId });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Room by ID
// @route   GET /api/rooms/:id
// @access  Private
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('pgId', 'name address');

    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private
export const createRoom = async (req, res) => {
  try {
    const {
      pgId,
      roomNumber,
      floorNumber,
      capacity,
      rent,
      roomType,
      roomSize,
      description,
    } = req.body;

    const pgExists = await PG.findById(pgId);
    if (!pgExists) {
      return res.status(404).json({ message: 'PG not found' });
    }

    // Check for duplicate room in the same PG
    const roomExists = await Room.findOne({ pgId, roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: 'Room number already exists in this PG' });
    }

    const room = new Room({
      pgId,
      roomNumber,
      floorNumber,
      capacity,
      rent,
      roomType,
      roomSize,
      description,
    });

    const createdRoom = await room.save();
    res.status(201).json(createdRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (room) {
      if (req.body.roomNumber !== undefined && req.body.roomNumber !== room.roomNumber) {
        const roomExists = await Room.findOne({ pgId: room.pgId, roomNumber: req.body.roomNumber });
        if (roomExists) {
          return res.status(400).json({ message: 'Room number already exists in this PG' });
        }
      }
      room.roomNumber = req.body.roomNumber !== undefined ? req.body.roomNumber : room.roomNumber;
      room.floorNumber = req.body.floorNumber !== undefined ? req.body.floorNumber : room.floorNumber;
      room.capacity = req.body.capacity !== undefined ? req.body.capacity : room.capacity;
      room.rent = req.body.rent !== undefined ? req.body.rent : room.rent;
      room.roomType = req.body.roomType !== undefined ? req.body.roomType : room.roomType;
      room.roomSize = req.body.roomSize !== undefined ? req.body.roomSize : room.roomSize;
      room.description = req.body.description !== undefined ? req.body.description : room.description;

      console.log('--- ROOM UPDATE DEBUG ---');
      console.log('Incoming Payload:', req.body);
      console.log('New Room Rent:', room.rent);
      console.log('New Room Capacity:', room.capacity);

      const updatedRoom = await room.save();
      res.json(updatedRoom);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (room) {
      await room.deleteOne();
      res.json({ message: 'Room removed' });
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
