// Task Management
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.taskForm = document.getElementById('taskForm');
        this.taskList = document.getElementById('taskList');
        this.setupEventListeners();
        this.renderTasks();
        this.updateProgress();
    }

    setupEventListeners() {
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
    }

    addTask() {
        const titleInput = document.getElementById('taskTitle');
        const deadlineInput = document.getElementById('taskDeadline');
        const categoryInput = document.getElementById('taskCategory');

        if (!titleInput.value.trim()) {
            this.showError(titleInput, 'Task title is required');
            return;
        }

        const task = {
            id: Date.now(),
            title: titleInput.value,
            deadline: deadlineInput.value,
            category: categoryInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateProgress();

        // Reset form
        titleInput.value = '';
        deadlineInput.value = '';
        categoryInput.value = 'work';
    }

    showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateProgress();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateProgress();
    }

    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showError(this.taskForm, 'Failed to save tasks');
        }
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        this.tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item flex items-center justify-between p-4 bg-gray-50 rounded-lg ${task.completed ? 'bg-green-50' : ''}`;
            
            taskElement.innerHTML = `
                <div class="flex items-center gap-4">
                    <input type="checkbox" 
                           ${task.completed ? 'checked' : ''} 
                           class="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500">
                    <div>
                        <p class="font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${task.title}</p>
                        <p class="text-sm text-gray-500">
                            <i class="fas fa-calendar-alt"></i> ${new Date(task.deadline).toLocaleString()}
                            <span class="ml-2"><i class="fas fa-tag"></i> ${task.category}</span>
                        </p>
                    </div>
                </div>
                <button class="text-red-500 hover:text-red-600">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            const checkbox = taskElement.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => this.toggleTask(task.id));

            const deleteBtn = taskElement.querySelector('button');
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            this.taskList.appendChild(taskElement);
        });
    }

    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const progressBar = document.getElementById('progressBar');
        const tasksCompletedElement = document.getElementById('tasksCompleted');
        const currentStreakElement = document.getElementById('currentStreak');

        // Update progress bar
        const percentage = total === 0 ? 0 : (completed / total) * 100;
        progressBar.style.width = `${percentage}%`;

        // Update tasks completed
        tasksCompletedElement.textContent = completed;

        // Calculate streak
        const streak = this.calculateStreak();
        currentStreakElement.textContent = streak;
        
        // Add animation if streak increased
        if (streak > parseInt(currentStreakElement.dataset.lastStreak || '0')) {
            currentStreakElement.classList.add('streak-update');
            setTimeout(() => currentStreakElement.classList.remove('streak-update'), 500);
        }
        currentStreakElement.dataset.lastStreak = streak;
    }

    calculateStreak() {
        const today = new Date().setHours(0, 0, 0, 0);
        let streak = 0;
        let currentDate = today;

        while (true) {
            const tasksForDay = this.tasks.filter(task => {
                const taskDate = new Date(task.createdAt).setHours(0, 0, 0, 0);
                return taskDate === currentDate && task.completed;
            });

            if (tasksForDay.length === 0) break;
            
            streak++;
            currentDate -= 86400000; // Subtract one day in milliseconds
        }

        return streak;
    }
}

// Focus Mode Timer
class FocusTimer {
    constructor() {
        this.minutes = 25;
        this.seconds = 0;
        this.isRunning = false;
        this.interval = null;
        
        this.timerDisplay = document.getElementById('timer');
        this.startButton = document.getElementById('startTimer');
        this.pauseButton = document.getElementById('pauseTimer');
        this.resetButton = document.getElementById('resetTimer');
        
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.start());
        this.pauseButton.addEventListener('click', () => this.pause());
        this.resetButton.addEventListener('click', () => this.reset());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startButton.disabled = true;
            this.pauseButton.disabled = false;
            this.startButton.classList.add('opacity-50', 'cursor-not-allowed');
            this.pauseButton.classList.remove('opacity-50', 'cursor-not-allowed');
            
            this.interval = setInterval(() => {
                if (this.seconds === 0) {
                    if (this.minutes === 0) {
                        this.complete();
                        return;
                    }
                    this.minutes--;
                    this.seconds = 59;
                } else {
                    this.seconds--;
                }
                this.updateDisplay();
            }, 1000);
        }
    }

    pause() {
        this.isRunning = false;
        this.startButton.disabled = false;
        this.pauseButton.disabled = true;
        this.startButton.classList.remove('opacity-50', 'cursor-not-allowed');
        this.pauseButton.classList.add('opacity-50', 'cursor-not-allowed');
        clearInterval(this.interval);
    }

    reset() {
        this.pause();
        this.minutes = 25;
        this.seconds = 0;
        this.updateDisplay();
    }

    complete() {
        this.pause();
        this.reset();
        // Show notification
        if (Notification.permission === "granted") {
            new Notification("Focus Session Complete!", {
                body: "Great job! Take a short break.",
                icon: "https://example.com/icon.png"
            });
        }
    }

    updateDisplay() {
        this.timerDisplay.textContent = 
            `${String(this.minutes).padStart(2, '0')}:${String(this.seconds).padStart(2, '0')}`;
    }
}

// Motivational Quotes
class QuoteManager {
    constructor() {
        this.quotes = [
            "The only way to do great work is to love what you do.",
            "Don't watch the clock; do what it does. Keep going.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "The future depends on what you do today.",
            "Your time is limited, don't waste it living someone else's life.",
            "The best way to predict the future is to create it.",
            "Don't let yesterday take up too much of today.",
            "The only limit to our realization of tomorrow will be our doubts of today.",
            "Do what you can, with what you have, where you are.",
            "Success is walking from failure to failure with no loss of enthusiasm."
        ];
        
        this.quoteElement = document.getElementById('quote');
        this.newQuoteButton = document.getElementById('newQuote');
        
        this.setupEventListeners();
        this.showRandomQuote();
    }

    setupEventListeners() {
        this.newQuoteButton.addEventListener('click', () => this.showRandomQuote());
    }

    showRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        this.quoteElement.classList.remove('quote-transition');
        this.quoteElement.offsetHeight; // Force reflow
        this.quoteElement.classList.add('quote-transition');
        this.quoteElement.textContent = `"${this.quotes[randomIndex]}"`;
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.error('ServiceWorker registration failed:', err);
            });
    });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    const taskManager = new TaskManager();
    const focusTimer = new FocusTimer();
    const quoteManager = new QuoteManager();

    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission();
    }
});