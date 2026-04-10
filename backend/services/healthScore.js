/**
 * Dataset Health Scoring Engine.
 * Calculates a health score based on dataset metadata.
 * 
 * @param {Object} profile - The dataset profile.
 * @param {number} profile.totalRows
 * @param {number} profile.totalColumns
 * @param {number} profile.missingCells
 * @returns {{ score: number, status: string, insights: string[] }}
 */
function getHealthScore(profile) {
  if (!profile || typeof profile !== 'object' || !Number.isFinite(profile.totalRows) || profile.totalRows <= 0) {
    return { score: 0, status: 'UNKNOWN', insights: ['No data available or invalid profile.'] };
  }

  let score = 100;
  const insights = [];

  const totalCells = profile.totalRows * (profile.totalColumns || 1);
  
  // Deduct based on missing data
  if (totalCells > 0 && Number.isFinite(profile.missingCells) && profile.missingCells > 0) {
    const missingRatio = profile.missingCells / totalCells;
    if (missingRatio > 0.05) {
      const penalty = Math.min(Math.round(missingRatio * 100 * 2), 50);
      score -= penalty;
      insights.push(`${(missingRatio * 100).toFixed(1)}% missing data detected.`);
    }
  }

  // Deduct based on size
  if (profile.totalRows < 50) {
    score -= 10;
    insights.push('Small dataset. Statistical confidence may be low.');
  } else {
    insights.push('Sufficient dataset volume for analysis.');
  }

  let status = 'Excellent';
  if (score < 80) status = 'Moderate';
  if (score < 50) status = 'Poor';

  return { score: Math.max(0, score), status, insights };
}

module.exports = { getHealthScore };
