const SalesData = require('../models/SalesData');

class SalesRepository {
  async insertMany(docs) {
    return await SalesData.insertMany(docs);
  }

  async getRecentSales(limit = 100) {
    return await SalesData.find().sort({ date: -1 }).limit(limit);
  }

  /** Aggregate total + avg revenue per product */
  async getProductSummary() {
    return await SalesData.aggregate([
      {
        $group: {
          _id: '$product',
          totalRevenue: { $sum: '$revenue' },
          totalSales: { $sum: '$sales' },
          avgRevenue: { $avg: '$revenue' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
  }

  /** Monthly revenue trend */
  async getMonthlyTrend() {
    return await SalesData.aggregate([
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          totalRevenue: { $sum: '$revenue' },
          totalSales: { $sum: '$sales' },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
  }

  /** Quick summary stats for AI context */
  async getOverallStats() {
    const result = await SalesData.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          totalSales: { $sum: '$sales' },
          avgRevenue: { $avg: '$revenue' },
          recordCount: { $sum: 1 }
        }
      }
    ]);
    return result[0] || {};
  }
}

module.exports = new SalesRepository();
