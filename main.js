/**
 * TaskMaster Pro Logic
 * Handles state management, local storage, and DOM manipulation.
 */

// Initialize state from LocalStorage
let tasks = JSON.parse(localStorage.getItem('portfolio_tasks')) || [];
let currentFilter = 'all';

// DOM Elements
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const dateDisplay = document.getElementById('date-display');
const completionPct = document.getElementById('completion-pct');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');

// 1. Initialize Application
function init() {
    // Set Current Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateDisplay.innerText = new Date().toLocaleDateString('en-US', options);

    // Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            setFilter(filter);
        });
    });

    render();
}

// 2. Core Actions
function addTask() {
    const text = taskInput.value.trim();
    if (text) {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date()
        };
        tasks.unshift(newTask);
        taskInput.value = '';
        saveAndRender();
    }
}

function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveAndRender();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update UI active state for filter buttons
    filterBtns.forEach(btn => {
        const isActive = btn.getAttribute('data-filter') === filter;
        btn.className = `filter-btn text-sm font-bold pb-1 transition-all ${
            isActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-indigo-600'
        }`;
    });

    render();
}

// 3. Storage & Rendering
function saveAndRender() {
    localStorage.setItem('portfolio_tasks', JSON.stringify(tasks));
    render();
}

function render() {
    // Filter tasks based on current view
    let filtered = tasks;
    if (currentFilter === 'active') filtered = tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);

    // Toggle Empty State
    if (filtered.length === 0) {
        taskList.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        taskList.innerHTML = filtered.map(task => `
            <div class="task-item glass-morphism rounded-2xl p-4 shadow-sm flex items-center gap-4">
                <div onclick="toggleTask(${task.id})" class="custom-checkbox ${task.completed ? 'checked' : ''}">
                    ${task.completed ? '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
                </div>
                <span class="flex-1 text-gray-700 font-medium ${task.completed ? 'completed-text' : ''}">
                    ${task.text}
                </span>
                <button onclick="deleteTask(${task.id})" class="text-gray-300 hover:text-red-500 transition-colors p-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    // Update Progress Indicator
    const completedCount = tasks.filter(t => t.completed).length;
    const pct = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
    completionPct.innerText = pct + '%';
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

// Expose functions to global scope for HTML onclick handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;