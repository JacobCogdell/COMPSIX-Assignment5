const express = require('express');
const app = express();

app.use(express.json());
// Middleware Logging function to log details of each request
function LogRequest(req, res, next) {
    const timestamp = new Date().toISOString();

    console.log("=======================================");
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.originalUrl}`);

    // Only log body for POST and PUT
    if (req.method === "POST" || req.method === "PUT") {
        console.log("Request Body:", req.body);
    }

    console.log("=======================================");

    next();
}

// Validation Middleware
function ValidateMenuItem(req, res, next) {
    const { name, description, price, category, ingredients, available } = req.body;

    const errors = [];

    // Name: required, string, min 3 chars
    if (!name || typeof name !== "string" || name.length < 3) {
        errors.push("Name is required and must be at least 3 characters.");
    }

    // Description: required, string, min 10 chars
    if (!description || typeof description !== "string" || description.length < 10) {
        errors.push("Description is required and must be at least 10 characters.");
    }

    // Price: required, number, > 0
    if (price === undefined || typeof price !== "number" || price <= 0) {
        errors.push("Price is required and must be a number greater than 0.");
    }

    // Category: required, must be one of allowed values
    const validCategories = ["appetizer", "entree", "dessert", "beverage"];
    if (!category || !validCategories.includes(category)) {
        errors.push(`Category must be one of: ${validCategories.join(", ")}`);
    }

    // Ingredients: required array, at least 1 item
    if (!Array.isArray(ingredients) || ingredients.length < 1) {
        errors.push("Ingredients must be an array with at least one ingredient.");
    }

    // Available: optional boolean, default true
    if (available !== undefined && typeof available !== "boolean") {
        errors.push("Available must be a boolean value.");
    }

    // If any errors exist, return 400
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // If available is missing, default to true
    if (available === undefined) {
        req.body.available = true;
    }

    next();
}

app.use(LogRequest);

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

/* ============================================================
   GET /api/menu - Retrieve all menu items
   ============================================================ */
app.get('/api/menu', (req, res) => {
    res.json(menuItems);
});

/* ============================================================
   GET /api/menu/:id - Retrieve a specific menu item
   ============================================================ */
app.get('/api/menu/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = menuItems.find(m => m.id === id);

    if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(item);
});

/* ============================================================
   POST /api/menu - Add a new menu item
   ============================================================ */
app.post('/api/menu', ValidateMenuItem, (req, res) => {
    const { name, description, price, category, ingredients, available } = req.body;

    const newItem = {
        id: menuItems.length + 1,
        name,
        description,
        price,
        category,
        ingredients,
        available
    };

    menuItems.push(newItem);
    res.status(201).json(newItem);
});

/* ============================================================
   PUT /api/menu/:id - Update an existing menu item
   ============================================================ */
app.put('/api/menu/:id', ValidateMenuItem, (req, res) => {
    const id = parseInt(req.params.id);
    const item = menuItems.find(m => m.id === id);

    if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
    }

    const { name, description, price, category, ingredients, available } = req.body;

    item.name = name ?? item.name;
    item.description = description ?? item.description;
    item.price = price ?? item.price;
    item.category = category ?? item.category;
    item.ingredients = ingredients ?? item.ingredients;
    item.available = available ?? item.available;

    res.json(item);
});

/* ============================================================
   DELETE /api/menu/:id - Remove a menu item
   ============================================================ */
app.delete('/api/menu/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = menuItems.findIndex(m => m.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Menu item not found" });
    }

    const removed = menuItems.splice(index, 1);
    res.status(200).json(removed[0]);
});

/* ============================================================
   Start the server
   ============================================================ */
app.listen(3000, () => {
    console.log("Restaurant API server running on port 3000");
});