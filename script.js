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
        
        // Arabic numbers
        this.arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        
        this.currentSentence = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.isGameActive = false;
        this.errors = 0;
        this.timer = null;
        
        // Game state
        this.currentLevel = 1;
        this.currentStreak = 0;
        this.totalCharactersTyped = 0;
        this.correctCharacters = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboard();
        this.generateNewSentence();
        this.loadGameState();
    }
    
    initializeElements() {
        this.textDisplay = document.getElementById('textDisplay');
        this.userInput = document.getElementById('userInput');
        this.accuracy = document.getElementById('accuracy');
        this.wpm = document.getElementById('wpm');
        this.streakElement = document.getElementById('streak');
        this.levelElement = document.getElementById('level');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.achievements = document.getElementById('achievements');
        this.newSentenceBtn = document.getElementById('newSentence');
        this.skipSentenceBtn = document.getElementById('skipSentence');
        this.resetBtn = document.getElementById('reset');
        this.toggleKeyboardBtn = document.getElementById('toggleKeyboard');
        this.toggleArabicLettersBtn = document.getElementById('toggleArabicLetters');
        this.arabicKeyboard = document.getElementById('arabicKeyboard');
        this.keyboardSection = document.getElementById('keyboardSection');
    }
    
    setupEventListeners() {
        this.userInput.addEventListener('input', () => this.handleInput());
        this.userInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.newSentenceBtn.addEventListener('click', () => this.generateNewSentence());
        this.skipSentenceBtn.addEventListener('click', () => this.skipSentence());
        this.resetBtn.addEventListener('click', () => this.resetGameState());
        this.toggleKeyboardBtn.addEventListener('click', () => this.toggleKeyboard());
        this.toggleArabicLettersBtn.addEventListener('click', () => this.toggleArabicLetters());
    }
    
    setupKeyboard() {
        // Setup key mapping for English to Arabic conversion
        this.keyMapping = {
            '`': 'ذ', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥',
            '6': '٦', '7': '٧', '8': '٨', '9': '٩', '0': '٠', '-': '-', '=': '=',
            'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف',
            'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح',
            '[': 'ج', ']': 'د', '\\': '\\',
            'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل',
            'h': 'ا', 'j': 'ت', 'k': 'ن', 'l': 'م', ';': 'ك', "'": 'ط',
            'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا',
            'n': 'ى', 'm': 'ة', ',': 'و', '.': 'ز', '/': 'ظ',
            ' ': ' '
        };

        // Setup click handlers for all keyboard keys
        const keys = this.arabicKeyboard.querySelectorAll('.key[data-arabic]');
        keys.forEach(key => {
            key.addEventListener('click', () => {
                const arabicChar = key.getAttribute('data-arabic');
                if (arabicChar) {
                    this.typeCharacter(arabicChar);
                }
            });
        });

        // Setup special key handlers
        const backspaceKey = document.getElementById('backspace');
        if (backspaceKey) {
            backspaceKey.addEventListener('click', () => {
                this.handleBackspace();
            });
        }

        const enterKey = document.getElementById('enter');
        if (enterKey) {
            enterKey.addEventListener('click', () => {
                this.handleEnter();
            });
        }

        // Setup physical keyboard handling
        document.addEventListener('keydown', (e) => this.handlePhysicalKeyDown(e));
    }
    
    typeCharacter(char) {
        // Insert character at current cursor position
        const input = this.userInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const currentValue = input.value;
        
        input.value = currentValue.substring(0, start) + char + currentValue.substring(end);
        input.selectionStart = input.selectionEnd = start + char.length;
        input.focus();
        
        // Trigger input event to update the game state
        input.dispatchEvent(new Event('input'));
    }
    
    handleBackspace() {
        const input = this.userInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const currentValue = input.value;
        
        if (start === end && start > 0) {
            // Delete one character before cursor
            input.value = currentValue.substring(0, start - 1) + currentValue.substring(start);
            input.selectionStart = input.selectionEnd = start - 1;
        } else if (start !== end) {
            // Delete selected text
            input.value = currentValue.substring(0, start) + currentValue.substring(end);
            input.selectionStart = input.selectionEnd = start;
        }
        
        input.focus();
        input.dispatchEvent(new Event('input'));
    }
    
    handleEnter() {
        // Check if current sentence is complete
        if (this.userInput.value === this.currentSentence) {
            this.completeSentence();
        } else {
            // Generate new sentence
            this.generateNewSentence();
        }
    }
    
    handlePhysicalKeyDown(e) {
        // Auto-convert English keyboard input to Arabic
        if (this.keyMapping && !e.ctrlKey && !e.altKey && !e.metaKey) {
            let keyToMap = e.key.toLowerCase();
            
            // Handle special cases
            if (keyToMap === ' ') {
                keyToMap = ' ';
            }
            
            const arabicChar = this.keyMapping[keyToMap];
            
            if (arabicChar && keyToMap !== 'backspace' && keyToMap !== 'enter') {
                e.preventDefault();
                this.typeCharacter(arabicChar);
                this.highlightKey(keyToMap);
                return;
            }
        }
        
        // Handle special keys
        if (e.key === 'Backspace') {
            // Let the default backspace behavior happen, but also highlight the key
            this.highlightKey('backspace');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this.handleEnter();
            this.highlightKey('enter');
        }
    }
    
    highlightKey(keyValue) {
        // Remove previous highlighting
        const allKeys = this.arabicKeyboard.querySelectorAll('.key');
        allKeys.forEach(key => key.classList.remove('active'));
        
        // Find and highlight the corresponding key
        let targetKey = null;
        
        if (keyValue === 'backspace') {
            targetKey = document.getElementById('backspace');
        } else if (keyValue === 'enter') {
            targetKey = document.getElementById('enter');
        } else {
            targetKey = this.arabicKeyboard.querySelector(`[data-key="${keyValue}"]`);
        }
        
        if (targetKey) {
            targetKey.classList.add('active');
            // Remove highlighting after a short delay
            setTimeout(() => {
                targetKey.classList.remove('active');
            }, 200);
        }
    }
    
    highlightNextKey() {
        // Remove previous highlighting
        const allKeys = this.arabicKeyboard.querySelectorAll('.key');
        allKeys.forEach(key => key.classList.remove('active'));
        
        // Highlight the next key to press
        if (this.currentIndex < this.currentSentence.length) {
            const nextChar = this.currentSentence[this.currentIndex];
            
            // Find the English key that maps to this Arabic character
            let englishKey = Object.keys(this.keyMapping).find(key => this.keyMapping[key] === nextChar);
            
            if (englishKey) {
                const targetKey = this.arabicKeyboard.querySelector(`[data-key="${englishKey}"]`);
                if (targetKey) {
                    targetKey.classList.add('active');
                }
            }
        }
    }
    
    
    
    
    
    
    generateNewSentence() {
        this.currentSentence = this.createRandomSentence();
        this.resetCurrentSession();
        this.displayText();
    }
    
    createRandomSentence() {
        const sentenceLength = Math.floor(Math.random() * 8) + 10; // 10-17 words for longer sentences
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
    
    generateNumberWord() {
        // Generate a number with 1-3 digits
        const digits = Math.floor(Math.random() * 3) + 1;
        let numberWord = '';
        
        for (let i = 0; i < digits; i++) {
            const digit = Math.floor(Math.random() * 10);
            numberWord += this.arabicNumbers[digit];
        }
        
        return numberWord;
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
        
        // Highlight the first key
        this.highlightNextKey();
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
        
        // Highlight the next key
        this.highlightNextKey();
        
        if (inputValue === this.currentSentence) {
            this.completeSentence();
        }
    }
    
    handleKeyDown(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            this.generateNewSentence();
            return;
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
        // Don't regenerate the entire display - just update the current letter position
        const letters = this.textDisplay.querySelectorAll('.letter');
        letters.forEach((letter, index) => {
            if (index === this.currentIndex) {
                letter.classList.add('current');
            } else {
                letter.classList.remove('current');
            }
        });
    }
    
    startGame() {
        this.isGameActive = true;
        this.startTime = Date.now();
        this.timer = setInterval(() => this.updateTimer(), 100);
    }
    
    updateTimer() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        // Timer display not implemented yet - can be added later
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
        this.levelElement.textContent = this.currentLevel;
        this.streakElement.textContent = this.currentStreak;
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
    
    toggleKeyboard() {
        const keyboard = this.arabicKeyboard;
        const isHidden = keyboard.style.display === 'none';
        
        if (isHidden) {
            keyboard.style.display = 'flex';
            this.toggleKeyboardBtn.textContent = 'Hide';
        } else {
            keyboard.style.display = 'none';
            this.toggleKeyboardBtn.textContent = 'Show';
        }
    }
    
    toggleArabicLetters() {
        const arabicKeys = this.arabicKeyboard.querySelectorAll('.key[data-arabic]');
        const isHidden = arabicKeys[0]?.style.color === 'transparent';
        
        arabicKeys.forEach(key => {
            if (isHidden) {
                key.style.color = '#007bff';
                this.toggleArabicLettersBtn.textContent = 'Hide Arabic';
            } else {
                key.style.color = 'transparent';
                this.toggleArabicLettersBtn.textContent = 'Show Arabic';
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArabicTypingGame();
});