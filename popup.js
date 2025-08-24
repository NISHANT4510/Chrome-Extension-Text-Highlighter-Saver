// Popup script for the Chrome extension
let highlights = [];
let apiKey = '';

// DOM elements
const emptyState = document.getElementById('empty-state');
const highlightsList = document.getElementById('highlights-list');
const clearAllBtn = document.getElementById('clear-all-btn');
const summarizeAllBtn = document.getElementById('summarize-all-btn');
const apiKeySection = document.getElementById('api-key-section');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const loadingDiv = document.getElementById('loading');
const summarySection = document.getElementById('summary-section');
const summaryContent = document.getElementById('summary-content');
const closeSummaryBtn = document.getElementById('close-summary-btn');

// Initialize popup
async function init() {
  await loadHighlights();
  await loadApiKey();
  updateDisplay();
  setupEventListeners();
}

// Load highlights from storage
async function loadHighlights() {
  try {
    const result = await chrome.storage.local.get(['highlights']);
    highlights = result.highlights || [];
  } catch (error) {
    console.error('Error loading highlights:', error);
    highlights = [];
  }
}

// Load API key from storage
async function loadApiKey() {
  try {
    const result = await chrome.storage.local.get(['openai_api_key']);
    apiKey = result.openai_api_key || '';
    if (apiKey) {
      apiKeyInput.value = '••••••••••••••••';
      apiKeySection.style.backgroundColor = '#e8f5e8';
    }
  } catch (error) {
    console.error('Error loading API key:', error);
  }
}

// Save API key to storage
async function saveApiKey() {
  const newApiKey = apiKeyInput.value.trim();
  if (newApiKey && !newApiKey.includes('•')) {
    try {
      await chrome.storage.local.set({ openai_api_key: newApiKey });
      apiKey = newApiKey;
      apiKeyInput.value = '••••••••••••••••';
      apiKeySection.style.backgroundColor = '#e8f5e8';
      
      // Show success feedback
      const originalText = saveApiKeyBtn.textContent;
      saveApiKeyBtn.textContent = '✓ Saved';
      saveApiKeyBtn.style.backgroundColor = '#4CAF50';
      
      setTimeout(() => {
        saveApiKeyBtn.textContent = originalText;
        saveApiKeyBtn.style.backgroundColor = '#2196F3';
      }, 2000);
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Error saving API key');
    }
  }
}

// Update the display
function updateDisplay() {
  if (highlights.length === 0) {
    emptyState.style.display = 'block';
    highlightsList.style.display = 'none';
    summarizeAllBtn.disabled = true;
    summarizeAllBtn.style.opacity = '0.5';
    clearAllBtn.disabled = true;
    clearAllBtn.style.opacity = '0.5';
  } else {
    emptyState.style.display = 'none';
    highlightsList.style.display = 'block';
    summarizeAllBtn.disabled = false;
    summarizeAllBtn.style.opacity = '1';
    clearAllBtn.disabled = false;
    clearAllBtn.style.opacity = '1';
    renderHighlights();
  }
}

// Render highlights list
function renderHighlights() {
  highlightsList.innerHTML = '';
  
  highlights.forEach((highlight, index) => {
    const item = document.createElement('div');
    item.className = 'highlight-item';
    
    const date = new Date(highlight.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Truncate URL for display
    let displayUrl = highlight.url;
    if (displayUrl.length > 50) {
      displayUrl = displayUrl.substring(0, 50) + '...';
    }
    
    item.innerHTML = `
      <div class="highlight-header">
        <div class="highlight-info">
          <a href="${highlight.url}" target="_blank" class="highlight-url" title="${highlight.url}">
            ${displayUrl}
          </a>
          <div class="highlight-title" title="${highlight.title}">
            ${highlight.title}
          </div>
          <div class="highlight-date">${formattedDate}</div>
        </div>
        <div class="highlight-actions">
          <button class="summarize-btn" data-index="${index}" title="Summarize this highlight">
            🤖
          </button>
          <button class="delete-btn" data-index="${index}" title="Delete this highlight">
            🗑️
          </button>
        </div>
      </div>
      <div class="highlight-text">${highlight.text}</div>
    `;
    
    highlightsList.appendChild(item);
  });
  
  // Add event listeners to action buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      deleteHighlight(index);
    });
  });
  
  document.querySelectorAll('.summarize-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      summarizeHighlight(index);
    });
  });
}

// Delete a highlight
async function deleteHighlight(index) {
  if (confirm('Delete this highlight?')) {
    try {
      highlights.splice(index, 1);
      await chrome.storage.local.set({ highlights });
      updateDisplay();
    } catch (error) {
      console.error('Error deleting highlight:', error);
      alert('Error deleting highlight');
    }
  }
}

// Clear all highlights
async function clearAllHighlights() {
  if (confirm('Delete all highlights? This action cannot be undone.')) {
    try {
      highlights = [];
      await chrome.storage.local.set({ highlights: [] });
      updateDisplay();
      hideSummary();
    } catch (error) {
      console.error('Error clearing highlights:', error);
      alert('Error clearing highlights');
    }
  }
}

// Summarize a single highlight
async function summarizeHighlight(index) {
  if (!apiKey) {
    alert('Please enter your OpenAI API key first');
    return;
  }
  
  const highlight = highlights[index];
  await getSummary([highlight], `Summary of highlight from ${highlight.title}`);
}

// Summarize all highlights
async function summarizeAllHighlights() {
  if (!apiKey) {
    alert('Please enter your OpenAI API key first');
    return;
  }
  
  if (highlights.length === 0) {
    alert('No highlights to summarize');
    return;
  }
  
  await getSummary(highlights, 'Summary of All Highlights');
}

// Get AI summary from OpenAI
async function getSummary(highlightsToSummarize, title) {
  showLoading();
  
  try {
    // Prepare the text for summarization
    const textToSummarize = highlightsToSummarize.map(h => 
      `From "${h.title}" (${h.url}):\n${h.text}`
    ).join('\n\n---\n\n');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, informative summaries of highlighted text. Focus on key points, main ideas, and important insights.'
          },
          {
            role: 'user',
            content: `Please provide a comprehensive summary of the following highlighted text(s):\n\n${textToSummarize}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const summary = data.choices[0].message.content;
    
    showSummary(summary);
    
  } catch (error) {
    console.error('Error getting summary:', error);
    alert(`Error getting AI summary: ${error.message}`);
  } finally {
    hideLoading();
  }
}

// Show loading spinner
function showLoading() {
  loadingDiv.classList.remove('hidden');
  hideSummary();
}

// Hide loading spinner
function hideLoading() {
  loadingDiv.classList.add('hidden');
}

// Show summary
function showSummary(summary) {
  summaryContent.innerHTML = summary.replace(/\n/g, '<br>');
  summarySection.classList.remove('hidden');
  
  // Scroll to top of summary
  summarySection.scrollTop = 0;
}

// Hide summary
function hideSummary() {
  summarySection.classList.add('hidden');
}

// Setup event listeners
function setupEventListeners() {
  clearAllBtn.addEventListener('click', clearAllHighlights);
  summarizeAllBtn.addEventListener('click', summarizeAllHighlights);
  saveApiKeyBtn.addEventListener('click', saveApiKey);
  closeSummaryBtn.addEventListener('click', hideSummary);
  
  // Allow Enter key to save API key
  apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveApiKey();
    }
  });
  
  // Clear placeholder text when clicking on API key input
  apiKeyInput.addEventListener('focus', () => {
    if (apiKeyInput.value.includes('•')) {
      apiKeyInput.value = '';
      apiKeyInput.type = 'text';
    }
  });
  
  apiKeyInput.addEventListener('blur', () => {
    if (apiKeyInput.value === '' && apiKey) {
      apiKeyInput.value = '••••••••••••••••';
      apiKeyInput.type = 'password';
    }
  });
}

// Listen for storage changes (in case highlights are added from content script)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.highlights) {
    highlights = changes.highlights.newValue || [];
    updateDisplay();
  }
});

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', init);