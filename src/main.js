import words from './words.json';
import './main.scss';

const wordsElement = document.getElementById('words');
const wordInput = document.getElementById('wordInput');
const timerElement = document.getElementById('time');
const wpmElement = document.getElementById('wpm');
const restartButton = document.getElementById('restartButton');
const languagePicker = document.getElementById('languagePicker');
const difficultyPicker = document.getElementById('difficultyPicker');
const wordAmountPicker = document.getElementById('wordAmountPicker');

let language;
let difficulty;
let wordAmount = 100;
let randomWords = [];
let currentIndex = 0;
let started = false;
let right = 0;
let time = 0;
let timer;

const getDifficulty = () => {
  switch (difficulty) {
    case 'easy':
      return 100;
    case 'medium':
      return 250;
    case 'hard':
      return 500;
    default:
      return 100;
  }
};

const setActiveDropdownItem = (dropdownId, textContent) => {
  const dropdown = document.getElementById(dropdownId);
  dropdown.childNodes.forEach((child) => {
    child.className = 'dropdown-item';
    if (child.textContent.trim() == textContent) {
      child.className = 'dropdown-item active';
    }
  });
};

const setDifficulty = (diff) => {
  difficulty = diff;
  localStorage.setItem('difficulty', diff);
  setActiveDropdownItem('difficultyPicker', diff);
  restartGame();
};

const generateRandomWords = () => {
  let generatedWords = [];
  for (let i = 0; i < wordAmount; i++) {
    const languageSpecificWords = words[language];
    const length = getDifficulty();
    const randomIndex = Math.floor(Math.random() * length) + 0;
    const randomWord = languageSpecificWords[randomIndex];
    generatedWords.push(randomWord);
  }
  randomWords = generatedWords;
};

const displayWords = () => {
  while (wordsElement.firstChild) {
    wordsElement.removeChild(wordsElement.firstChild);
  }
  randomWords.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = word;
    if (i === 0) {
      span.className = 'word current';
    }
    wordsElement.appendChild(span);
  });
};

const startTimer = () => {
  if (started) {
    timer = setTimeout(() => {
      time += 1;
      startTimer();
    }, 1000);
  } else {
    timer = undefined;
    started = false;
  }
};

const checkWord = (e) => {
  if (!started) {
    started = true;
    startTimer();
  }
  if (e.keyCode === 32) {
    e.preventDefault();
    const currentInputValue = wordInput.value;
    wordInput.value = '';
    if (started && currentIndex === randomWords.length - 1) {
      started = false;
      wpmElement.textContent = ((right / time) * 60).toFixed(2);
      timerElement.textContent = time.toFixed(2);
    }
    const currentWord = randomWords[currentIndex];
    const currentWordElement = wordsElement.childNodes[currentIndex];
    const nextWordElement = wordsElement.childNodes[currentIndex + 1];
    if (currentInputValue === currentWord) {
      right += 1;
      currentWordElement.className = 'word correct';
    } else {
      currentWordElement.className = 'word wrong';
    }
    if (nextWordElement) nextWordElement.className = 'word current';
    currentIndex += 1;
  }
};

const restartGame = () => {
  wpmElement.textContent = '00';
  timerElement.textContent = '00';
  wordInput.value = '';
  randomWords = [];
  currentIndex = 0;
  started = false;
  right = 0;
  time = 0;
  timer = null;
  generateRandomWords();
  displayWords();
};

const setWordAmount = (wa) => {
  wordAmount = wa;
  localStorage.setItem('wordAmount', wa);
  setActiveDropdownItem('wordAmountPicker', wa);
  restartGame();
};

const clearDropdowns = () => {
  const dropdowns = document.getElementsByClassName('dropdown-content');
  Array.from(dropdowns).forEach((child) => {
    if (child.classList.contains('open')) {
      child.classList.remove('open');
    }
  });
};

const toggleDropdown = (dropdownId) => {
  clearDropdowns();
  const dropdown = document.getElementById(dropdownId);
  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  if (dropdown.classList.contains('open')) {
    dropdown.classList.remove('open');
  } else {
    dropdown.classList.add('open');
  }
};

const getLanguages = () => {
  const languages = Object.keys(words);
  languages.forEach((lang) => {
    const dropdownItem = document.createElement('div');
    dropdownItem.classList.add('dropdown-item');
    dropdownItem.addEventListener('click', () => {
      setLanguage(lang);
    });
    dropdownItem.textContent = lang;
    languagePicker.append(dropdownItem);
  });
};

const setLanguage = (lang) => {
  language = lang;
  localStorage.setItem('language', lang);
  setActiveDropdownItem('languagePicker', lang);
  restartGame();
};

(() => {
  getLanguages();
  setLanguage(localStorage.getItem('language') || 'english');
  setDifficulty(localStorage.getItem('difficulty') || 'easy');
  setWordAmount(JSON.parse(localStorage.getItem('wordAmount')) || 100);
  generateRandomWords();
  displayWords();
  wordInput.addEventListener('keypress', checkWord);
  restartButton.addEventListener('click', restartGame);
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('dropdown-btn')) {
      return;
    }
    clearDropdowns();
  });
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.keyCode === 82) restartGame();
    }
  });
})();

// Attach global functions to the window. This is needed for parcel.
window.setDifficulty = setDifficulty;
window.setLanguage = setLanguage;
window.setWordAmount = setWordAmount;
window.toggleDropdown = toggleDropdown;
