'use strict';

/* global Monogatari */
/* global monogatari */

const { $_ready } = Monogatari;

/**
 * While a character line is on screen, Monogatari's Dialog action adds the
 * `focus` class to that speaker's sprite (`[data-character="li"]`, etc.).
 * We mark the root so style/main.css can apply a speaking hint (brightness pulse)
 * when the player has not asked the OS for reduced motion.
 */
function initSpeakingSpriteBounce() {
  document.getElementById('monogatari')?.classList.add('hell-story-speaking-bounce-enabled');
}

/**
 * Core HUD rows (stats, money, stamina). Shown only after stat allocation (storage.completedStatSpread).
 * Demon affection rows live in GAMEPLAY_HUD_AFFECTION_ROWS → separate <ul> for easy display:none.
 */
const GAMEPLAY_HUD_CORE_ROWS = [
  { key: 'STRENGTH', label: 'STR' },
  { key: 'DEXTERITY', label: 'DEX' },
  { key: 'CONSTITUTION', label: 'CON' },
  { key: 'INTELLIGENCE', label: 'INT' },
  { key: 'WISDOM', label: 'WIS' },
  { key: 'RIZZ', label: 'RIZZ' },
  { key: 'money', label: 'MONEY' },
  { key: 'dayStamina', label: 'STAMINA' }
];

const GAMEPLAY_HUD_AFFECTION_ROWS = [
  { key: 'lilyAffection', label: 'LILY' },
  { key: 'lucyAffection', label: 'LUCY' },
  { key: 'samAffection', label: 'SAM' },
  { key: 'belleAffection', label: 'BELLE' },
  { key: 'mollyAffection', label: 'MOLLY' }
];

function isGameScreenActive() {
  return Boolean(document.querySelector('#monogatari [data-screen="game"].active'));
}

function isStatSpreadComplete(storage) {
  if (!storage) {
    return false;
  }
  if (storage.completedStatSpread === true) {
    return true;
  }
  const keys = ['STRENGTH', 'DEXTERITY', 'CONSTITUTION', 'INTELLIGENCE', 'WISDOM', 'RIZZ'];
  const bonusPoints = keys.reduce((acc, k) => acc + Math.max(0, (Number(storage[k]) || 1) - 1), 0);
  return bonusPoints >= 10;
}

function formatHudValue(value) {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'boolean') {
    return value ? 'Y' : 'N';
  }
  if (typeof value === 'object') {
    return '…';
  }
  return String(value);
}

function fillHudList(ul, rows, storage) {
  if (!ul) {
    return;
  }
  ul.textContent = '';
  for (const row of rows) {
    const li = document.createElement('li');
    li.className = 'gameplay-stats-hud__row';
    const label = document.createElement('span');
    label.className = 'gameplay-stats-hud__label';
    label.textContent = row.label;
    const value = document.createElement('span');
    value.className = 'gameplay-stats-hud__value';
    value.textContent = formatHudValue(storage[row.key]);
    li.appendChild(label);
    li.appendChild(value);
    ul.appendChild(li);
  }
}

function refreshGameplayStatsHud() {
  const root = document.getElementById('gameplay-stats-hud');
  const listCore = document.getElementById('gameplay-stats-hud-core');
  const listAffection = document.getElementById('gameplay-stats-hud-affection');
  if (!root || !listCore || !listAffection || typeof monogatari === 'undefined' || typeof monogatari.storage !== 'function') {
    return;
  }

  const storage = monogatari.storage();
  const onGame = isGameScreenActive();
  const spreadDone = isStatSpreadComplete(storage);
  const visible = onGame && spreadDone;

  root.classList.toggle('gameplay-stats-hud--hidden', !visible);
  root.setAttribute('aria-hidden', visible ? 'false' : 'true');
  if (!visible) {
    return;
  }

  const name = storage.player && typeof storage.player === 'object' ? storage.player.name : '';
  const title = root.querySelector('.gameplay-stats-hud__title');
  if (title) {
    title.textContent = name ? `Status · ${name}` : 'Status';
  }

  fillHudList(listCore, GAMEPLAY_HUD_CORE_ROWS, storage);
  fillHudList(listAffection, GAMEPLAY_HUD_AFFECTION_ROWS, storage);
}

function initGameplayStatsHud() {
  const originalStorage = monogatari.storage;
  monogatari.storage = function patchedStorage(...args) {
    const result = originalStorage.apply(this, args);
    if (args.length > 0) {
      refreshGameplayStatsHud();
    }
    return result;
  };

  refreshGameplayStatsHud();
  setInterval(refreshGameplayStatsHud, 400);

  const host = document.getElementById('monogatari');
  if (host) {
    const mo = new MutationObserver(() => refreshGameplayStatsHud());
    mo.observe(host, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }
}

// This runs once the page is ready and starts the Monogatari engine.
$_ready(() => {
  monogatari.init('#monogatari').then(() => {
    console.log('Monogatari initialized');
    initSpeakingSpriteBounce();
    initGameplayStatsHud();

    // Debug mode is optional. Add ?debug to the URL to show game variables.
    // Example: http://127.0.0.1:3000/?debug
    if (new URLSearchParams(window.location.search).has('debug')) {
      createDebugDisplay();
    }
  });
});

// This creates the small variable viewer used for debugging.
// It is useful when testing stats, money, choices, and affection values.
function createDebugDisplay() {
  if (document.getElementById('debug-display')) {
    return;
  }

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
    max-height: 500px;
    overflow: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    border: 2px solid #8b0000;
  `;

  debugDiv.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px; font-size: 14px; border-bottom: 2px solid white; padding-bottom: 5px;">
      DEBUG VARIABLES
    </div>
    <div id="debug-content"></div>
  `;

  document.body.appendChild(debugDiv);

  function updateDebugDisplay() {
    const storage = monogatari.storage();
    const debugContent = document.getElementById('debug-content');

    if (!debugContent) {
      return;
    }

    const keys = Object.keys(storage).sort();

    debugContent.innerHTML = keys.map((key) => {
      const value = storage[key];
      let displayValue;

      if (typeof value === 'object') {
        displayValue = JSON.stringify(value, null, 2);
      } else if (typeof value === 'boolean') {
        displayValue = value ? 'true' : 'false';
      } else {
        displayValue = value;
      }

      return `
        <div style="margin-bottom: 8px; padding: 5px; background: rgba(0, 0, 0, 0.3); border-radius: 4px;">
          <span style="color: #ffcccc; font-weight: bold;">${key}:</span>
          <span style="color: #ffffff; margin-left: 5px;">${displayValue}</span>
        </div>
      `;
    }).join('');
  }

  updateDebugDisplay();

  const originalStorage = monogatari.storage;
  monogatari.storage = function(...args) {
    const result = originalStorage.apply(this, args);

    if (args.length > 0) {
      updateDebugDisplay();
    }

    return result;
  };
}
