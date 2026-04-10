const axios = require('axios');

const datasetId = '69d3302445d4f99882cb4c49';
const message = 'Based on the dataset, what was the highest revenue recorded and for which product?';

axios.post('http://localhost:5000/api/chat/ask', {
    datasetId: datasetId,
    message: message
})
.then(res => {
    console.log('--- AI Response ---');
    console.log(res.data.response);
    process.exit(0);
})
.catch(err => {
    console.error('Error:', err.response?.data || err.message);
    process.exit(1);
});
