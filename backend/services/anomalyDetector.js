/**
 * Statistical Anomaly Detection Engine: Uses Z-Score (standard deviation) to identify outliers.
 */
function detectAnomalies(data, field) {
  if (!data || data.length < 5) return [];

  const values = data.map(row => parseFloat(row[field])).filter(v => !isNaN(v));
  if (values.length < 5) return [];

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  const threshold = 2.0;

  return data
    .map((row, index) => {
      const val = parseFloat(row[field]);
      if (isNaN(val)) return null;
      const zScore = Math.abs(val - mean) / stdDev;
      if (zScore > threshold) {
        return {
          rowIndex: index,
          field,
          value: val,
          zScore,
          type: val > mean ? 'HIGH_OUTLIER' : 'LOW_OUTLIER'
        };
      }
      return null;
    })
    .filter(v => v !== null);
}

function detectAllAnomalies(data, profile) {
  const anomalies = [];
  Object.keys(profile.columns).forEach(col => {
    if (profile.columns[col].type === 'numeric') {
      anomalies.push(...detectAnomalies(data, col));
    }
  });
  return anomalies;
}

module.exports = { detectAnomalies, detectAllAnomalies };
