'use strict'
import { countries } from "./countries.js";
import { profileBadge,  renderProfile } from "./profile_card.js";

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const form = document.getElementById('start-form');
const nicknameInput = document.getElementById('nickname');
const countrySelect = document.getElementById('country');
const errorMessage = document.getElementById('form-error');

const profileTrigger = document.getElementById('profile-trigger');
const profileDropdown = document.getElementById('profile-dropdown');
const profileLogout = document.getElementById('profile-logout');

const currentPriceEl = document.getElementById('current-price');
const scoreValueEl = document.getElementById('score-value');
const btnBull = document.getElementById('btn-bull');
const btnBear = document.getElementById('btn-bear');
const bitcoinCanvas = document.getElementById('bitcoin-canvas');
const chartLoading = document.querySelector('.bitcoin-chart__loading');
const chartFrame = document.querySelector('.bitcoin-chart__frame');
const chartCtx = bitcoinCanvas.getContext('2d');

const priceHistory = [];
const MAX_POINTS = 120;
const BINANCE_URL = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=30'
const CRYPTO_CURRENCIES = {
    BTC: { symbol: 'BTCUSDT', name: 'Bitcoin' },
    ETH: { symbol: 'ETHUSDT', name: 'Ethereum' },
    SOL: { symbol: 'SOLUSDT', name: 'Solana' }
}

const coinName = document.getElementById('coin-name');
const coinBtns = document.querySelectorAll('.currency-btn');
let selectedCoin = 'BTC'

function resizeCanvas() {
    const rect = bitcoinCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    bitcoinCanvas.width = rect.width * dpr;
    bitcoinCanvas.height = rect.height * dpr;
    bitcoinCanvas.style.width = `${rect.width}px`;
    bitcoinCanvas.style.height = `${rect.height}px`;
    chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawChart() {
    if (priceHistory.length < 2) return;

    const width = bitcoinCanvas.clientWidth;
    const height = bitcoinCanvas.clientHeight;
    const padding = 20;

    chartCtx.clearRect(0, 0, width, height);

    const min = Math.min(...priceHistory);
    const max = Math.max(...priceHistory);
    const range = (max - min) || 1;
    const stepX = (width - padding * 2) / (MAX_POINTS - 1);

    chartCtx.strokeStyle = 'rgba(0,0,0,0.06)';
    chartCtx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + ((height - padding * 2) / 4) * i;
        chartCtx.beginPath();
        chartCtx.moveTo(padding, y);
        chartCtx.lineTo(width - padding, y);
        chartCtx.stroke();
    }

    chartCtx.beginPath();
    priceHistory.forEach((price, i) => {
        const x = padding + i * stepX;
        const y = padding + (height - padding * 2) * (1 - (price - min) / range);
        i === 0 ? chartCtx.moveTo(x, y) : chartCtx.lineTo(x, y);
    });

    const trendUp = priceHistory[priceHistory.length - 1] >= priceHistory[0];
    chartCtx.strokeStyle = trendUp ? '#2e9e5b' : '#d64545';
    chartCtx.lineWidth = 2;
    chartCtx.stroke();

    const lastX = padding + (priceHistory.length - 1) * stepX;
    chartCtx.lineTo(lastX, height - padding);
    chartCtx.lineTo(padding, height - padding);
    chartCtx.closePath();
    const gradient = chartCtx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, trendUp ? 'rgba(46,158,91,0.2)' : 'rgba(214,69,69,0.2)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    chartCtx.fillStyle = gradient;
    chartCtx.fill();

    chartLoading.classList.add('hidden');
}

function addPricePoint(price) {
    priceHistory.push(price);
    if (priceHistory.length > MAX_POINTS) priceHistory.shift();
    requestAnimationFrame(drawChart);
}

window.addEventListener('resize', () => {
    resizeCanvas();
    drawChart();
});

resizeCanvas();

countries.forEach(item => {
    const option = document.createElement('option');
    option.value = item.code;
    option.textContent = item.country;
    countrySelect.append(option);
});

let score = 0;
let currentPrice = generatePrice();

function generatePrice() {
    return 60000 + Math.random() * 5000;
}


function updatePriceDisplay() {
    currentPriceEl.textContent = `$${currentPrice.toFixed(2)}`;
}

setInterval(() => {
    updatePriceDisplay();
}, 20000);

let socket = null;

function startLivePrice(stream = 'btcusdt') {
    if (socket) {
        socket.onclose = null;
        socket.close();
    }

    priceHistory.length = 0;

    socket = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}@aggTrade`);

    socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        currentPrice = Number(data.p);
        updatePriceDisplay();
        addPricePoint(currentPrice);
    });

    socket.addEventListener("close", () => {
        setTimeout(() => startLivePrice(stream), 3000);
    });
}

startLivePrice('btcusdt');

coinBtns.forEach(button => {
    button.addEventListener('click', () => {
        coinBtns.forEach(btn => btn.classList.remove('currency-btn_active'));
        button.classList.add('currency-btn_active');

        coinName.textContent = button.dataset.name;
        selectedCoin = button.dataset.coin;

        startLivePrice(button.dataset.stream);

        chartFrame.src = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_btc&symbol=BITSTAMP%3A${button.dataset.symbol}&interval=15&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=F1F3F6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&locale=uk`;
    });
});

function switchToGameScreen() {
    startScreen.classList.add('fade-out');

    setTimeout(() => {
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        requestAnimationFrame(() => {
            gameScreen.classList.add('fade-in');
        });
    }, 350);
}

function switchToStartScreen() {
    gameScreen.classList.add('hidden');
    gameScreen.classList.remove('fade-in');
    startScreen.classList.remove('hidden', 'fade-out');
    profileDropdown.classList.add('hidden');
    profileBadge.classList.add('hidden');
    nicknameInput.value = '';
    countrySelect.value = '';
}

function savePlayer(player) {
    localStorage.setItem('player', JSON.stringify(player));
}

function loadPlayer() {
    const data = localStorage.getItem('player');
    return data ? JSON.parse(data) : null;
}

function clearPlayer() {
    localStorage.removeItem('player');
}

function showError(text) {
    errorMessage.textContent = text;
    errorMessage.classList.add('form-group__error--visible');
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('form-group__error--visible');
}

function makePrediction(direction) {
    const newPrice = generatePrice();
    const wentUp = newPrice > currentPrice;

    if ((direction === 'bull' && wentUp) || (direction === 'bear' && !wentUp)) {
        score++;
    } else {
        score = Math.max(0, score - 1);
    }

    currentPrice = newPrice;
    updatePriceDisplay();
    scoreValueEl.textContent = score;
}

btnBull.addEventListener('click', () => makePrediction('bull'));
btnBear.addEventListener('click', () => makePrediction('bear'));

profileTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    profileDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (event) => {
    if (!profileDropdown.contains(event.target) && !profileTrigger.contains(event.target)) {
        profileDropdown.classList.add('hidden');
    }
});

profileLogout.addEventListener('click', () => {
    clearPlayer();
    score = 0;
    scoreValueEl.textContent = score;
    switchToStartScreen();
});

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nicknameValue = nicknameInput.value.trim();
    const countryValue = countrySelect.value;

    if (!nicknameValue || !countryValue) {
        showError('Введите данные');
        return;
    }

    hideError();

    const player = { nickname: nicknameValue, country: countryValue };
    savePlayer(player);
    renderProfile(player);
    updatePriceDisplay();
    switchToGameScreen();
});

const existingPlayer = loadPlayer();
if (existingPlayer) {
    renderProfile(existingPlayer);
    updatePriceDisplay();
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameScreen.classList.add('fade-in');
}