const express = require("express");
const fs = require("fs");
const path = require("path");
const { router } = require("./routers/home.router");

const DATA_DIR = path.join(__dirname, "Data");
const DATA_FILE = path.join(DATA_DIR, "data.json");

// Ensure the data directory exists at startup
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read data from file
let data = [];
try {
    if (fs.existsSync(DATA_FILE)) {
        const rawData = fs.readFileSync(DATA_FILE, "utf8");
        data = JSON.parse(rawData);
    } else {
        // Load initial data from Data.js if JSON doesn't exist yet
        data = require("./Data/Data");
        saveData(data);
    }
} catch (err) {
    console.error("Error reading data file:", err);
    data = [];
}

// Function to save data to JSON file
function saveData(dataToSave) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), "utf8");
    } catch (err) {
        console.error("Error saving data:", err);
    }
}

const app = express();
app.use(express.json());

app.get("/", router);

app.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    const item = data.find((item) => item.id === id);

    if (!item) {
        return res.status(404).send("Data not found");
    }

    res.json(item);
});

app.post("/add", (req, res) => {
    const newData = req.body;

    const exists = data.some((item) => item.id === newData.id);

    if (exists) {
        return res.status(400).send("Id already exists");
    }

    data.push(newData);
    saveData(data);
    res.status(201).send("Data added successfully");
});

app.delete("/delete/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
        return res.status(404).send("Data not found");
    }

    data.splice(index, 1);
    res.send("Data deleted successfully");
});

app.put("/update/:id", (req, res) => {
    const id = Number(req.params.id);
    const newData = req.body;

    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
        return res.status(404).send("Data not found");
    }

    data[index] = {...data[index], ...newData };

    res.send("Data updated successfully");
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});