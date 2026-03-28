import mongoose from 'mongoose';

const pgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    totalFloors: { type: Number, required: true },
    totalRooms: { type: Number, required: true },
    totalCapacity: { type: Number, required: true },
    completionYear: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

const PG = mongoose.model('PG', pgSchema);
export default PG;
