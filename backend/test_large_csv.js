const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api/upload';

async function generateAndUpload() {
    console.log('--- Starting Large CSV & Schema Mapping Test ---');
    
    // 1. Generate a "large-ish" CSV with inconsistent headers
    const filename = 'test_mapping_large.csv';
    const filePath = path.join(__dirname, filename);
    const headers = 'Occured At,Item Name,Total Price,Category Type\n';
    const rows = [];
    
    for (let i = 0; i < 6000; i++) {
        const date = new Date(2024, 0, 1 + Math.floor(i/100)).toISOString().split('T')[0];
        const product = ['Cloud Server', 'GPU Instance', 'Storage Sink', 'API Credits'][i % 4];
        const price = (Math.random() * 100).toFixed(2);
        const category = ['Compute', 'Compute', 'Storage', 'Service'][i % 4];
        rows.push(`${date},${product},${price},${category}`);
    }
    
    fs.writeFileSync(filePath, headers + rows.join('\n'));
    console.log(`Generated test file: ${filename} (${fs.statSync(filePath).size} bytes, 6000 rows)`);

    // 2. Upload the file
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        console.log(`Uploading to ${API_URL}...`);
        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Upload Success!');
        console.log('AI Summary:', JSON.stringify(response.data.summary, null, 2));
        console.log('Blockchain Status:', JSON.stringify(response.data.blockchain, null, 2));
        console.log('Field Mapping:', JSON.stringify(response.data.dataset.mapping, null, 2));
        console.log('Row Count in DB:', response.data.analytics.recordCount);
        console.log('Preview Row Count (Sampled):', response.data.analytics.data.length);
        
        if (response.data.dataset.mapping.revenue === 'Total Price') {
            console.log('✅ Smart Schema Mapping: SUCCESSFULLY matched "Total Price" to revenue');
        } else {
            console.log('❌ Smart Schema Mapping: FAILED to match revenue column');
        }

        if (response.data.analytics.recordCount === 6000) {
            console.log('✅ Global KPI: Full dataset processed (6000 rows)');
        }

    } catch (error) {
        console.error('Upload Failed:', error.response?.data || error.message);
        if (error.response?.data) console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
        if (!error.response) console.error('Stack Trace:', error.stack);
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}

generateAndUpload();
