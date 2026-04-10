const mongoose = require('mongoose');

const SalesDataSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  revenue: { type: Number, required: true },
  sales: { type: Number, required: true },
  product: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', index: true }
}, { timestamps: true });

module.exports = mongoose.model('SalesData', SalesDataSchema);
