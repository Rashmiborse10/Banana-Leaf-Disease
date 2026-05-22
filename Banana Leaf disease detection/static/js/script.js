// Navigation
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
    
    // Close mobile menu if open
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Handle hash changes for direct links
window.addEventListener('hashchange', () => {
    const pageId = window.location.hash.substring(1);
    if (document.getElementById(pageId)) {
        showPage(pageId);
    }
});

// Initialize page based on hash
if (window.location.hash) {
    const pageId = window.location.hash.substring(1);
    if (document.getElementById(pageId)) {
        showPage(pageId);
    }
}

// Image Upload and Preview
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImage = document.getElementById('removeImage');
const predictBtn = document.getElementById('predictBtn');

uploadArea.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImg.src = event.target.result;
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
            predictBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
});

removeImage.addEventListener('click', (e) => {
    e.stopPropagation();
    imageInput.value = '';
    previewImg.src = '';
    uploadArea.style.display = 'flex';
    imagePreview.style.display = 'none';
    predictBtn.disabled = true;
});

// Test Connection
const testConnectionBtn = document.getElementById('testConnection');
const connectionStatus = document.getElementById('connectionStatus');

testConnectionBtn.addEventListener('click', () => {
    connectionStatus.innerHTML = '<i class="fas fa-circle"></i> Testing...';
    
    // Simulate connection test (replace with actual API call)
    setTimeout(() => {
        const isConnected = Math.random() > 0.3; // 70% chance of success for demo
        if (isConnected) {
            connectionStatus.innerHTML = '<i class="fas fa-circle"></i> Connected';
            connectionStatus.classList.add('connected');
            connectionStatus.classList.remove('disconnected');
        } else {
            connectionStatus.innerHTML = '<i class="fas fa-circle"></i> Disconnected';
            connectionStatus.classList.add('disconnected');
            connectionStatus.classList.remove('connected');
        }
    }, 1000);
});

// Prediction
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const resultsContent = document.getElementById('resultsContent');
const diseaseName = document.getElementById('diseaseName');
const confidence = document.getElementById('confidence');
const causesSection = document.getElementById('causesSection');
const causesText = document.getElementById('causesText');
const preventionSection = document.getElementById('preventionSection');
const preventionText = document.getElementById('preventionText');
const resetBtn = document.getElementById('resetBtn');

predictBtn.addEventListener('click', () => {
    if (!imageInput.files[0]) {
        showError('Please select an image first');
        return;
    }
    
    // Show loading state
    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';
    resultsContent.style.display = 'none';
    errorMessage.style.display = 'none';
    
    // Simulate API call (replace with actual fetch to your Flask backend)
    setTimeout(() => {
        // Random result for demo
        const diseases = ['Healthy', 'Sigatoka', 'Xanthomonas'];
        const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
        const randomConfidence = (Math.random() * 50 + 50).toFixed(2); // 50-100%
        
        // Hide loading state
        loadingState.style.display = 'none';
        
        // Check if connection failed (20% chance for demo)
        if (Math.random() < 0.2) {
            showError('Failed to connect to the backend. Please ensure your Flask server is running on http://localhost:5000');
            return;
        }
        
        // Show results
        diseaseName.textContent = randomDisease;
        confidence.textContent = `Confidence: ${randomConfidence}%`;
        
        // Set disease info based on random result
        if (randomDisease === 'Healthy') {
            causesText.textContent = 'Plant appears healthy with no visible disease symptoms';
            preventionText.textContent = 'Continue good plant care practices, regular monitoring, proper watering, adequate nutrition, preventive treatments';
        } else if (randomDisease === 'Sigatoka') {
            causesText.textContent = 'High humidity, poor plant hygiene, dense planting, inadequate drainage, fungal spores spread by wind and rain';
            preventionText.textContent = 'Improve drainage systems, increase plant spacing, apply fungicide treatments, remove infected leaves immediately, maintain proper plant nutrition';
        } else {
            causesText.textContent = 'Bacterial infection, warm humid weather, plant wounds, contaminated tools, infected seeds or planting materials';
            preventionText.textContent = 'Use disease-free seeds, sanitize tools between plants, apply copper-based bactericides, improve plant nutrition, avoid working with wet plants';
        }
        
        causesSection.style.display = 'block';
        preventionSection.style.display = 'block';
        resultsContent.style.display = 'block';
        
        // Save to history
        saveToHistory(imageInput.files[0].name, randomDisease, randomConfidence);
    }, 2000);
});

resetBtn.addEventListener('click', () => {
    imageInput.value = '';
    previewImg.src = '';
    uploadArea.style.display = 'flex';
    imagePreview.style.display = 'none';
    predictBtn.disabled = true;
    loadingState.style.display = 'none';
    emptyState.style.display = 'flex';
    resultsContent.style.display = 'none';
    errorMessage.style.display = 'none';
});

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
}

// History Management
const historySearch = document.getElementById('historySearch');
const historyList = document.getElementById('historyList');
const exportHistoryBtn = document.getElementById('exportHistory');
const clearHistoryBtn = document.getElementById('clearHistory');
const emptyHistory = document.getElementById('emptyHistory');
const historyStats = document.getElementById('historyStats');
const healthyCount = document.getElementById('healthyCount');
const sigatokaCount = document.getElementById('sigatokaCount');
const xanthomonasCount = document.getElementById('xanthomonasCount');
const avgConfidence = document.getElementById('avgConfidence');

// Load history on page load
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

function saveToHistory(filename, disease, confidence) {
    let history = JSON.parse(localStorage.getItem('detectionHistory') || '[]');
    
    const newItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        filename: filename,
        result: {
            disease: disease,
            confidence: confidence + '%',
            causes: disease === 'Healthy' ? 'Plant appears healthy with no visible disease symptoms' : 
                   disease === 'Sigatoka' ? 'High humidity, poor plant hygiene, dense planting, inadequate drainage, fungal spores spread by wind and rain' : 
                   'Bacterial infection, warm humid weather, plant wounds, contaminated tools, infected seeds or planting materials',
            prevention: disease === 'Healthy' ? 'Continue good plant care practices, regular monitoring, proper watering, adequate nutrition, preventive treatments' : 
                       disease === 'Sigatoka' ? 'Improve drainage systems, increase plant spacing, apply fungicide treatments, remove infected leaves immediately, maintain proper plant nutrition' : 
                       'Use disease-free seeds, sanitize tools between plants, apply copper-based bactericides, improve plant nutrition, avoid working with wet plants'
        }
    };
    
    history.unshift(newItem);
    localStorage.setItem('detectionHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('detectionHistory') || '[]');
    
    if (history.length === 0) {
        emptyHistory.style.display = 'flex';
        historyList.innerHTML = '';
        historyStats.style.display = 'none';
        return;
    }
    
    emptyHistory.style.display = 'none';
    historyStats.style.display = 'block';
    
    // Filter based on search term
    const searchTerm = historySearch.value.toLowerCase();
    const filteredHistory = history.filter(item => 
        item.result.disease.toLowerCase().includes(searchTerm) || 
        item.filename.toLowerCase().includes(searchTerm)
    );
    
    // Update stats
    const healthy = history.filter(item => item.result.disease === 'Healthy').length;
    const sigatoka = history.filter(item => item.result.disease === 'Sigatoka').length;
    const xanthomonas = history.filter(item => item.result.disease === 'Xanthomonas').length;
    const totalConfidence = history.reduce((sum, item) => sum + parseFloat(item.result.confidence), 0);
    const averageConfidence = Math.round(totalConfidence / history.length);
    
    healthyCount.textContent = healthy;
    sigatokaCount.textContent = sigatoka;
    xanthomonasCount.textContent = xanthomonas;
    avgConfidence.textContent = averageConfidence + '%';
    
    // Render history
    historyList.innerHTML = '';
    filteredHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(item.timestamp).toLocaleString();
        
        historyItem.innerHTML = `
            <div class="history-item-header">
                <div>
                    <div class="history-item-title">${item.filename}</div>
                    <div class="history-item-date">${date}</div>
                </div>
                <div>
                    <span class="badge ${getDiseaseClass(item.result.disease)}">${item.result.disease}</span>
                    <button class="btn btn-icon btn-danger" onclick="deleteHistoryItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="history-item-content">
                <div class="history-item-detail">
                    <div class="detail-label">Confidence</div>
                    <div class="detail-value">${item.result.confidence}</div>
                </div>
                <div class="history-item-detail">
                    <div class="detail-label">Causes</div>
                    <div class="detail-value">${item.result.causes}</div>
                </div>
                <div class="history-item-detail">
                    <div class="detail-label">Prevention</div>
                    <div class="detail-value">${item.result.prevention}</div>
                </div>
            </div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

function getDiseaseClass(disease) {
    switch (disease.toLowerCase()) {
        case 'healthy': return 'badge-success';
        case 'sigatoka': return 'badge-warning';
        case 'xanthomonas': return 'badge-danger';
        default: return 'badge-secondary';
    }
}

function deleteHistoryItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        let history = JSON.parse(localStorage.getItem('detectionHistory') || '[]');
        history = history.filter(item => item.id !== id);
        localStorage.setItem('detectionHistory', JSON.stringify(history));
        loadHistory();
    }
}

historySearch.addEventListener('input', loadHistory);

exportHistoryBtn.addEventListener('click', () => {
    const history = JSON.parse(localStorage.getItem('detectionHistory') || '[]');
    if (history.length === 0) {
        alert('No history to export');
        return;
    }
    
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plant-disease-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem('detectionHistory');
        loadHistory();
    }
});

// Make functions available globally for HTML onclick handlers
window.showPage = showPage;
window.deleteHistoryItem = deleteHistoryItem;