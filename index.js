const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity'); // Import string-similarity

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load the JSON data
const foodData = JSON.parse(fs.readFileSync('foodData.json', 'utf8'));

// Convert foodData keys to lowercase for better matching
const foodNames = Object.keys(foodData).map(item => item.toLowerCase());

// Route to get all food items
app.get('/foods', (req, res) => {
    res.json(foodData);
});

// Route to get a specific food item by name with similarity check
app.get('/foods/:foodName', (req, res) => {
    const foodName = req.params.foodName.toLowerCase();
    
    // Check for an exact match first
    const foodItem = foodData[foodName];
    
    if (foodItem) {
        res.json(foodItem);
    } else {
        // Use string-similarity to find the closest match
        const matches = stringSimilarity.findBestMatch(foodName, foodNames);
        const bestMatch = matches.bestMatch;
        
        if (bestMatch.rating > 0.5) {  // Define a threshold for similarity
            const closestFoodItem = foodData[bestMatch.target];
            res.json(closestFoodItem);
        } else {
            res.status(404).json({ message: 'Food item not found' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
