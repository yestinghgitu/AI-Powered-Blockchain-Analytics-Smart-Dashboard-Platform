/**
 * Risk Assessment Engine: Categorizes risk based on anomaly rates.
 * 
 * @param {Array<{ field: string, anomalies: Array<{ rowIndex: number }> }>} anomalies
 * @param {number} totalRows
 * @returns {{ status: string, totalAnomalies: number, anomalyRate: string, message: string }}
 */
function getRiskStatus(anomalies, totalRows) {
  if (!Number.isFinite(totalRows) || totalRows <= 0) {
    return {
      status: 'UNKNOWN',
      totalAnomalies: 0,
      anomalyRate: '0%',
      message: 'No data to analyze or invalid row count.'
    };
  }

  let uniqueRowsWithAnomalies = 0;
  
  if (Array.isArray(anomalies) && anomalies.length > 0) {
    try {
      const anomalyRowIndices = new Set();
      // Single pass processing for efficiency
      for (const fieldRecord of anomalies) {
        if (fieldRecord && Array.isArray(fieldRecord.anomalies)) {
          for (const anomaly of fieldRecord.anomalies) {
            if (anomaly && Number.isFinite(anomaly.rowIndex)) {
              anomalyRowIndices.add(anomaly.rowIndex);
            }
          }
        }
      }
      uniqueRowsWithAnomalies = anomalyRowIndices.size;
    } catch (e) {
      console.error("[RiskAnalyzer] Error processing anomalies:", e);
    }
  }

  const anomalyRate = uniqueRowsWithAnomalies / totalRows;
  
  let status = 'STABLE';
  let message = 'Aggregate systems stable. No anomalies detected.';

  if (anomalyRate > 0) {
    if (anomalyRate < 0.05) {
      status = 'LOW RISK';
      message = 'Minor deviations detected. Normal operational variance.';
    } else if (anomalyRate <= 0.15) {
      status = 'WARNING';
      message = 'Moderate anomaly density. Review recommended.';
    } else {
      status = 'HIGH RISK';
      message = 'Critical anomaly density detected. Data integrity compromised.';
    }
  }

  return {
    status,
    totalAnomalies: uniqueRowsWithAnomalies,
    anomalyRate: (anomalyRate * 100).toFixed(1) + '%',
    message
  };
}

module.exports = { getRiskStatus };
