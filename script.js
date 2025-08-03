class ArabicTypingGame {
    constructor() {
        // Arabic letters grouped by difficulty and frequency
        this.arabicLetters = {
            basic: ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش'],
            intermediate: ['ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن'],
            advanced: ['ه', 'و', 'ي', 'ء', 'ة', 'ى', 'آ', 'أ', 'إ', 'ؤ', 'ئ']
        };
        
        // Common Arabic word patterns
        this.wordPatterns = [
            ['ك', 'ت', 'ا', 'ب'], // كتاب
            ['ب', 'ي', 'ت'], // بيت
            ['م', 'د', 'ر', 'س', 'ة'], // مدرسة
            ['و', 'ق', 'ت'], // وقت
            ['ص', 'ب', 'ا', 'ح'], // صباح
            ['م', 'س', 'ا', 'ء'], // مساء
            ['ج', 'م', 'ي', 'ل'], // جميل
            ['ك', 'ب', 'ي', 'ر'], // كبير
            ['ص', 'غ', 'ي', 'ر'], // صغير
            ['س', 'ر', 'ي', 'ع'], // سريع
        ];
        
        this.currentSentence = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.isGameActive = false;
        this.errors = 0;
        this.timer = null;
        
        // Game state
        this.level = 1;
        this.streak = 0;
        this.totalCharactersTyped = 0;
        this.correctCharacters = 0;
        this.achievements = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateNewSentence();
        this.loadGameState();
    }
    
    initializeElements() {
        this.textDisplay = document.getElementById('textDisplay');
        this.userInput = document.getElementById('userInput');
        this.accuracy = document.getElementById('accuracy');
        this.wpm = document.getElementById('wpm');
        this.streak = document.getElementById('streak');
        this.level = document.getElementById('level');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.achievements = document.getElementById('achievements');
        this.newSentenceBtn = document.getElementById('newSentence');
        this.skipSentenceBtn = document.getElementById('skipSentence');
        this.resetBtn = document.getElementById('reset');
    }
    
    setupEventListeners() {
        this.userInput.addEventListener('input', () => this.handleInput());
        this.userInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.newSentenceBtn.addEventListener('click', () => this.generateNewSentence());
        this.skipSentenceBtn.addEventListener('click', () => this.skipSentence());
        this.resetBtn.addEventListener('click', () => this.resetGameState());
    }
    
    generateNewSentence() {
        this.currentSentence = this.createRandomSentence();
        this.resetCurrentSession();
        this.displayText();
    }
    
    createRandomSentence() {
        const sentenceLength = Math.floor(Math.random() * 3) + 3; // 3-5 words
        const words = [];
        
        for (let i = 0; i < sentenceLength; i++) {
            words.push(this.generateWord());
        }
        
        return words.join(' ');
    }
    
    generateWord() {
        const wordLength = Math.floor(Math.random() * 4) + 2; // 2-5 letters
        let availableLetters = [];
        
        // Choose letters based on current level
        if (this.currentLevel <= 3) {
            availableLetters = this.arabicLetters.basic;
        } else if (this.currentLevel <= 6) {
            availableLetters = [...this.arabicLetters.basic, ...this.arabicLetters.intermediate];
        } else {
            availableLetters = [...this.arabicLetters.basic, ...this.arabicLetters.intermediate, ...this.arabicLetters.advanced];
        }
        
        // 30% chance to use a predefined word pattern
        if (Math.random() < 0.3 && this.wordPatterns.length > 0) {
            const pattern = this.wordPatterns[Math.floor(Math.random() * this.wordPatterns.length)];
            return pattern.join('');
        }
        
        // Generate random word
        let word = '';
        for (let i = 0; i < wordLength; i++) {
            const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
            word += letter;
        }
        
        return word;
    }
    
    displayText() {
        this.textDisplay.innerHTML = '';
        const words = this.currentSentence.split(' ');
        let globalIndex = 0;
        
        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            
            for (let i = 0; i < word.length; i++) {
                const letterSpan = document.createElement('span');
                letterSpan.textContent = word[i];
                letterSpan.className = 'letter';
                letterSpan.dataset.index = globalIndex;
                
                if (globalIndex === this.currentIndex) {
                    letterSpan.classList.add('current');
                }
                
                wordSpan.appendChild(letterSpan);
                globalIndex++;
            }
            
            this.textDisplay.appendChild(wordSpan);
            
            // Add space after each word except the last
            if (wordIndex < words.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.textContent = ' ';
                spaceSpan.className = 'letter space';
                spaceSpan.dataset.index = globalIndex;
                
                if (globalIndex === this.currentIndex) {
                    spaceSpan.classList.add('current');
                }
                
                this.textDisplay.appendChild(spaceSpan);
                globalIndex++;
            }
        });
    }
    
    handleInput() {
        const inputValue = this.userInput.value;
        
        if (!this.isGameActive && inputValue.length > 0) {
            this.startGame();
        }
        
        this.currentIndex = inputValue.length;
        this.checkInput(inputValue);
        this.updateDisplay();
        this.updateStats();
        
        if (inputValue === this.currentSentence) {
            this.completeSentence();
        }
    }
    
    handleKeyDown(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            this.generateNewSentence();
        }
    }
    
    checkInput(inputValue) {
        const letters = this.textDisplay.querySelectorAll('.letter');
        this.errors = 0;
        
        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i];
            const baseClass = letter.classList.contains('space') ? 'letter space' : 'letter';
            letter.className = baseClass;
            
            if (i < inputValue.length) {
                if (inputValue[i] === this.currentSentence[i]) {
                    letter.classList.add('correct');
                    if (i === inputValue.length - 1) {
                        this.correctCharacters++;
                    }
                } else {
                    letter.classList.add('incorrect');
                    this.errors++;
                }
            } else if (i === inputValue.length) {
                letter.classList.add('current');
            }
        }
        
        this.totalCharactersTyped = inputValue.length;
    }
    
    updateDisplay() {
        this.displayText();
    }
    
    startGame() {
        this.isGameActive = true;
        this.startTime = Date.now();
        this.timer = setInterval(() => this.updateTimer(), 100);
    }
    
    updateTimer() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        this.timerDisplay.textContent = `${elapsed.toFixed(1)}s`;
    }
    
    updateStats() {
        if (!this.isGameActive) return;
        
        const inputLength = this.userInput.value.length;
        const accuracy = inputLength > 0 ? Math.round(((inputLength - this.errors) / inputLength) * 100) : 100;
        this.accuracy.textContent = `${accuracy}%`;
        
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // in minutes
        const wordsTyped = inputLength / 5; // assuming average word length of 5 characters
        const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        this.wpm.textContent = wpm.toString();
    }
    
    completeSentence() {
        this.isGameActive = false;
        
        // Calculate accuracy for this sentence
        const sentenceAccuracy = this.errors === 0 ? 100 : Math.round(((this.currentSentence.length - this.errors) / this.currentSentence.length) * 100);
        
        if (sentenceAccuracy >= 90) {
            this.currentStreak++;
            this.checkAchievements();
        } else {
            this.currentStreak = 0;
        }
        
        this.updateLevel();
        this.saveGameState();
        
        // Auto-generate new sentence after a brief delay
        setTimeout(() => {
            this.generateNewSentence();
        }, 1000);
    }
    
    skipSentence() {
        this.currentStreak = 0;
        this.generateNewSentence();
    }
    
    updateLevel() {
        const charactersNeededForNextLevel = this.currentLevel * 100;
        
        if (this.correctCharacters >= charactersNeededForNextLevel) {
            this.currentLevel++;
            this.showAchievement(`Level Up! Reached Level ${this.currentLevel}`);
            this.correctCharacters = 0; // Reset for next level
        }
        
        this.updateProgressDisplay();
    }
    
    updateProgressDisplay() {
        const charactersNeeded = this.currentLevel * 100;
        const progress = (this.correctCharacters / charactersNeeded) * 100;
        
        this.progressFill.style.width = `${Math.min(progress, 100)}%`;
        this.progressText.textContent = `${this.correctCharacters} / ${charactersNeeded} characters`;
        this.level.textContent = this.currentLevel;
        this.streak.textContent = this.currentStreak;
    }
    
    checkAchievements() {
        const achievements = [
            { threshold: 5, message: "🔥 5 Sentence Streak!" },
            { threshold: 10, message: "💪 10 Sentence Streak!" },
            { threshold: 25, message: "🏆 25 Sentence Streak - You're on fire!" },
            { threshold: 50, message: "🎯 50 Sentence Streak - Master Typist!" },
            { threshold: 100, message: "👑 100 Sentence Streak - Legendary!" }
        ];
        
        achievements.forEach(achievement => {
            if (this.currentStreak === achievement.threshold) {
                this.showAchievement(achievement.message);
            }
        });
    }
    
    showAchievement(message) {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'achievement';
        achievementDiv.textContent = message;
        
        this.achievements.appendChild(achievementDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (achievementDiv.parentNode) {
                achievementDiv.parentNode.removeChild(achievementDiv);
            }
        }, 3000);
    }
    
    resetCurrentSession() {
        this.isGameActive = false;
        this.currentIndex = 0;
        this.startTime = null;
        this.errors = 0;
        
        this.userInput.value = '';
        this.displayText();
        this.userInput.focus();
    }
    
    resetGameState() {
        this.currentLevel = 1;
        this.currentStreak = 0;
        this.correctCharacters = 0;
        this.totalCharactersTyped = 0;
        
        this.resetCurrentSession();
        this.updateProgressDisplay();
        this.saveGameState();
        
        // Clear achievements
        this.achievements.innerHTML = '';
    }
    
    saveGameState() {
        const gameState = {
            level: this.currentLevel,
            streak: this.currentStreak,
            correctCharacters: this.correctCharacters,
            totalCharactersTyped: this.totalCharactersTyped
        };
        
        localStorage.setItem('arabicTypingGame', JSON.stringify(gameState));
    }
    
    loadGameState() {
        const savedState = localStorage.getItem('arabicTypingGame');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            this.currentLevel = gameState.level || 1;
            this.currentStreak = gameState.streak || 0;
            this.correctCharacters = gameState.correctCharacters || 0;
            this.totalCharactersTyped = gameState.totalCharactersTyped || 0;
        }
        
        this.updateProgressDisplay();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArabicTypingGame();
});