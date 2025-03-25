const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
let deck = [];
let players = [];

// Create a deck of 52 cards
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank });
        }
    }
}

// Shuffle the deck
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Start Game & Set Up Players
document.getElementById("startGame").addEventListener("click", () => {
    const playerCount = parseInt(document.getElementById("playerCount").value);
    
    if (playerCount < 2 || playerCount > 5) {
        alert("Please select between 2 to 5 players.");
        return;
    }

    // Show Game UI
    document.getElementById("game").style.display = "block";
    const playersContainer = document.getElementById("playersContainer");
    playersContainer.innerHTML = "";

    // Create player sections dynamically
    players = [];
    for (let i = 1; i <= playerCount; i++) {
        players.push({ id: i, cards: [] });

        let playerDiv = document.createElement("div");
        playerDiv.classList.add("player");
        playerDiv.innerHTML = `<h2>Player ${i}</h2><div class="cards" id="player${i}-cards"></div>`;
        playersContainer.appendChild(playerDiv);
    }
});

// Deal cards to players
document.getElementById("dealCards").addEventListener("click", () => {
    createDeck();
    shuffleDeck();

    // Clear previous cards
    players.forEach(player => player.cards = []);

    // Deal 3 cards to each player
    players.forEach(player => {
        player.cards = deck.splice(0, 3);
        displayCards(`player${player.id}-cards`, player.cards);
    });

    determineWinner();
});

// Display cards in UI
function displayCards(playerId, cards) {
    const container = document.getElementById(playerId);
    container.innerHTML = "";
    cards.forEach(card => {
        let cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.innerHTML = `${card.rank}${card.suit}`;
        container.appendChild(cardDiv);
    });
}

// Convert rank to numeric value
function getCardValue(card) {
    if (card.rank === "A") return 14;
    if (card.rank === "K") return 13;
    if (card.rank === "Q") return 12;
    if (card.rank === "J") return 11;
    return parseInt(card.rank);
}

// Determine winner based on highest card
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

    document.getElementById("winner").innerText = `${winner} Wins!`;
}
