const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Main odds route
app.get('/api/odds', async (req, res) => {
    console.log('Fetching NHL odds data...');
    try {
        const response = await axios.get(
            'https://api.the-odds-api.com/v4/sports/icehockey_nhl/odds/',
            {
                params: {
                    apiKey: process.env.ODDS_API_KEY,
                    regions: 'eu',
                    markets: 'h2h,spreads',
                    oddsFormat: 'decimal',
                    includeLinks: true
                },
            }
        );
        console.log('API Response:', JSON.stringify(response.data, null, 2)); // Logga respons
        res.json(response.data);
        
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch NHL odds data',
            message: error.message,
            timestamp: new Date(),
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log(`- http://localhost:${PORT}/api/odds (NHL odds data)`);
    console.log('=================================');
});
