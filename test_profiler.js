const { profileData } = require('./backend/services/dataProfiler');

const testCases = [
  {
    name: "Empty Dataset",
    data: [],
    expectedStatus: "empty"
  },
  {
    name: "Mixed Types and Strict Numeric",
    data: [
      { id: "1", val: "100", date: "2023-01-01", mixed: "123abc" },
      { id: "2", val: "$150", date: "Jan 2, 2023", mixed: "def" },
      { id: "3", val: "200.50", date: "2023-03-01", mixed: "456" },
      { id: "4", val: null, date: "", mixed: "789" }
    ],
    expectedTypes: {
      id: "numeric",
      val: "numeric",
      date: "date",
      mixed: "categorical"
    }
  },
  {
    name: "High Cardinality (Unique Limit)",
    data: Array.from({ length: 1500 }, (_, i) => ({ col: `val_${i}` })),
    expectedUnique: "1000+"
  }
];

testCases.forEach(tc => {
  console.log(`Running Test: ${tc.name}`);
  const result = profileData(tc.data);
  
  if (tc.expectedStatus && result.status !== tc.expectedStatus) {
    console.error(`  [FAIL] Expected status ${tc.expectedStatus}, got ${result.status}`);
  }

  if (tc.expectedTypes) {
    Object.entries(tc.expectedTypes).forEach(([col, type]) => {
      if (result.columns[col].type !== type) {
        console.error(`  [FAIL] Expected ${col} to be ${type}, got ${result.columns[col].type}`);
      } else {
        console.log(`  [PASS] ${col} is ${type}`);
      }
    });
  }

  if (tc.expectedUnique && result.columns.col.uniqueCount !== tc.expectedUnique) {
    console.error(`  [FAIL] Expected uniqueCount ${tc.expectedUnique}, got ${result.columns.col.uniqueCount}`);
  } else if (tc.expectedUnique) {
    console.log(`  [PASS] Unique limit hit correctly: ${result.columns.col.uniqueCount}`);
  }

  console.log('---');
});
