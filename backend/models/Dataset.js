const mongoose = require('mongoose');

/**
 * Dataset Schema
 * Stores metadata and processed records for any CSV upload.
 */
const DatasetSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    rowCount: {
        type: Number,
        default: 0
    },
    columnCount: {
        type: Number,
        default: 0
    },
    columns: {
        type: Map,
        of: String // Maps column name to detected type (Numeric, Categorical, Date)
    },
    records: {
        type: [mongoose.Schema.Types.Mixed], // Stores row objects
        default: []
    },
    aiForecast: {
        type: mongoose.Schema.Types.Mixed, // Stores forecast results and trends
        default: null
    },
    aiAnomalies: { type: Array, default: [] }, // AI-detected outliers with severity
    
    // Intelligent Context Mapping (Inferred fields)
    fieldMapping: {
        revenue: String,
        date: String,
        category: String
    },

    // Automated KPI Metadata
    metadata: {
        totalRevenue: { type: Number, default: 0 },
        avgRevenue: { type: Number, default: 0 },
        growthRate: { type: Number, default: 0 }
    },

    // Blockchain ID
    datasetHash: { type: String, index: true },
    blockchainTxHash: { type: String },
    
    createdAt: { type: Date, default: Date.now }
}, { 
    timestamps: true,
    strict: false // Allow flexible CSV row structures
});

// Index for fast lookups
DatasetSchema.index({ filename: 1 });

module.exports = mongoose.model('Dataset', DatasetSchema);
