// --- server.js ---

const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000; // The port your server will run on
const SCORES_FILE = path.join(__dirname, 'scores.json'); // The file to store scores

// --- Middleware ---
app.use(cors()); // Allow requests from your game
app.use(express.json()); // Allow the server to understand JSON data from the game

// This line tells Express to serve your game's HTML file and any other static assets
// from the same directory. This is useful for deployment.
app.use(express.static(path.join(__dirname)));

// --- Function to read scores from the file ---
function getScores() {
    // If the file doesn't exist yet, return a default leaderboard
    if (!fs.existsSync(SCORES_FILE)) {
        return [
            { name: 'SERVER', score: 10000 },
            { name: 'ADMIN', score: 7500 },
            { name: 'PRO', score: 5000 },
            { name: 'PLAYER', score: 2500 },
            { name: 'NOOB', score: 1000 }
        ];
    }
    try {
        const scoresData = fs.readFileSync(SCORES_FILE);
        // If the file is empty, return the default list
        if (scoresData.length === 0) {
            return getScores();
        }
        return JSON.parse(scoresData);
    } catch (error) {
        console.error("Error reading scores file:", error);
        return getScores(); // Return default on error
    }
}

// --- Function to save scores to the file ---
function saveScores(scores) {
    scores.sort((a, b) => b.score - a.score); // Sort descending
    const limitedScores = scores.slice(0, 10); // Keep only the top 10
    fs.writeFileSync(SCORES_FILE, JSON.stringify(limitedScores, null, 2));
}

// --- API Endpoints ---

// 1. Endpoint to get the current leaderboard
app.get('/get-scores', (req, res) => {
    console.log('Request received for /get-scores. Sending leaderboard.');
    const scores = getScores();
    res.json(scores);
});

// 2. Endpoint to submit a new score
app.post('/submit-score', (req, res) => {
    const newScore = req.body;

    // Basic validation
    if (!newScore || typeof newScore.name !== 'string' || typeof newScore.score !== 'number') {
        return res.status(400).send({ message: 'Invalid score data.' });
    }

    console.log(`Received new score: ${newScore.name} - ${newScore.score}`);
    
    const scores = getScores();
    scores.push(newScore);
    saveScores(scores);
    
    res.status(201).send({ message: 'Score saved!' });
});


// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Stickman score server is running.`);
    console.log(`Open http://localhost:${PORT}/stickmob7.html in your browser to play.`);
});