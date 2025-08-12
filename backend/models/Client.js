import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  managerName: { type: String, required: true },
  phoneNumbers: [{
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-()]{10,}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }],
  primaryPhoneIndex: { type: Number, default: 0 },
  firstVisit: { type: Date, required: true },
  nextVisit: { type: Date, required: true },
  place: { type: String, required: true },
  status: {
    type: String,
    enum: ['started', 'active', 'onaction', 'closed', 'dead'],
    default: 'started'
  },
  deal: { type: Number }, // optional
  description: { type: String } // optional
}, {
  timestamps: true
});

export default mongoose.model('Client', clientSchema);
