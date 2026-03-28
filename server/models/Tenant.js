import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    bloodGroup: { type: String },
    hometown: { type: String },
    aadharNumber: { type: String, required: true },
    emergencyContact: { type: String },
    moveInDate: { type: Date, required: true },
    monthlyRent: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

const Tenant = mongoose.model('Tenant', tenantSchema);
export default Tenant;
