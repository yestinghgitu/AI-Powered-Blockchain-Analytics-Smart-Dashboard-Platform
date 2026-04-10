const { getRiskStatus } = require('../services/riskAnalyzer');
const { getHealthScore } = require('../services/healthScore');

describe('Services Unit Tests', () => {
  
  describe('Risk Analyzer', () => {
    it('should return UNKNOWN for empty rows', () => {
      const result = getRiskStatus([{ field: 'sales', anomalies: [] }], 0);
      expect(result.status).toBe('UNKNOWN');
      expect(result.totalAnomalies).toBe(0);
    });

    it('should correctly count specific anomalies', () => {
      const anomalies = [
        { field: 'sales', anomalies: [{ rowIndex: 1 }, { rowIndex: 2 }] },
        { field: 'marketing', anomalies: [{ rowIndex: 2 }, { rowIndex: 3 }] }
      ];
      // Expect 3 unique row indexes: 1, 2, 3
      const result = getRiskStatus(anomalies, 100);
      expect(result.totalAnomalies).toBe(3);
      expect(result.status).toBe('LOW RISK');
      expect(result.anomalyRate).toBe('3.0%');
    });

    it('should gracefully handle malformed anomaly inputs', () => {
      const anomalies = [
        { field: 'sales' }, // Missing anomalies array
        null,
        { anomalies: [{ rowIndex: 4 }] }
      ];
      const result = getRiskStatus(anomalies, 50);
      expect(result.totalAnomalies).toBe(1);
    });
  });

  describe('Health Score', () => {
    it('should return 0 score and UNKNOWN status for no rows', () => {
      const result = getHealthScore({ totalRows: 0 });
      expect(result.score).toBe(0);
      expect(result.status).toBe('UNKNOWN');
    });

    it('should return proper health score for valid profile', () => {
      const profile = { totalRows: 1000, totalColumns: 10, missingCells: 0 };
      const result = getHealthScore(profile);
      expect(result.score).toBe(100);
      expect(result.status).toBe('Excellent');
    });

    it('should deduct points for missing data', () => {
      // 10% missing cells
      const profile = { totalRows: 100, totalColumns: 10, missingCells: 100 };
      const result = getHealthScore(profile);
      expect(result.score).toBeLessThan(100);
      expect(result.insights[0]).toMatch(/missing data detected/);
    });
    
    it('should return accurate score if dataset is small', () => {
      const profile = { totalRows: 40, totalColumns: 10, missingCells: 0 };
      const result = getHealthScore(profile);
      expect(result.score).toBe(90);
      expect(result.insights).toContain('Small dataset. Statistical confidence may be low.');
    });
  });

});
