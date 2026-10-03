// --- LEVEL DICTIONARY ---
// Levels have been made significantly longer (more targetWords required to pass)
const levelsConfig = {
    1: { targetWords: 10, timeLimit: 12, wordPool: ["let", "const", "var", "push", "init", "pop"] },
    2: { targetWords: 15, timeLimit: 10, wordPool: ["await", "fetch", "break", "false", "class", "async"] },
    3: { targetWords: 20, timeLimit: 8, wordPool: ["function", "override", "firewall", "security", "terminal"] },
    4: { targetWords: 25, timeLimit: 6, wordPool: ["mainframe", "encryption", "console.log", "executable"] },
    5: { targetWords: 30, timeLimit: 5, wordPool: ["document.getElementById", "addEventListener", "localStorage"] } // Clamped floor to 5s for the marathon
};

const endlessWords = ["function", "const", "await", "override", "firewall", "bypass", "mainframe", "encryption", "console.log", "system", "break", "fetch", "document"];

// UI Elements
const mainMenu = document.getElementById('main-menu');
const levelSelectMenu = document.getElementById('level-select');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverSub = document.getElementById('game-over-sub');

const wordDisplay = document.getElementById('word-display');
const wordInput = document.getElementById('word-input');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const modeIndicator = document.getElementById('mode-indicator');

const btnEndless = document.getElementById('btn-endless');
const btnLevels = document.getElementById('btn-levels');
const btnBackToMain = document.getElementById('btn-back-to-main');
const btnRestart = document.getElementById('restart-btn');
const btnToLvlSelect = document.getElementById('btn-to-lvl-select');
const btnAbort = document.getElementById('menu-btn-abort');
const virtualKeyboard = document.getElementById('virtual-keyboard');

// Game state variables
let gameMode = 'endless'; 
let currentLevel = 1;
let score = 0;
let wordsTyped = 0; 
let time = 10;
let currentWord = '';
let timerInterval;

// --- SCREEN NAVIGATION ---

btnEndless.addEventListener('click', () => {
    gameMode = 'endless';
    showScreen(gameScreen);
    startGame();
});

btnLevels.addEventListener('click', () => {
    showScreen(levelSelectMenu);
});

btnBackToMain.addEventListener('click', () => {
    showScreen(mainMenu);
});

btnAbort.addEventListener('click', () => {
    clearInterval(timerInterval);
    showScreen(mainMenu);
});

btnToLvlSelect.addEventListener('click', () => {
    clearInterval(timerInterval);
    showScreen(levelSelectMenu);
});

// Capture Level select buttons
document.querySelectorAll('.lvl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        gameMode = 'levels';
        currentLevel = parseInt(btn.getAttribute('data-level'));
        showScreen(gameScreen);
        startGame();
    });
});

function showScreen(screen) {
    mainMenu.classList.add('hidden');
    levelSelectMenu.classList.add('hidden');
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    screen.classList.remove('hidden');
}

// --- GAME LOGIC ---

function startGame() {
    score = 0;
    wordsTyped = 0;
    wordInput.value = '';
    wordInput.disabled = false;
    wordInput.focus();
    
    if (gameMode === 'endless') {
        time = 10;
        modeIndicator.innerText = "MODE: ENDLESS";
    } else {
        time = levelsConfig[currentLevel].timeLimit;
        modeIndicator.innerText = `MODE: L${currentLevel} (${wordsTyped}/${levelsConfig[currentLevel].targetWords})`;
    }

    scoreDisplay.innerText = score;
    timeDisplay.innerText = time;
    
    showNewWord();
    
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function showNewWord() {
    let activeList = (gameMode === 'endless') ? endlessWords : levelsConfig[currentLevel].wordPool;
    const randomIndex = Math.floor(Math.random() * activeList.length);
    currentWord = activeList[randomIndex];
    wordDisplay.innerText = currentWord;
}

function getEndlessMaxTime() {
    let reduction = Math.floor(wordsTyped / 15);
    let calculated = 10 - reduction;
    return (calculated < 3) ? 3 : calculated;
}

function checkMatch() {
    if (wordInput.value.trim().toLowerCase() === currentWord.toLowerCase()) {
        score += 10;
        wordsTyped += 1;
        scoreDisplay.innerText = score;
        
        wordInput.value = '';

        if (gameMode === 'endless') {
            time = getEndlessMaxTime();
            timeDisplay.innerText = time;
            showNewWord();
        } else {
            const target = levelsConfig[currentLevel].targetWords;
            modeIndicator.innerText = `MODE: L${currentLevel} (${wordsTyped}/${target})`;
            
            if (wordsTyped >= target) {
                clearInterval(timerInterval);
                endGame(true);
            } else {
                time = levelsConfig[currentLevel].timeLimit;
                timeDisplay.innerText = time;
                showNewWord();
            }
        }
    }
}

// Track inputs
wordInput.addEventListener('input', checkMatch);

// Track virtual keyboard keys
virtualKeyboard.addEventListener('click', (e) => {
    if (!e.target.classList.contains('key')) return;
    if (time <= 0) return;

    const keyVal = e.target.innerText;

    if (keyVal === '⌫') {
        wordInput.value = wordInput.value.slice(0, -1);
    } else if (keyVal === 'SPACE') {
        wordInput.value += ' ';
    } else {
        wordInput.value += keyVal.toLowerCase();
    }

    wordInput.focus();
    checkMatch(); 
});

function updateTimer() {
    time--;
    timeDisplay.innerText = time;
    if (time <= 0) {
        clearInterval(timerInterval);
        endGame(false);
    }
}

function endGame(victory) {
    wordInput.disabled = true;
    gameOverScreen.classList.remove('hidden');

    if (gameMode === 'levels') {
        btnToLvlSelect.classList.remove('hidden');
    } else {
        btnToLvlSelect.classList.add('hidden');
    }

    if (victory) {
        gameOverTitle.innerText = "ACCESS GRANTED";
        gameOverTitle.style.color = "#00ff66";
        gameOverSub.innerText = `Sector L${currentLevel} hacked successfully!`;
        btnRestart.innerText = "Hack Again";
    } else {
        gameOverTitle.innerText = "SYSTEM LOCKED";
        gameOverTitle.style.color = "#ff0055";
        gameOverSub.innerText = "Connection traced.";
        btnRestart.innerText = "Retry Hack";
    }
}

btnRestart.addEventListener('click', () => {
    showScreen(gameScreen);
    startGame();
});

showScreen(mainMenu);








