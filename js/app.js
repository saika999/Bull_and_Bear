'use strict'
import { countries } from "./countries.js";

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const form = document.getElementById('start-form');
const nicknameInput = document.getElementById('nickname');
const countrySelect = document.getElementById('country');
const errorMessage = document.getElementById('form-error');

const profileTrigger = document.getElementById('profile-trigger');
const profileDropdown = document.getElementById('profile-dropdown');
const profileAvatar = document.getElementById('profile-avatar');
const profileFlag = document.getElementById('profile-flag');
const dropdownAvatar = document.getElementById('dropdown-avatar');
const dropdownName = document.getElementById('dropdown-name');
const dropdownFlag = document.getElementById('dropdown-flag');
const dropdownCountryName = document.getElementById('dropdown-country-name');
const profileLogout = document.getElementById('profile-logout');
const profileBadge = document.getElementById('profile-badge');

const currentPriceEl = document.getElementById('current-price');
const scoreValueEl = document.getElementById('score-value');
const btnBull = document.getElementById('btn-bull');
const btnBear = document.getElementById('btn-bear');

// заполняем select странами
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

function getCountryData(code) {
    return countries.find(item => item.code === code);
}

function renderProfile(player) {
    const initial = player.nickname.charAt(0).toUpperCase();
    const countryData = getCountryData(player.country);

    profileAvatar.textContent = initial;
    dropdownAvatar.textContent = initial;
    dropdownName.textContent = player.nickname;

    if (countryData && countryData.flag) {
        profileFlag.src = countryData.flag;
        profileFlag.alt = countryData.country;
        profileFlag.style.display = 'block';

        dropdownFlag.src = countryData.flag;
        dropdownFlag.alt = countryData.country;
        dropdownFlag.style.display = 'block';
        dropdownCountryName.textContent = countryData.country;
    } else {
        profileFlag.style.display = 'none';
        dropdownFlag.style.display = 'none';
        dropdownCountryName.textContent = player.country;
    }

    profileBadge.classList.remove('hidden');
}

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