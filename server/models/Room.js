import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
    roomNumber: { type: String, required: true },
    floorNumber: { type: Number, required: true },
    capacity: { type: Number, required: true },
    rent: { type: Number, required: true },
    roomType: { type: String, enum: ['Single', 'Double', 'Triple', 'Dorm'], required: true },
    roomSize: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;
