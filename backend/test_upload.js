const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
    const filePath = path.join(__dirname, 'test_sample.csv');
    const form = new FormData();
    form.append('csvFile', fs.createReadStream(filePath));

    try {
        console.log('Sending CSV upload request...');
        const response = await axios.post('http://localhost:5000/api/data/upload', form, {
            headers: form.getHeaders()
        });

        console.log('Upload successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Upload failed!');
        if (error.response) {
            console.error('Error Data:', error.response.data);
            console.error('Status:', error.response.status);
        } else {
            console.error('Message:', error.message);
        }
    }
}

testUpload();
