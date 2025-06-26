import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  place: { type: String, required: true },
  name: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
