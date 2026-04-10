const { profileData } = require('./backend/services/dataProfiler');
const { detectAllAnomalies } = require('./backend/services/anomalyDetector');

const data = [
  { sales: 100 },
  { sales: 120 },
  { sales: 110 },
  { sales: 115 },
  { sales: 105 },
  { sales: 500 }, // High Outlier
  { sales: 10 },  // Low Outlier
  { sales: 112 },
  { sales: 118 },
  { sales: 108 }
];

console.log("Running Anomaly Detection Test...");
const profile = profileData(data);
const results = detectAllAnomalies(data, profile);

results.forEach(result => {
  console.log(`Field: ${result.field}`);
  console.log(`Mean: ${result.mean}, Std: ${result.std}`);
  console.log(`Anomalies Found: ${result.anomalies.length}`);
  
  result.anomalies.forEach(a => {
    console.log(`  - Value: ${a.value}, Type: ${a.type}, Row: ${a.rowIndex}`);
  });
});

// Verify logic
if (results[0].anomalies.some(a => a.value === 500 && a.type === 'high')) {
  console.log("[PASS] High outlier detected correctly.");
} else {
  console.error("[FAIL] High outlier not detected.");
}

if (results[0].anomalies.some(a => a.value === 10 && a.type === 'low')) {
  console.log("[PASS] Low outlier detected correctly.");
} else {
  console.error("[FAIL] Low outlier not detected.");
}
