const { getRiskStatus } = require('./backend/services/riskAnalyzer');

const testCases = [
  {
    name: "Stable Dataset (0% anomalies)",
    anomalies: [],
    totalRows: 100,
    expectedStatus: "STABLE"
  },
  {
    name: "Low Risk Dataset (3% anomalies)",
    anomalies: [
      { field: "sales", anomalies: [{ rowIndex: 1 }, { rowIndex: 2 }, { rowIndex: 3 }] }
    ],
    totalRows: 100,
    expectedStatus: "LOW RISK"
  },
  {
    name: "Warning Dataset (10% anomalies)",
    anomalies: [
      { field: "sales", anomalies: Array.from({ length: 10 }, (_, i) => ({ rowIndex: i })) }
    ],
    totalRows: 100,
    expectedStatus: "WARNING"
  },
  {
    name: "High Risk Dataset (20% anomalies)",
    anomalies: [
      { field: "sales", anomalies: Array.from({ length: 20 }, (_, i) => ({ rowIndex: i })) }
    ],
    totalRows: 100,
    expectedStatus: "HIGH RISK"
  },
  {
    name: "Overlapping Anomalies (Aggregation Test)",
    anomalies: [
      { field: "sales", anomalies: [{ rowIndex: 1 }, { rowIndex: 2 }] },
      { field: "revenue", anomalies: [{ rowIndex: 2 }, { rowIndex: 3 }] }
    ],
    totalRows: 100,
    expectedTotal: 3, // Row 2 is shared
    expectedStatus: "LOW RISK" // 3%
  }
];

testCases.forEach(tc => {
  console.log(`Running Test: ${tc.name}`);
  const result = getRiskStatus(tc.anomalies, tc.totalRows);
  
  console.log(`  Rate: ${result.anomalyRate}`);
  console.log(`  Status: ${result.status}`);
  console.log(`  Total: ${result.totalAnomalies}`);

  if (tc.expectedStatus && result.status !== tc.expectedStatus) {
    console.error(`  [FAIL] Expected status ${tc.expectedStatus}, got ${result.status}`);
  }
  if (tc.expectedTotal !== undefined && result.totalAnomalies !== tc.expectedTotal) {
    console.error(`  [FAIL] Expected total ${tc.expectedTotal}, got ${result.totalAnomalies}`);
  }

  console.log('---');
});
