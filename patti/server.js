const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
let players = [];
let deck = [];

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank });
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Handle player connections
io.on("connection", (socket) => {
    console.log("New player connected:", socket.id);

    // Add player
    players.push({ id: socket.id, cards: [] });
    io.emit("updatePlayers", players);

    // Start game when 3+ players join
    if (players.length >= 3) {
        createDeck();
        shuffleDeck();
        players.forEach((player) => {
            player.cards = deck.splice(0, 3);
        });
        io.emit("startGame", players);
    }

    // Handle disconnection
    socket.on("disconnect", () => {
        players = players.filter((player) => player.id !== socket.id);
        io.emit("updatePlayers", players);
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
