import PG from '../models/PG.js';

import Room from '../models/Room.js';

// @desc    Get all PGs
// @route   GET /api/pgs
// @access  Private
export const getPGs = async (req, res) => {
  try {
    const pgs = await PG.find({});
    const enrichedPGs = await Promise.all(pgs.map(async (pg) => {
      const rooms = await Room.find({ pgId: pg._id });
      const totalRooms = rooms.length;
      const totalCapacity = rooms.reduce((acc, room) => acc + (room.capacity || 0), 0);
      return { ...pg.toObject(), totalRooms, totalCapacity };
    }));
    res.json(enrichedPGs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get PG by ID
// @route   GET /api/pgs/:id
// @access  Private
export const getPGById = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (pg) {
      const rooms = await Room.find({ pgId: pg._id });
      const totalRooms = rooms.length;
      const totalCapacity = rooms.reduce((acc, room) => acc + (room.capacity || 0), 0);
      res.json({ ...pg.toObject(), totalRooms, totalCapacity });
    } else {
      res.status(404).json({ message: 'PG not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a PG
// @route   POST /api/pgs
// @access  Private
export const createPG = async (req, res) => {
  try {
    const existingPG = await PG.findOne({ name: req.body.name });
    if (existingPG) {
      return res.status(400).json({ message: 'A PG with this name already exists' });
    }

    const pg = new PG({
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      totalFloors: req.body.totalFloors,
      totalRooms: 0,
      totalCapacity: 0,
      completionYear: req.body.completionYear,
      description: req.body.description,
    });

    const createdPG = await pg.save();
    res.status(201).json(createdPG);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a PG
// @route   PUT /api/pgs/:id
// @access  Private
export const updatePG = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (pg) {
      if (req.body.name && req.body.name !== pg.name) {
        const existingPG = await PG.findOne({ name: req.body.name });
        if (existingPG) {
          return res.status(400).json({ message: 'A PG with this name already exists' });
        }
      }
      
      pg.name = req.body.name || pg.name;
      pg.address = req.body.address || pg.address;
      pg.city = req.body.city || pg.city;
      pg.state = req.body.state || pg.state;
      pg.totalFloors = req.body.totalFloors || pg.totalFloors;
      pg.completionYear = req.body.completionYear || pg.completionYear;
      pg.description = req.body.description || pg.description;

      const updatedPG = await pg.save();
      res.json(updatedPG);
    } else {
      res.status(404).json({ message: 'PG not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a PG
// @route   DELETE /api/pgs/:id
// @access  Private
export const deletePG = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);

    if (pg) {
      await pg.deleteOne();
      res.json({ message: 'PG removed' });
    } else {
      res.status(404).json({ message: 'PG not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
