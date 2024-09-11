const jsonServer = require("json-server");
const fs = require("fs");
const path = require("path");
const stringSimilarity = require("string-similarity");

const server = jsonServer.create();
const router = jsonServer.router("db.json"); // Assuming 'db.json' contains your food data
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080;

// Load the food data from the JSON file
const foodDataPath = path.join(__dirname, 'db.json'); // Or whichever file has your data
let foodDatabase = {};

fs.readFile(foodDataPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading food data file:', err);
    process.exit(1);
  }
  foodDatabase = JSON.parse(data);
});

// Middleware to parse requests
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Helper function to find the best match for a food name
function findBestMatch(foodName) {
  const foodNames = Object.keys(foodDatabase);
  const bestMatch = stringSimilarity.findBestMatch(foodName, foodNames).bestMatch;

  if (bestMatch.rating >= 0.4) { // 0.4 threshold to ensure a reasonable match
    return foodDatabase[bestMatch.target];
  }
  return null;
}

// Custom route for nutritional info
server.get('/nutrition/:foodName', (req, res) => {
  const foodName = req.params.foodName.toLowerCase();
  const foodItem = findBestMatch(foodName);

  if (!foodItem) {
    return res.status(404).json({
      message: `Nutritional information for '${foodName}' not found.`,
    });
  }

  res.json({
    name: foodItem.name,
    protein: `${foodItem.protein} grams`,
    carbs: `${foodItem.carbs} grams`,
    fat: `${foodItem.fat} grams`,
    calories: `${foodItem.calories} kcal`,
    allergens: foodItem.allergens.join(', '),
  });
});

// Use json-server for basic CRUD operations
server.use(router);

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
