const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  status: { 
    type: String, 
    enum: [
      'PENDING', 
      'UPLOADED', 
      'PROCESSING', 
      'HASH_GENERATED', 
      'PENDING_BLOCKCHAIN', 
      'CONFIRMED_ON_CHAIN', 
      'COMPLETED', 
      'FAILED', 
      'VERIFIED'
    ], 
    default: 'PENDING' 
  },
  progress: { type: Number, default: 0 },
  summary: {
    totalRows: { type: Number, default: 0 },
    validRows: { type: Number, default: 0 }
  },
  error: { type: String, default: null },
  txHash: { type: String, default: null },
  datasetHash: { type: String, default: null },
  version: { type: Number, default: 1 },
  walletAddress: { type: String, default: null },
  result: { type: Object, default: null }, // Stores AI/Blockchain summary on success
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before each save
JobSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Job', JobSchema);
