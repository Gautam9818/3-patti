const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");


const app = express();
const server = http.createServer(app);

// Enable CORS properly
app.use(cors({ origin: "https://3-patti-production.up.railway.app" }));

const io = new Server(server, {
    cors: {
        origin: "https://3-patti-production.up.railway.app",
        methods: ["GET", "POST"]
    }
});

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
let deck = [];
let players = [];

// Create & Shuffle Deck
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Handle Player Connection
io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);
    players.push({ id: socket.id, cards: [] });

    io.emit("updatePlayers", players);

    socket.on("startGame", () => {
        if (players.length < 2 || players.length > 5) {
            io.emit("errorMessage", "Game needs 2 to 5 players.");
            return;
        }

        createDeck();
        players.forEach(player => {
            player.cards = deck.splice(0, 3);
        });

        io.emit("startGame", players);
        determineWinner();
    });

    socket.on("disconnect", () => {
        players = players.filter(player => player.id !== socket.id);
        io.emit("updatePlayers", players);
        console.log(`Player disconnected: ${socket.id}`);
    });
});

// Determine Winner
function getCardValue(card) {
    if (card.rank === "A") return 14;
    if (card.rank === "K") return 13;
    if (card.rank === "Q") return 12;
    if (card.rank === "J") return 11;
    return parseInt(card.rank);
}

function determineWinner() {
    let highestValue = 0;
    let winner = "";

    players.forEach(player => {
        let maxCard = Math.max(...player.cards.map(getCardValue));
        if (maxCard > highestValue) {
            highestValue = maxCard;
            winner = `Player ${player.id}`;
        }
    });

    io.emit("winner", winner);
}

// Start Server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

