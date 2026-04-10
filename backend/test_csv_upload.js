/**
 * test_csv_upload.js
 * Verification script for flexible CSV parsing.
 */
const { processDataset } = require('./utils/validateAndNormalize');

const testCases = [
  {
    name: 'Standard Headers',
    data: [
      { date: '2026-03-01', product: 'AI Model A', sales: '10', revenue: '500.50' },
      { date: '2026-03-02', product: 'AI Model B', sales: '5', revenue: '250.00' }
    ],
    expectSuccess: true
  },
  {
    name: 'Alternative Headers',
    data: [
      { 'Order Date': '2026-04-01', 'Category': 'Analytics', 'Sales': '20', 'Profit': '1200.75' },
      { 'Order Date': '2026-04-02', 'Category': 'Forecasting', 'Sales': '15', 'Profit': '900.00' }
    ],
    expectSuccess: true
  },
  {
    name: 'Mixed/Messy Headers with currency symbols',
    data: [
      { 'date': '01-05-2026', 'Item': 'Neural Net', 'Units Sold': '100', 'Amount': '$5,000.00' },
      { 'date': '02-05-2026', 'Item': 'Deep Learning', 'Units Sold': '50', 'Amount': '$2,500.00' }
    ],
    expectSuccess: true
  },
  {
    name: 'Missing Required Field (product)',
    data: [
      { 'date': '2026-06-01', 'sales': '10', 'revenue': '100' }
    ],
    expectSuccess: false
  }
];

console.log('--- Starting CSV Normalization Tests ---\n');

testCases.forEach((tc, i) => {
  console.log(`Test ${i + 1}: ${tc.name}`);
  const result = processDataset(tc.data);
  
  if (tc.expectSuccess) {
    if (result.valid.length === tc.data.length) {
      console.log('✅ PASS: All rows normalized successfully.');
      console.log('   Sample normalized row:', JSON.stringify(result.valid[0], null, 2));
    } else {
      console.log('❌ FAIL: Expected success but got partial or no valid rows.');
      console.error('   Errors:', JSON.stringify(result.invalid[0]?.errors, null, 2));
    }
  } else {
    if (result.valid.length === 0) {
      console.log('✅ PASS: Correctly rejected invalid headers.');
      console.log('   Reported error:', result.invalid[0]?.errors[0]);
    } else {
      console.log('❌ FAIL: Expected failure but some rows were accepted.');
    }
  }
  console.log('\n----------------------------------------\n');
});

console.log('--- Tests Completed ---');
