'use strict'

const buttons = document.querySelectorAll('.currency-btn');
const coinNameEl = document.getElementById('coin-name');
const currentPriceEl = document.getElementById('current-price');
const bitcoinCanvas = document.getElementById('bitcoin-canvas');
const chartCtx = bitcoinCanvas.getContext('2d');

const priceHistory = [];
const MAX_POINTS = 100;
let socket = null;

function drawChart() {
    if (priceHistory.length < 2) return;

    const width = bitcoinCanvas.width = bitcoinCanvas.clientWidth;
    const height = bitcoinCanvas.height = bitcoinCanvas.clientHeight;
    const min = Math.min(...priceHistory);
    const max = Math.max(...priceHistory);
    const range = (max - min) || 1;

    chartCtx.clearRect(0, 0, width, height);
    chartCtx.beginPath();

    priceHistory.forEach((price, i) => {
        const x = (i / (priceHistory.length - 1)) * width;
        const y = height - ((price - min) / range) * height;
        i === 0 ? chartCtx.moveTo(x, y) : chartCtx.lineTo(x, y);
    });

    chartCtx.strokeStyle = priceHistory.at(-1) >= priceHistory[0] ? '#2e9e5b' : '#d64545';
    chartCtx.stroke();
}

export function connect(stream) {
    if (socket) socket.close();
    priceHistory.length = 0;

    socket = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}@aggTrade`);
    socket.addEventListener('message', (event) => {
        const price = Number(JSON.parse(event.data).p);
        currentPriceEl.textContent = `$${price.toFixed(2)}`;
        priceHistory.push(price);
        if (priceHistory.length > MAX_POINTS) priceHistory.shift();
        drawChart();
    });
}

buttons.forEach(button => {
    button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('currency-btn_active'));
        button.classList.add('currency-btn_active');
        coinNameEl.textContent = button.dataset.name;
        connect(button.dataset.stream);
    });
});

connect('btcusdt');