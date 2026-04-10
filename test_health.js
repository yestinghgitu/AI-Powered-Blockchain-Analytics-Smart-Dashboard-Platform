const { profileData } = require('./backend/services/dataProfiler');
const { getHealthScore } = require('./backend/services/healthScore');

const testCases = [
  {
    name: "Perfect Dataset",
    data: Array.from({ length: 1100 }, (_, i) => ({
      id: i, col1: "a", col2: "b", col3: "c", col4: "d", col5: "e", col6: "f", col7: "g", col8: "h"
    })),
    expectedStatus: "Excellent",
    expectedMinScore: 90
  },
  {
    name: "Small Dataset with Gaps",
    data: [
      { id: 1, val: null, cat: "A" },
      { id: 2, val: 10, cat: null }
    ],
    expectedStatus: "Poor"
  },
  {
    name: "Empty Dataset",
    data: [],
    expectedScore: 0
  }
];

testCases.forEach(tc => {
  console.log(`Running Test: ${tc.name}`);
  const profile = profileData(tc.data);
  const health = getHealthScore(profile);
  
  console.log(`  Score: ${health.score}`);
  console.log(`  Status: ${health.status}`);
  console.log(`  Insights: ${health.insights.join(' | ')}`);

  if (tc.expectedStatus && health.status !== tc.expectedStatus) {
    console.error(`  [FAIL] Expected status ${tc.expectedStatus}, got ${health.status}`);
  }
  if (tc.expectedMinScore && health.score < tc.expectedMinScore) {
    console.error(`  [FAIL] Expected score >= ${tc.expectedMinScore}, got ${health.score}`);
  }
  if (tc.expectedScore !== undefined && health.score !== tc.expectedScore) {
    console.error(`  [FAIL] Expected score ${tc.expectedScore}, got ${health.score}`);
  }

  console.log('---');
});
