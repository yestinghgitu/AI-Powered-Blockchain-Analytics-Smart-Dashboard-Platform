/**
 * validateAndNormalize.js
 * Data pipeline: auto-corrects fixable issues, rejects only un-parseable rows.
 *
 * Auto-correction rules:
 *  - Negative revenue/sales  → absolute value
 *  - Missing/empty product   → defaults to "Unknown"
 *  - Multiple date formats   → normalized (DD-MM-YYYY, MM/DD/YYYY, ISO, timestamps)
 *  - Missing revenue/sales   → defaults to 0 (warned)
 *  - Truly un-parseable date → row rejected (cannot guess intent)
 */

const REQUIRED_FIELDS = ['date', 'product', 'sales', 'revenue'];

/**
 * Flexible mapping for various CSV header formats.
 * Priority is given in the order they appear in the arrays.
 */
const COLUMN_MAP = {
  date: ['date', 'Order Date', 'Transaction Date', 'Timestamp', 'Date', 'Month', 'Period'],
  product: ['product', 'Category', 'Item', 'Description', 'Product', 'Store', 'Department'],
  sales: ['sales', 'Quantity', 'Units Sold', 'Orders', 'Sales', 'Volume', 'Count'],
  revenue: ['revenue', 'Profit', 'Amount', 'Total Sales', 'Revenue', 'Weekly_Sales', 'Earnings']
};

/**
 * Scans a raw row to find which keys map to our required fields.
 * @returns {Object|null} Map of { internalKey: csvKey } or null if missing required fields.
 */
function getNormalizationMap(row) {
  const rowKeys = Object.keys(row);
  const mapping = {};
  const missing = [];

  for (const field of REQUIRED_FIELDS) {
    const candidates = COLUMN_MAP[field];
    const match = rowKeys.find(rk => candidates.some(c => rk.toLowerCase() === c.toLowerCase()));
    
    if (match) {
      mapping[field] = match;
    } else {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    console.warn(`[HeaderDetection] Missing critical columns: ${missing.join(', ')}`);
    return { mapping: null, missing };
  }

  console.log(`[HeaderDetection] Success! Mapped: ${JSON.stringify(mapping)}`);
  return { mapping, missing: [] };
}

/** Try multiple date formats and return a valid Date or null */
function parseDate(raw) {
  if (!raw) return null;
  const str = String(raw).trim();

  // Basic numeric check (Unix timestamp in ms)
  if (/^\d{10,13}$/.test(str)) {
    const d = new Date(Number(str));
    if (!isNaN(d.getTime())) return d;
  }

  const attempts = [
    new Date(str),                                                      // ISO 8601 / MM/DD/YYYY (native)
    new Date(str.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1')),    // DD-MM-YYYY → YYYY-MM-DD
    new Date(str.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2')),  // MM/DD/YYYY explicit
  ];

  for (const d of attempts) {
    if (d instanceof Date && !isNaN(d.getTime())) return d;
  }
  return null;
}

/**
 * Attempt to auto-correct and normalize a single raw row.
 * Returns { doc, warnings, rejected, reason }
 */
function processRow(row, index, mapping = null) {
  const warnings = [];
  const label = `Row ${index + 1}`;

  // If no mapping provided, assume direct property access
  const getVal = (key) => {
    const csvKey = mapping ? mapping[key] : key;
    return row[csvKey];
  };

  const rawDate = getVal('date');
  const date = parseDate(rawDate);
  if (!date) {
    return {
      doc: null, warnings, rejected: true,
      reason: `${label}: cannot parse date "${rawDate}" — use YYYY-MM-DD, DD-MM-YYYY, or MM/DD/YYYY`
    };
  }

  // --- Revenue (auto-correct) ---
  const rawRevenue = getVal('revenue');
  let revenue = parseFloat(String(rawRevenue || '').replace(/[$,]/g, '')); // Handle $ or ,
  if (isNaN(revenue)) {
    revenue = 0;
    warnings.push(`${label}: missing revenue — defaulted to 0`);
  } else if (revenue < 0) {
    warnings.push(`${label}: negative revenue (${revenue}) — converted to ${Math.abs(revenue)}`);
    revenue = Math.abs(revenue);
  }

  // --- Sales (auto-correct) ---
  const rawSales = getVal('sales');
  let sales = parseFloat(String(rawSales || '').replace(/[$,]/g, ''));
  if (isNaN(sales)) {
    sales = 0;
    warnings.push(`${label}: missing sales — defaulted to 0`);
  } else if (sales < 0) {
    warnings.push(`${label}: negative sales (${sales}) — converted to ${Math.abs(sales)}`);
    sales = Math.abs(sales);
  }

  // --- Product (auto-correct) ---
  const rawProduct = getVal('product');
  let product = String(rawProduct || '').trim();
  if (!product) {
    product = 'Unknown';
    warnings.push(`${label}: empty product name — defaulted to "Unknown"`);
  }

  return {
    doc: { date, revenue, sales, product },
    warnings,
    rejected: false,
    reason: null
  };
}

/**
 * Process the entire dataset.
 * Returns { valid, invalid, warnings, summary }
 */
function processDataset(rawRows) {
  const valid = [];
  const invalid = [];
  const allWarnings = [];

  if (rawRows.length === 0) {
    return { valid, invalid, warnings: allWarnings, summary: { totalRows: 0, validRows: 0, invalidRows: 0 } };
  }

  // 1. Detect column mapping from the first row
  const { mapping, missing } = getNormalizationMap(rawRows[0]);
  if (!mapping) {
    return {
      valid,
      invalid: [{ row: rawRows[0], errors: [`Invalid CSV Format: Missing required columns or suitable variants for (${missing.join(', ')})`] }],
      warnings: allWarnings,
      summary: { totalRows: rawRows.length, validRows: 0, invalidRows: rawRows.length }
    };
  }

  // 2. Process all rows using detected mapping
  rawRows.forEach((row, index) => {
    const result = processRow(row, index, mapping);
    if (result.warnings.length > 0) allWarnings.push(...result.warnings);

    if (result.rejected) {
      invalid.push({ row, errors: [result.reason] });
    } else {
      valid.push(result.doc);
    }
  });

  return {
    valid,
    invalid,
    warnings: allWarnings,
    summary: {
      totalRows: rawRows.length,
      validRows: valid.length,
      invalidRows: invalid.length,
      autoCorrections: allWarnings.length,
      validationRate: rawRows.length > 0
        ? `${((valid.length / rawRows.length) * 100).toFixed(1)}%`
        : '0%'
    }
  };
}

module.exports = { processDataset, processRow, getNormalizationMap, parseDate, REQUIRED_FIELDS };
