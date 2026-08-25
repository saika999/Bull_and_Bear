'use strict';

const buttons = document.querySelectorAll('.currency-btn');
const coinNameEl = document.getElementById('coin-name');
const priceEl = document.getElementById('current-price');

let socket = null;

export function connect(stream) {
    if (socket) {
        socket.close();
    }

    socket = new WebSocket('wss://stream.binance.com:9443/ws/' + stream + '@aggTrade');

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        const price = Number(data.p);
        priceEl.textContent = '$' + price.toFixed(2);
    });
}

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        buttons.forEach((btn) => btn.classList.remove('currency-btn_active'));
        button.classList.add('currency-btn_active');

        coinNameEl.textContent = button.dataset.name;
        connect(button.dataset.stream);
    });
});
console.log(buttons);

connect('btcusdt');