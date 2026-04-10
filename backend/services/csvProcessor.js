const fs = require('fs');
const csv = require('csv-parser');
const Dataset = require('../models/Dataset');

/**
 * Infer data type for a given value
 */
const inferType = (value) => {
    if (!value || value.trim() === '') return { type: null, value: null };
    
    const cleanValue = value.trim();
    
    // Check for Numeric (handle currency symbols and commas)
    const numericValue = cleanValue.replace(/[$,]/g, '');
    if (!isNaN(numericValue) && !isNaN(parseFloat(numericValue))) {
        return { type: 'Numeric', value: parseFloat(numericValue) };
    }
    
    // Check for Date
    const date = Date.parse(cleanValue);
    if (!isNaN(date) && isNaN(cleanValue)) {
        return { type: 'Date', value: new Date(date) };
    }
    
    return { type: 'Categorical', value: cleanValue };
};

/**
 * Intelligent Mapping: Find business-critical columns using fuzzy matching
 */
const inferSpecialFields = (columns) => {
    const mapping = {
        revenue: null,
        date: null,
        category: null
    };

    const keys = Object.keys(columns);
    
    // 1. Revenue/Sales
    mapping.revenue = keys.find(k => 
        /revenue|sales|amount|total|price|income|cost|value/i.test(k) && 
        columns[k] === 'Numeric'
    );

    // 2. Date
    mapping.date = keys.find(k => 
        /date|time|timestamp|period|day|month|year|occured/i.test(k) && 
        columns[k] === 'Date'
    );

    // 3. Category
    mapping.category = keys.find(k => 
        /category|type|group|product|item|region|user|customer|department/i.test(k) && 
        columns[k] === 'Categorical'
    );

    return mapping;
};

/**
 * Process CSV File: Stream, Infer Schema, and Store in DB
 */
const processCSV = (filePath, originalName) => {
    return new Promise((resolve, reject) => {
        const records = [];
        const typeVotes = {}; 
        let rowCount = 0;
        let totalRevenue = 0;

        const stream = fs.createReadStream(filePath).pipe(csv());
        
        // Removed strict header validation to support any dataset
        stream.on('headers', (headers) => {
            console.log(`[CSVProcessor] Headers detected: ${headers.join(', ')}`);
        });

        stream.on('data', (row) => {
                rowCount++;
                
                // Keep only first 5,000 records in memory for the DB document preview
                // This prevents exceeding MongoDB's 16MB limit for 100MB files
                if (rowCount <= 5000) {
                    records.push(row);
                }
                
                // Track types for first 500 rows to build schema mapping
                if (rowCount <= 500) {
                    Object.keys(row).forEach(col => {
                        const { type } = inferType(row[col]);
                        if (type) {
                            if (!typeVotes[col]) typeVotes[col] = { Numeric: 0, Date: 0, Categorical: 0 };
                            typeVotes[col][type]++;
                        }
                    });
                }

                // Global KPI Calculation (Total Revenue)
                // We'll figure out which column is revenue later, so we do this in 'end'
                // to avoid double-processing if we don't know the column yet.
                // Wait, to be efficient for 100MB, we should ideally know the column.
                // But since we are streaming, we'll do a second pass or just use the sampled data?
                // Actually, for 100MB, a second pass is fine since it's on disk.
            })
            .on('end', async () => {
                try {
                    // Finalize Column Types
                    const columns = {};
                    Object.keys(typeVotes).forEach(col => {
                        const votes = typeVotes[col];
                        columns[col] = Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b);
                    });

                    // Infer Special Fields
                    const fieldMapping = inferSpecialFields(columns);

                    // Re-calculate Total Revenue for the FULL dataset if we found a revenue column
                    if (fieldMapping.revenue) {
                        try {
                            // Quick second pass for KPIs only (very fast even for 100MB)
                            await new Promise((res, rej) => {
                                let total = 0;
                                fs.createReadStream(filePath)
                                    .pipe(csv())
                                    .on('data', (r) => {
                                        const val = parseFloat(String(r[fieldMapping.revenue]).replace(/[$,]/g, ''));
                                        if (!isNaN(val)) total += val;
                                    })
                                    .on('end', () => {
                                        totalRevenue = total;
                                        res();
                                    })
                                    .on('error', rej);
                            });
                        } catch (e) {
                            console.warn('[CSVProcessor] KPI pass failed:', e.message);
                        }
                    }

                    // Create Dataset Entry
                    const dataset = new Dataset({
                        filename: originalName,
                        rowCount: rowCount,
                        columnCount: Object.keys(columns).length,
                        columns: columns,
                        fieldMapping: fieldMapping,
                        records: records, // Limited to first 5000 for MongoDB safety
                        metadata: {
                            totalRevenue: totalRevenue,
                            avgRevenue: rowCount > 0 ? totalRevenue / rowCount : 0
                        }
                    });

                    await dataset.save();
                    
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

                    resolve(dataset);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => {
                reject(err);
            });
    });
};

module.exports = {
    processCSV
};
