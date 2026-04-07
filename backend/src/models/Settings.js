import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  proPrice: { type: Number, default: 199 }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
