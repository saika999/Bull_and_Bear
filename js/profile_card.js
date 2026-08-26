'use strict';

import { countries } from './countries.js';

export const profileBadge = document.getElementById('profile-badge');
const profileFlag = document.getElementById('profile-flag');
const profileAvatar = document.getElementById('profile-avatar');
const dropdownAvatar = document.getElementById('dropdown-avatar');
const dropdownName = document.getElementById('dropdown-name');
const dropdownFlag = document.getElementById('dropdown-flag');
const dropdownCountryName = document.getElementById('dropdown-country-name');

function getCountryData(code) {
    return countries.find(item => item.code === code);
}

export function renderProfile(player) {
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

// function hideProfile() {
//     profileBadge.classList.add('hidden');
// }