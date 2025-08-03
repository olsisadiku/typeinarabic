class ArabicTypingGame {
    constructor() {
        this.sentences = [
            "مرحبا بكم في موقعنا الجميل",
            "أهلا وسهلا بك في عالم البرمجة",
            "تعلم الكتابة باللغة العربية أمر ممتع",
            "الممارسة تجعل الإنسان مثاليا",
            "القراءة والكتابة مهارتان مهمتان",
            "التكنولوجيا تساعدنا في التعلم",
            "الصبر والمثابرة يؤديان إلى النجاح",
            "العلم نور والجهل ظلام",
            "الوقت من ذهب فلا تضيعه",
            "التعاون يحقق أهدافا عظيمة",
            "الأمل يضيء طريق المستقبل",
            "الإبداع يولد من التفكير العميق",
            "المعرفة قوة حقيقية في هذا العصر",
            "السعادة تأتي من العمل الجاد",
            "الحياة رحلة جميلة مليئة بالتحديات"
        ];
        
        this.currentSentence = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.isGameActive = false;
        this.errors = 0;
        this.timer = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateNewSentence();
    }
    
    initializeElements() {
        this.textDisplay = document.getElementById('textDisplay');
        this.userInput = document.getElementById('userInput');
        this.accuracy = document.getElementById('accuracy');
        this.wpm = document.getElementById('wpm');
        this.timerDisplay = document.getElementById('timer');
        this.newSentenceBtn = document.getElementById('newSentence');
        this.resetBtn = document.getElementById('reset');
    }
    
    setupEventListeners() {
        this.userInput.addEventListener('input', () => this.handleInput());
        this.userInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.newSentenceBtn.addEventListener('click', () => this.generateNewSentence());
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    generateNewSentence() {
        const randomIndex = Math.floor(Math.random() * this.sentences.length);
        this.currentSentence = this.sentences[randomIndex];
        this.resetGame();
        this.displayText();
    }
    
    displayText() {
        this.textDisplay.innerHTML = '';
        
        for (let i = 0; i < this.currentSentence.length; i++) {
            const span = document.createElement('span');
            span.textContent = this.currentSentence[i];
            span.className = 'letter';
            
            if (i === this.currentIndex) {
                span.classList.add('current');
            }
            
            this.textDisplay.appendChild(span);
        }
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
            this.completeGame();
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
            letter.className = 'letter';
            
            if (i < inputValue.length) {
                if (inputValue[i] === this.currentSentence[i]) {
                    letter.classList.add('correct');
                } else {
                    letter.classList.add('incorrect');
                    this.errors++;
                }
            } else if (i === inputValue.length) {
                letter.classList.add('current');
            }
        }
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
    
    completeGame() {
        this.isGameActive = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        setTimeout(() => {
            alert('أحسنت! لقد أكملت الجملة بنجاح!');
        }, 500);
    }
    
    resetGame() {
        this.isGameActive = false;
        this.currentIndex = 0;
        this.startTime = null;
        this.errors = 0;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.userInput.value = '';
        this.accuracy.textContent = '100%';
        this.wpm.textContent = '0';
        this.timerDisplay.textContent = '0s';
        
        this.displayText();
        this.userInput.focus();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ArabicTypingGame();
});