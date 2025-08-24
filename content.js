// Content script that runs on all pages
let highlightPopup = null;
let currentSelection = null;

// Create the highlight popup
function createHighlightPopup() {
  const popup = document.createElement('div');
  popup.id = 'highlight-saver-popup';
  popup.className = 'highlight-saver-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <button id="save-highlight-btn">💾 Save Highlight</button>
      <button id="close-popup-btn">✕</button>
    </div>
  `;
  
  // Position popup near selection
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
  }
  
  document.body.appendChild(popup);
  
  // Add event listeners
  document.getElementById('save-highlight-btn').addEventListener('click', saveHighlight);
  document.getElementById('close-popup-btn').addEventListener('click', hidePopup);
  
  return popup;
}

function showPopup() {
  hidePopup(); // Hide any existing popup
  
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText.length > 0) {
    currentSelection = {
      text: selectedText,
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString()
    };
    
    highlightPopup = createHighlightPopup();
  }
}

function hidePopup() {
  if (highlightPopup) {
    highlightPopup.remove();
    highlightPopup = null;
  }
  currentSelection = null;
}

async function saveHighlight() {
  if (!currentSelection) return;
  
  try {
    // Get existing highlights
    const result = await chrome.storage.local.get(['highlights']);
    const highlights = result.highlights || [];
    
    // Add new highlight with unique ID
    const newHighlight = {
      id: Date.now().toString(),
      ...currentSelection
    };
    
    highlights.unshift(newHighlight); // Add to beginning
    
    // Save back to storage
    await chrome.storage.local.set({ highlights });
    
    // Show success feedback
    const saveBtn = document.getElementById('save-highlight-btn');
    if (saveBtn) {
      saveBtn.textContent = '✓ Saved!';
      saveBtn.style.backgroundColor = '#4CAF50';
      
      setTimeout(() => {
        hidePopup();
      }, 1000);
    }
    
  } catch (error) {
    console.error('Error saving highlight:', error);
    alert('Error saving highlight. Please try again.');
  }
}

// Listen for text selection
document.addEventListener('mouseup', (e) => {
  // Don't show popup if clicking on our popup
  if (e.target.closest('#highlight-saver-popup')) {
    return;
  }
  
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      showPopup();
    } else {
      hidePopup();
    }
  }, 10);
});

// Hide popup when clicking elsewhere
document.addEventListener('click', (e) => {
  if (!e.target.closest('#highlight-saver-popup')) {
    hidePopup();
  }
});

// Hide popup on scroll
document.addEventListener('scroll', hidePopup);