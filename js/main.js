// Add this to your main.js file after monogatari initialization

'use strict';

/* global Monogatari */
/* global monogatari */

const { $_ready, $_ } = Monogatari;

$_ready(() => {
  monogatari.init('#monogatari').then(() => {
    console.log('Monogatari initialized');
    
    // Create debug display
    createDebugDisplay();
  });
});

function createDebugDisplay() {
  const debugDiv = document.createElement('div');
  debugDiv.id = 'debug-display';
  debugDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(139, 0, 0, 0.9);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    z-index: 10000;
    max-width: 300px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    border: 2px solid #8b0000;
  `;
  
  debugDiv.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; font-size: 14px; border-bottom: 2px solid white; padding-bottom: 5px;">
      🐛 DEBUG VARIABLES
    </div>
    <div id="debug-content"></div>
  `;
  
  document.body.appendChild(debugDiv);
  
  // Update debug display
  function updateDebugDisplay() {
    const storage = monogatari.storage();
    const debugContent = document.getElementById('debug-content');
    
    if (debugContent) {
      let html = '';
      
      // Sort keys for better readability
      const keys = Object.keys(storage).sort();
      
      keys.forEach(key => {
        const value = storage[key];
        let displayValue;
        
        if (typeof value === 'object') {
          displayValue = JSON.stringify(value, null, 2);
        } else if (typeof value === 'boolean') {
          displayValue = value ? '✓ true' : '✗ false';
        } else {
          displayValue = value;
        }
        
        html += `
          <div style="margin-bottom: 8px; padding: 5px; background: rgba(0, 0, 0, 0.3); border-radius: 4px;">
            <span style="color: #ffcccc; font-weight: bold;">${key}:</span>
            <span style="color: #ffffff; margin-left: 5px;">${displayValue}</span>
          </div>
        `;
      });
      
      debugContent.innerHTML = html;
    }
  }
  
  // Initial update
  updateDebugDisplay();
  
  // Update every 500ms
  setInterval(updateDebugDisplay, 500);
  
  // Also update on storage changes
  const originalStorage = monogatari.storage;
  monogatari.storage = function(...args) {
    const result = originalStorage.apply(this, args);
    if (args.length > 0) {
      updateDebugDisplay();
    }
    return result;
  };
}