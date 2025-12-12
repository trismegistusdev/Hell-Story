/* global monogatari */

/* -----------------------------------------------------------------NOTIFICATIONS -------------------------------------------------------------------------------------------------------------------*/
monogatari.action('Notification').notifications({
    'Welcome': {
        title: 'Welcome!',
        body: 'This is the Monogatari VN Engine',
        icon: ''
    }
});
/*-------------------------------------------------------------------- MESSAGES -------------------------------------------------------------------------------------------------------------------*/
monogatari.action('Message').messages({
    'Help': {
        title: 'Help',
        subtitle: 'Need assistance?',
        body: 'This game says: "You should read the documentation!"'
    }
});
/* -----------------------------------------------------------------STORAGE -------------------------------------------------------------------------------------------------------------------*/
monogatari.storage({
    player: { name: '' },
    lilyAffection: 0,
    lucyAffection: 0,
    mollyAffection: 0,
    belleAffection: 0,
    samAffection: 0,
    receivedHPhone: false,
    STRENGTH: 1,
    DEXTERITY: 1,
    CONSTITUTION: 1,
    INTELLIGENCE: 1,
    WISDOM: 1,
    RIZZ: 1,
    dayStamina: 3,
    money: 10,
    didGymToday: false,
    didReadToday: false,
    didChillToday: false,
    didWorkToday: false,
    boughtItemToday: false,
    activeItemName: '',
    activeItemBuffs: {},
    dailyShopItems: []
});
/* CHARACTERS =================================================================================================================================================*/
monogatari.characters({
    y: { name: 'You' },
    li: { name: 'Lily',
            sprites: {
            normal: 'lily.png',
            happy: 'notafileyet.png'
		}},
    lu: { name: 'Lucy' },
    b: { name: 'Belle' },
    s: { name: 'Sam' },
    m: { name: 'Molly' }
});
// --- HELPER FUNCTIONS ---
function changeVar(varName, amount) {
    return {
        'Function': {
            'Apply': function() {
                const storage = monogatari.storage();
                this._oldValue = storage[varName];
                storage[varName] = (storage[varName] || 0) + amount;
                monogatari.storage(storage);
                return true;
            },
            'Reverse': function() {
                const storage = monogatari.storage();
                storage[varName] = this._oldValue;
                monogatari.storage(storage);
                return true;
            }
        }
    };
}

function statCheck(statName, difficulty) {
    return {
        'Function': {
            'Apply': function() {
                const storage = monogatari.storage();
                const statValue = storage[statName] || 1;
                const roll = Math.floor(Math.random() * 5) + 1;
                const total = statValue + roll;
                const success = total >= difficulty;
                
                storage._lastRoll = roll;
                storage._lastStat = statValue;
                storage._lastTotal = total;
                storage._lastDifficulty = difficulty;
                storage._lastSuccess = success;
                storage._lastStatName = statName;
                
                monogatari.storage(storage);
                return true;
            },
            'Reverse': function() {
                return true;
            }
        }
    };
}
function setVar(varName, value) {
    return {
        'Function': {
            'Apply': function() {
                const storage = monogatari.storage();
                this._oldValue = storage[varName];
                storage[varName] = value;
                monogatari.storage(storage);
                return true;
            },
            'Reverse': function() {
                const storage = monogatari.storage();
                storage[varName] = this._oldValue;
                monogatari.storage(storage);
                return true;
            }
        }
    };
}

function resetDailyActivities() {
    return {
        'Function': {
            'Apply': function() {
                const storage = monogatari.storage();
                storage.didGymToday = false;
                storage.didReadToday = false;
                storage.didChillToday = false;
                storage.didWorkToday = false;
                storage.dayStamina = 3;
                storage.boughtItemToday = false;
                storage.activeItemName = '';
                storage.activeItemBuffs = {};
                generateDailyShopItems();
                monogatari.storage(storage);
                return true;
            },
            'Reverse': function() {
                return true;
            }
        }
    };
}

// ===============================================================================================================================================
// HELL-MAZON SHOP SYSTEM
// ===============================================================================================================================================

const SHOP_ITEMS = [
    { name: 'Expired Hellfire Energy Drink', price: 3, buffs: { STRENGTH: 1, CONSTITUTION: 1 }, debuffs: { WISDOM: -1 }, desc: '+1 STR, +1 CON, -1 WIS' },
    { name: 'Demonic Brain Pills', price: 4, buffs: { INTELLIGENCE: 2 }, debuffs: { STRENGTH: -1 }, desc: '+2 INT, -1 STR' },
    { name: 'Cursed Protein Powder', price: 4, buffs: { STRENGTH: 2 }, debuffs: { INTELLIGENCE: -1 }, desc: '+2 STR, -1 INT' },
    { name: 'Suspicious Love Potion', price: 5, buffs: { RIZZ: 2 }, debuffs: { CONSTITUTION: -1 }, desc: '+2 RIZZ, -1 CON' },
    { name: 'Meditation Incense (Slightly Toxic)', price: 3, buffs: { WISDOM: 1, RIZZ: 1 }, debuffs: { DEXTERITY: -1 }, desc: '+1 WIS, +1 RIZZ, -1 DEX' },
    { name: 'Shady Coffee from the 9th Circle', price: 3, buffs: { DEXTERITY: 1, INTELLIGENCE: 1 }, debuffs: { RIZZ: -1 }, desc: '+1 DEX, +1 INT, -1 RIZZ' },
    { name: 'Blessed Demon Steroids', price: 6, buffs: { STRENGTH: 2, CONSTITUTION: 1 }, debuffs: { WISDOM: -1, RIZZ: -1 }, desc: '+2 STR, +1 CON, -1 WIS, -1 RIZZ' },
    { name: 'Ancient Wisdom Scrolls', price: 7, buffs: { WISDOM: 2, INTELLIGENCE: 1 }, debuffs: { STRENGTH: -1, DEXTERITY: -1 }, desc: '+2 WIS, +1 INT, -1 STR, -1 DEX' },
    { name: 'Charm School Graduation Certificate', price: 8, buffs: { RIZZ: 3 }, debuffs: { CONSTITUTION: -1, STRENGTH: -1 }, desc: '+3 RIZZ, -1 CON, -1 STR' },
    { name: 'Parkour Training Manual', price: 6, buffs: { DEXTERITY: 2, STRENGTH: 1 }, debuffs: { INTELLIGENCE: -1, WISDOM: -1 }, desc: '+2 DEX, +1 STR, -1 INT, -1 WIS' },
    { name: 'IQ Boosting Headband', price: 7, buffs: { INTELLIGENCE: 3 }, debuffs: { RIZZ: -1, DEXTERITY: -1 }, desc: '+3 INT, -1 RIZZ, -1 DEX' },
    { name: 'Balanced Breakfast from Hell', price: 6, buffs: { STRENGTH: 1, DEXTERITY: 1, CONSTITUTION: 1 }, debuffs: { INTELLIGENCE: -1, WISDOM: -1 }, desc: '+1 STR, +1 DEX, +1 CON, -1 INT, -1 WIS' },
    { name: 'Divine Elixir of Power', price: 10, buffs: { STRENGTH: 3, CONSTITUTION: 2 }, debuffs: { INTELLIGENCE: -2, RIZZ: -1 }, desc: '+3 STR, +2 CON, -2 INT, -1 RIZZ' },
    { name: 'Philosopher\'s Stone Fragment', price: 12, buffs: { INTELLIGENCE: 3, WISDOM: 2 }, debuffs: { STRENGTH: -2, CONSTITUTION: -1 }, desc: '+3 INT, +2 WIS, -2 STR, -1 CON' },
    { name: 'Succubus Training Course', price: 11, buffs: { RIZZ: 4, WISDOM: 1 }, debuffs: { STRENGTH: -2, CONSTITUTION: -1 }, desc: '+4 RIZZ, +1 WIS, -2 STR, -1 CON' },
    { name: 'Ninja Reflexes Serum', price: 10, buffs: { DEXTERITY: 4 }, debuffs: { CONSTITUTION: -2, WISDOM: -1 }, desc: '+4 DEX, -2 CON, -1 WIS' },
    { name: 'Fortitude Tonic of the Damned', price: 9, buffs: { CONSTITUTION: 4, STRENGTH: 1 }, debuffs: { DEXTERITY: -2, RIZZ: -1 }, desc: '+4 CON, +1 STR, -2 DEX, -1 RIZZ' },
    { name: 'Mystery Box from Satan', price: 5, buffs: { STRENGTH: 3, INTELLIGENCE: 3 }, debuffs: { CONSTITUTION: -3, WISDOM: -2 }, desc: '+3 STR, +3 INT, -3 CON, -2 WIS (RISKY!)' },
    { name: 'All-Stats Energy Bar', price: 15, buffs: { STRENGTH: 2, DEXTERITY: 2, CONSTITUTION: 2, INTELLIGENCE: 2, WISDOM: 2, RIZZ: 2 }, debuffs: {}, desc: '+2 ALL STATS (NO DEBUFFS!)' },
    { name: 'Cursed Monkey Paw', price: 1, buffs: { RIZZ: 5 }, debuffs: { STRENGTH: -2, DEXTERITY: -2, CONSTITUTION: -2 }, desc: '+5 RIZZ, -2 STR/DEX/CON (CURSED!)' }
];

function generateDailyShopItems() {
    const storage = monogatari.storage();
    const shuffled = [...SHOP_ITEMS].sort(() => Math.random() - 0.5);
    storage.dailyShopItems = shuffled.slice(0, 2);
    monogatari.storage(storage);
}

function showStatAllocation() {
    return {
        'Function': {
            'Apply': function() {
                return new Promise((resolve) => {
                    const overlay = document.createElement('div');
                    overlay.id = 'stat-allocation-overlay';
                    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center;';
                    
                    overlay.innerHTML = `
                      <div id="stat-screen" style="padding:40px; max-width:700px; background:#1a1a1a; color:#fff; border:2px solid #888; border-radius:10px; box-shadow:0 0 30px rgba(0,0,0,0.8);">
                        <h2 style="text-align:center; margin-bottom:20px; font-size:28px;">Allocate Your Stats</h2>
                        <p style="text-align:center; font-size:18px; margin-bottom:30px;">You have <span id="points-left" style="color:#ff6b6b; font-weight:bold; font-size:24px;">10</span> points remaining</p>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:30px;">
                          <div style="padding:15px; background:#2a2a2a; border-radius:5px;">
                            <p style="font-size:18px; margin-bottom:10px;"><strong>STR:</strong> <span data-stat-value="STRENGTH" style="color:#4ecdc4; font-size:20px; font-weight:bold;">1</span></p>
                            <button type="button" data-add="STRENGTH" style="padding:8px 20px; margin-right:10px; font-size:16px; cursor:pointer; background:#4ecdc4; border:none; border-radius:5px; color:#000; font-weight:bold;">+</button>
                            <button type="button" data-sub="STRENGTH" style="padding:8px 20px; font-size:16px; cursor:pointer; background:#ff6b6b; border:none; border-radius:5px; color:#fff; font-weight:bold;">-</button>
                          </div>
                          <div style="padding:15px; background:#2a2a2a; border-radius:5px;">
                            <p style="font-size:18px; margin-bottom:10px;"><strong>DEX:</strong> <span data-stat-value="DEXTERITY" style="color:#4ecdc4; font-size:20px; font-weight:bold;">1</span></p>
                            <button type="button" data-add="DEXTERITY" style="padding:8px 20px; margin-right:10px; font-size:16px; cursor:pointer; background:#4ecdc4; border:none; border-radius:5px; color:#000; font-weight:bold;">+</button>
                            <button type="button" data-sub="DEXTERITY" style="padding:8px 20px; font-size:16px; cursor:pointer; background:#ff6b6b; border:none; border-radius:5px; color:#fff; font-weight:bold;">-</button>
                          </div>
                          <div style="padding:15px; background:#2a2a2a; border-radius:5px;">
                            <p style="font-size:18px; margin-bottom:10px;"><strong>CON:</strong> <span data-stat-value="CONSTITUTION" style="color:#4ecdc4; font-size:20px; font-weight:bold;">1</span></p>
                            <button type="button" data-add="CONSTITUTION" style="padding:8px 20px; margin-right:10px; font-size:16px; cursor:pointer; background:#4ecdc4; border:none; border-radius:5px; color:#000; font-weight:bold;">+</button>
                            <button type="button" data-sub="CONSTITUTION" style="padding:8px 20px; font-size:16px; cursor:pointer; background:#ff6b6b; border:none; border-radius:5px; color:#fff; font-weight:bold;">-</button>
                          </div>
                          <div style="padding:15px; background:#2a2a2a; border-radius:5px;">
                            <p style="font-size:18px; margin-bottom:10px;"><strong>INT:</strong> <span data-stat-value="INTELLIGENCE" style="color:#4ecdc4; font-size:20px; font-weight:bold;">1</span></p>
                            <button type="button" data-add="INTELLIGENCE" style="padding:8px 20px; margin-right:10px; font-size:16px; cursor:pointer; background:#4ecdc4; border:none; border-radius:5px; color:#000; font-weight:bold;">+</button>
                            <button type="button" data-sub="INTELLIGENCE" style="padding:8px 20px; font-size:16px; cursor:pointer; background:#ff6b6b; border:none; border-radius:5px; color:#fff; font-weight:bold;">-</button>
                          </div>
                          <div style="padding:15px; background:#2a2a2a; border-radius:5px;">
                            <p style="font-size:18px; margin-bottom:10px;"><strong>WIS:</strong> <span data-stat-value="WISDOM" style="color:#4ecdc4; font-size:20px; font-weight:bold;">1</span></p>
                            <button type="button" data-add="WISDOM" style="padding:8px 20px; margin-right:10px; font-size:16px; cursor:pointer; background:#4ecdc4; border:none; border-radius:5px; color:#000; font-weight:bold;">+</button>
                            <button type="button" data-sub="WISDOM" style="padding:8px 20px; font-size:16px; cursor:pointer; background:#ff6b6b; border:none; border-radius:5px; color:#fff; font-weight:bold;">-</button>
                          </div>
                          <div style="padding:15px; background:#2a2a2a; border-radius:5px;">
                            <p style="font-size:18px; margin-bottom:10px;"><strong>RIZZ:</strong> <span data-stat-value="RIZZ" style="color:#4ecdc4; font-size:20px; font-weight:bold;">1</span></p>
                            <button type="button" data-add="RIZZ" style="padding:8px 20px; margin-right:10px; font-size:16px; cursor:pointer; background:#4ecdc4; border:none; border-radius:5px; color:#000; font-weight:bold;">+</button>
                            <button type="button" data-sub="RIZZ" style="padding:8px 20px; font-size:16px; cursor:pointer; background:#ff6b6b; border:none; border-radius:5px; color:#fff; font-weight:bold;">-</button>
                          </div>
                        </div>

                        <div style="text-align:center;">
                          <button type="button" id="confirm-stats" disabled style="padding:15px 40px; font-size:20px; background:#555; border:none; border-radius:5px; color:#fff; font-weight:bold; cursor:not-allowed;">Confirm Stats</button>
                        </div>
                      </div>
                    `;
                    
                    document.body.appendChild(overlay);
                    
                    const STATS = ['STRENGTH', 'DEXTERITY', 'CONSTITUTION', 'INTELLIGENCE', 'WISDOM', 'RIZZ'];
                    const stats = {};
                    let points = 10;
                    
                    const storage = monogatari.storage();
                    STATS.forEach(s => {
                      stats[s] = storage[s] || 1;
                    });
                    
                    const update = () => {
                      let used = 0;
                      STATS.forEach(s => {
                        used += (stats[s] - 1);
                      });
                      points = 10 - used;
                      
                      overlay.querySelector('#points-left').textContent = points;
                      
                      STATS.forEach(s => {
                        const valEl = overlay.querySelector(`[data-stat-value="${s}"]`);
                        const addBtn = overlay.querySelector(`[data-add="${s}"]`);
                        const subBtn = overlay.querySelector(`[data-sub="${s}"]`);
                        
                        if (valEl) valEl.textContent = stats[s];
                        if (addBtn) addBtn.disabled = points <= 0 || stats[s] >= 6;
                        if (subBtn) subBtn.disabled = stats[s] <= 1;
                      });
                      
                      const confirmBtn = overlay.querySelector('#confirm-stats');
                      if (confirmBtn) {
                        if (points === 0) {
                          confirmBtn.disabled = false;
                          confirmBtn.style.background = '#95e1d3';
                          confirmBtn.style.cursor = 'pointer';
                          confirmBtn.style.color = '#000';
                          confirmBtn.textContent = 'Confirm Stats';
                        } else {
                          confirmBtn.disabled = true;
                          confirmBtn.style.background = '#555';
                          confirmBtn.style.cursor = 'not-allowed';
                          confirmBtn.style.color = '#fff';
                          confirmBtn.textContent = `Use all ${points} points`;
                        }
                      }
                    };
                    
                    STATS.forEach(s => {
                      const addBtn = overlay.querySelector(`[data-add="${s}"]`);
                      const subBtn = overlay.querySelector(`[data-sub="${s}"]`);
                      
                      if (addBtn) {
                        addBtn.addEventListener('click', () => {
                          if (points > 0 && stats[s] < 6) {
                            stats[s]++;
                            update();
                          }
                        });
                      }
                      
                      if (subBtn) {
                        subBtn.addEventListener('click', () => {
                          if (stats[s] > 1) {
                            stats[s]--;
                            update();
                          }
                        });
                      }
                    });
                    
                    const confirmBtn = overlay.querySelector('#confirm-stats');
                    if (confirmBtn) {
                      confirmBtn.addEventListener('click', () => {
                        if (points !== 0) return;
                        const storage = monogatari.storage();
                        STATS.forEach(s => storage[s] = stats[s]);
                        monogatari.storage(storage);
                        overlay.remove();
                        resolve();
                      });
                    }
                    
                    update();
                });
            },
            'Reverse': function() {
                const overlay = document.getElementById('stat-allocation-overlay');
                if (overlay) overlay.remove();
                return true;
            }
        }
    };
}

// --- SCRIPT ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
monogatari.script({
    'Start': [
        'show scene #000000 with fadeIn',
        'y [INTRO PLACEHOLDER]',
        'jump AskName'
    ],

    'AskName': [
        {
            Input: {
                Text: "What is your name?",
                Validation: input => input.trim().length > 0,
                Save: input => {
                    monogatari.storage().player.name = input;
                    return true;
                }
            }
        },
        "li Nice to meet you, {{player.name}}!",
        'jump StatAllocation_Screen'
    ],

    'StatAllocation_Screen': [
        showStatAllocation(),
        'jump Intro'
    ],

    'Intro': [
        'show character li normal at center with fadeIn scale 4',
        'li STR: {{STRENGTH}}, DEX: {{DEXTERITY}}, RIZZ: {{RIZZ}}',
        'show scene #880808 with fadeIn',
        'li Welcome to Hell!',
        {
            Choice: {
                Dialog: 'li Ready?',
                Yes: { Text: 'Yes', Do: 'jump Scene0' },
                No: { Text: 'No', Do: 'jump Scene0' }
            }
        }
    ],

    'Scene0': [
        'clear',
        'show scene #ff9a9a with fadeIn',
        'lu Here is your H-Phone!',
        setVar('receivedHPhone', true),
        'y Added to: HELL SQUAD 😈',
        'jump GroupChatNight0'
    ],

    'GroupChatNight0': [
        'show scene #1a1a1a with fadeIn',
        'li Hey {{player.name}}!',
        'm Hi!! 💕',
        'b Hello!',
        's yo',
        {
            Choice: {
                Dialog: 'What do you say?',
                Good: { Text: 'Hey everyone!', Do: 'jump GC_Good1' },
                Bad: { Text: 'Uh... hi?', Do: 'jump GC_Bad1' }
            }
        }
    ],

    'GC_Good1': [
        changeVar('lilyAffection', 1),
        'li Great attitude! 💖',
        's not bad',
        'jump GC_Scene2'
    ],

    'GC_Bad1': [
        changeVar('lucyAffection', 1),
        'lu lol awkward much',
        'jump GC_Scene2'
    ],

    'GC_Scene2': [
        'm How do you like Hell?',
        {
            Choice: {
                Dialog: 'Response?',
                Good: { Text: 'You all seem cool!', Do: 'jump GC_Good2' },
                Bad: { Text: 'Still processing...', Do: 'jump GC_Bad2' }
            }
        }
    ],

    'GC_Good2': [
        changeVar('lilyAffection', 1),
        changeVar('mollyAffection', 1),
        'm Aww! 🥺',
        'jump GC_Scene3'
    ],

    'GC_Bad2': [
        changeVar('samAffection', 1),
        's fair',
        'jump GC_Scene3'
    ],

    'GC_Scene3': [
        'lu wanna hit the cafe tomorrow?',
        'm YES!',
        {
            Choice: {
                Dialog: 'Join them?',
                Good: { Text: 'I am in!', Do: 'jump GC_Good3' },
                Bad: { Text: 'Maybe...', Do: 'jump GC_Bad3' }
            }
        }
    ],

    'GC_Good3': [
        changeVar('lucyAffection', 1),
        changeVar('mollyAffection', 1),
        'lu nice 😎',
        'jump GC_Scene4'
    ],

    'GC_Bad3': [
        'm Oh... okay!',
        'jump GC_Scene4'
    ],

    'GC_Scene4': [
        's gotta bounce',
        's night',
        'b Goodnight!',
        'jump GC_Scene5'
    ],

    'GC_Scene5': [
        'lu yo {{player.name}}',
        'lu we got your back',
        {
            Choice: {
                Dialog: 'Final message:',
                Good: { Text: 'Thanks everyone', Do: 'jump GC_GoodEnd' },
                Bad: { Text: 'Cool', Do: 'jump GC_BadEnd' }
            }
        }
    ],

    'GC_GoodEnd': [
        changeVar('lucyAffection', 1),
        changeVar('lilyAffection', 1),
        'lu anytime 🤜🤛',
        'li Goodnight! 😊',
        'jump NextMorning'
    ],

    'GC_BadEnd': [
        'lu night',
        'jump NextMorning'
    ],

    'NextMorning': [
        'clear',
        'show scene #f7f6f6 with fadeIn',
        'y New day. Stamina: {{dayStamina}}',
        'jump DayChoiceRouter'
    ],

    'DayNext': [
        'y Stamina: {{dayStamina}}',
        'jump DayChoiceRouter'
    ],

    'DayChoiceRouter': [
        {
            'Conditional': {
                'Condition': function() {
                    const s = monogatari.storage();
                    return !s.didGymToday && !s.didReadToday && !s.didChillToday && !s.didWorkToday;
                },
                'True': 'jump DayChoice_All',
                'False': 'jump DayChoice_Filtered'
            }
        }
    ],

    'DayChoice_Filtered': [
        {
            'Function': {
                'Apply': function() {
                    const s = monogatari.storage();
                    const choices = {
                        Dialog: 'What do you want to do?'
                    };
                    
                    if (!s.didGymToday) {
                        choices.Gym = { Text: 'Gym (STR Check)', Do: 'jump DayGym' };
                    }
                    if (!s.didReadToday) {
                        choices.Read = { Text: 'Read (INT Check)', Do: 'jump DayRead' };
                    }
                    if (!s.didChillToday) {
                        choices.Chill = { Text: 'Chill (WIS Check)', Do: 'jump DayChill' };
                    }
                    if (!s.didWorkToday) {
                        choices.Work = { Text: 'Work (Earn Money)', Do: 'jump DayWork' };
                    }
                    choices.CheckHPhone = { Text: 'Check H-Phone', Do: 'jump HPhone' };
                    
                    monogatari.script()['DayChoice_Dynamic'] = [{ Choice: choices }];
                    return true;
                },
                'Reverse': function() {
                    return true;
                }
            }
        },
        'jump DayChoice_Dynamic'
    ],

    'DayChoice_All': [
        {
            Choice: {
                Dialog: 'What do you want to do?',
                Gym: { Text: 'Gym (STR Check)', Do: 'jump DayGym' },
                Read: { Text: 'Read (INT Check)', Do: 'jump DayRead' },
                Chill: { Text: 'Chill (WIS Check)', Do: 'jump DayChill' },
                Work: { Text: 'Work (Earn Money)', Do: 'jump DayWork' },
                CheckHPhone: { Text: 'Check H-Phone', Do: 'jump HPhone' }
            }
        }
    ],

    'HPhone': [
        'y Money: {{money}} souls',
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().activeItemName !== '';
                },
                'True': 'jump HPhone_WithItem',
                'False': 'jump HPhone_NoItem'
            }
        }
    ],

    'HPhone_WithItem': [
        'y Active Item: {{activeItemName}}',
        {
            Choice: {
                Dialog: 'H-Phone Menu',
                Shop: { Text: 'Browse Hell-Mazon', Do: 'jump HellMazon' },
                Messages: { Text: 'Check Messages', Do: 'jump HPhoneMessages' },
                Socials: { Text: 'Check Socials', Do: 'jump HPhoneSocials' },
                Return: { Text: 'Put Phone Away', Do: 'jump DayNext' }
            }
        }
    ],

    'HPhone_NoItem': [
        {
            Choice: {
                Dialog: 'H-Phone Menu',
                Shop: { Text: 'Browse Hell-Mazon', Do: 'jump HellMazon' },
                Messages: { Text: 'Check Messages', Do: 'jump HPhoneMessages' },
                Socials: { Text: 'Check Socials', Do: 'jump HPhoneSocials' },
                Return: { Text: 'Put Phone Away', Do: 'jump DayNext' }
            }
        }
    ],

    'HPhoneMessages': [ 
        'y Nothing new.',
        'jump HPhone' 
    ],
    
    'HPhoneSocials': [ 
        'y Same old stuff.',
        'jump HPhone' 
    ],

    'HellMazon': [
        'show scene #ff4500 with fadeIn',
        'y Hell-Mazon!',
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().boughtItemToday;
                },
                'True': 'jump HellMazon_AlreadyBought',
                'False': 'jump HellMazon_Shop'
            }
        }
    ],

    'HellMazon_AlreadyBought': [
        'y Already bought today!',
        'jump HPhone'
    ],

    'HellMazon_Shop': [
        'y Money: {{money}} souls',
        {
            'Function': {
                'Apply': function() {
                    const storage = monogatari.storage();
                    
                    if (!storage.dailyShopItems || storage.dailyShopItems.length === 0) {
                        const shuffled = [...SHOP_ITEMS].sort(() => Math.random() - 0.5);
                        storage.dailyShopItems = shuffled.slice(0, 2);
                        monogatari.storage(storage);
                    }
                    
                    const item1 = storage.dailyShopItems[0];
                    const item2 = storage.dailyShopItems[1];
                    
                    const choices = {
                        Dialog: 'Today\'s Deals'
                    };
                    
                    if (storage.money >= item1.price) {
                        choices.Item1 = { 
                            Text: `${item1.name} - ${item1.price} (${item1.desc})`, 
                            Do: 'jump BuyItem1' 
                        };
                    } else {
                        choices.Item1Locked = { 
                            Text: `${item1.name} - ${item1.price} (TOO EXPENSIVE)`, 
                            Do: 'jump CantAfford' 
                        };
                    }
                    
                    if (storage.money >= item2.price) {
                        choices.Item2 = { 
                            Text: `${item2.name} - ${item2.price} (${item2.desc})`, 
                            Do: 'jump BuyItem2' 
                        };
                    } else {
                        choices.Item2Locked = { 
                            Text: `${item2.name} - ${item2.price} (TOO EXPENSIVE)`, 
                            Do: 'jump CantAfford' 
                        };
                    }
                    
                    choices.Exit = { Text: 'Close', Do: 'jump HPhone' };
                    
                    monogatari.script()['HellMazon_Dynamic'] = [{ Choice: choices }];
                    return true;
                },
                'Reverse': function() {
                    return true;
                }
            }
        },
        'jump HellMazon_Dynamic'
    ],

    'CantAfford': [
        'y Cannot afford it!',
        'jump HellMazon_Shop'
    ],

    'BuyItem1': [
        {
            'Function': {
                'Apply': function() {
                    const storage = monogatari.storage();
                    const item = storage.dailyShopItems[0];
                    storage._purchasedItem = item;
                    monogatari.storage(storage);
                    return true;
                },
                'Reverse': function() {
                    return true;
                }
            }
        },
        'jump ProcessPurchase'
    ],

    'BuyItem2': [
        {
            'Function': {
                'Apply': function() {
                    const storage = monogatari.storage();
                    const item = storage.dailyShopItems[1];
                    storage._purchasedItem = item;
                    monogatari.storage(storage);
                    return true;
                },
                'Reverse': function() {
                    return true;
                }
            }
        },
        'jump ProcessPurchase'
    ],

    'ProcessPurchase': [
        {
            'Function': {
                'Apply': function() {
                    const storage = monogatari.storage();
                    const item = storage._purchasedItem;
                    
                    storage.activeItemName = item.name;
                    storage.activeItemBuffs = { buffs: item.buffs, debuffs: item.debuffs };
                    
                    Object.keys(item.buffs).forEach(stat => {
                        storage[stat] += item.buffs[stat];
                    });
                    
                    Object.keys(item.debuffs).forEach(stat => {
                        storage[stat] += item.debuffs[stat];
                    });
                    
                    storage.boughtItemToday = true;
                    storage.money -= item.price;
                    
                    monogatari.storage(storage);
                    return true;
                },
                'Reverse': function() {
                    return true;
                }
            }
        },
        'show scene #8b0000 with fadeIn',
        'y PURCHASED!',
        'y Consumed: {{_purchasedItem.name}}',
        {
            'Function': {
                'Apply': function() {
                    const storage = monogatari.storage();
                    const item = storage._purchasedItem;
                    
                    let effectText = '';
                    
                    Object.keys(item.buffs).forEach(stat => {
                        effectText += `${stat} +${item.buffs[stat]}, `;
                    });
                    
                    Object.keys(item.debuffs).forEach(stat => {
                        effectText += `${stat} ${item.debuffs[stat]}, `;
                    });
                    
                    storage._effectText = effectText.slice(0, -2);
                    monogatari.storage(storage);
                    return true;
                },
                'Reverse': function() {
                    return true;
                }
            }
        },
        'y {{_effectText}}',
        'y Money: {{money}}',
        'jump DayNext'
    ],

    'DayWork': [
        'show scene #f5deb3 with fadeIn',
        setVar('didWorkToday', true),
        {
            'Function': {
                'Apply': function() {
                    const earnings = Math.floor(Math.random() * 4) + 3;
                    const storage = monogatari.storage();
                    storage._workEarnings = earnings;
                    storage.money += earnings;
                    monogatari.storage(storage);
                    return true;
                },
                'Reverse': function() {
                    return true;
                }
            }
        },
        'y Earned {{_workEarnings}} souls!',
        changeVar('dayStamina', -1),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().dayStamina <= 0;
                },
                'True': 'jump Night1Texting',
                'False': 'jump DayNext'
            }
        }
    ],

    'DayGym': [
        'show scene #ffcccc with fadeIn',
        setVar('didGymToday', true),
        's Spot me?',
        {
            Choice: {
                Dialog: 'Help Sam?',
                Good: { Text: 'Sure! (STR)', Do: 'jump GymCheck' },
                Bad: { Text: 'Too tired (-1)', Do: 'jump GymBad' }
            }
        }
    ],

    'GymCheck': [
        statCheck('STRENGTH', 5),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump GymGood',
                'False': 'jump GymFail'
            }
        }
    ],

    'GymGood': [
        changeVar('samAffection', 2),
        changeVar('STRENGTH', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        's Damn! Nice work!',
        changeVar('dayStamina', -1),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().dayStamina <= 0;
                },
                'True': 'jump Night1Texting',
                'False': 'jump DayNext'
            }
        }
    ],

    'GymFail': [
        changeVar('STRENGTH', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        's Whoa! I got it.',
        changeVar('dayStamina', -1),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().dayStamina <= 0;
                },
                'True': 'jump Night1Texting',
                'False': 'jump DayNext'
            }
        }
    ],

    'GymBad': [
        changeVar('samAffection', -1),
        changeVar('STRENGTH', 1),
        's Alright...',
        changeVar('dayStamina', -1),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().dayStamina <= 0;
                },
                'True': 'jump Night1Texting',
                'False': 'jump DayNext'
            }
        }
    ],

    'DayRead': [
        'show scene #e8dcc4 with fadeIn',
        setVar('didReadToday', true),
        'b Read together?',
        {
            Choice: {
                Dialog: 'Join Belle?',
                Good: { Text: 'Sure! (INT)', Do: 'jump ReadCheck' },
                Bad: { Text: 'I saw it first (-1)', Do: 'jump ReadBad' }
            }
        }
    ],

    'ReadCheck': [
        statCheck('INTELLIGENCE', 4),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump ReadGood',
                'False': 'jump ReadFail'
            }
        }
    ],

    'ReadGood': [
        changeVar('belleAffection', 2),
        changeVar('INTELLIGENCE', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'b Your insights are remarkable!',
        changeVar('dayStamina', -1),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().dayStamina <= 0;
                },
                'True': 'jump Night1Texting',
                'False': 'jump DayNext'
            }
        }
    ],

    'ReadFail': [
        changeVar('belleAffection', 1),
        changeVar('INTELLIGENCE', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'b These topics are dense!',
        changeVar('dayStamina', -1),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().dayStamina <= 0;
                },
                'True': 'jump Night1Texting',
                'False': 'jump DayNext'
            }
        }
    ],

    'ReadBad': [
        changeVar('belleAffection', -1),
        changeVar('INTELLIGENCE', 1),
        'b Oh... okay.',
        changeVar('dayStamina', -1),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().dayStamina <= 0;
                },
                'True': 'jump Night1Texting',
                'False': 'jump DayNext'
            }
        }
    ],

    'DayChill': [
        'show scene #c8e6c9 with fadeIn',
        setVar('didChillToday', true),
        'm Movie together?',
        {
            Choice: {
                Dialog: 'Watch with Molly?',
                Good: { Text: 'Sounds perfect! (WIS)', Do: 'jump ChillCheck' },
                Bad: { Text: 'Want to be alone (-1)', Do: 'jump ChillBad' }
            }
        }
    ],

    'ChillCheck': [
        statCheck('WISDOM', 4),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump ChillGood',
                'False': 'jump ChillFail'
            }
        }
    ],

    'ChillGood': [
        changeVar('mollyAffection', 2),
        changeVar('WISDOM', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'm You really get it! So nice!',
        changeVar('dayStamina', -1),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().dayStamina <= 0;
                },
                'True': 'jump Night1Texting',
                'False': 'jump DayNext'
            }
        }
    ],

    'ChillFail': [
        changeVar('mollyAffection', 1),
        changeVar('WISDOM', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'm Oh... yeah?',
        changeVar('dayStamina', -1),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().dayStamina <= 0;
                },
                'True': 'jump Night1Texting',
                'False': 'jump DayNext'
            }
        }
    ],

    'ChillBad': [
        changeVar('mollyAffection', -1),
        changeVar('WISDOM', 1),
        'm Oh... okay.',
        changeVar('dayStamina', -1),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage().dayStamina <= 0;
                },
                'True': 'jump Night1Texting',
                'False': 'jump DayNext'
            }
        }
    ],

    'Night1Texting': [
        'clear',
        'show scene #111111 with fadeIn',
        'y Phone buzzing!',
        'y Everyone wants to hang out!',
        {
            Choice: {
                Dialog: 'Pick a date:',
                Lily: { Text: 'Lily (Cafe)', Do: 'jump DateLily1' },
                Lucy: { Text: 'Lucy (Bar)', Do: 'jump DateLucy1' },
                Sam: { Text: 'Sam (Arena)', Do: 'jump DateSam1' },
                Belle: { Text: 'Belle (Museum)', Do: 'jump DateBelle1' },
                Molly: { Text: 'Molly (Movies)', Do: 'jump DateMolly1' }
            }
        }
    ],

    'DateLily1': [
        'clear',
        'show scene #ff6b6b with fadeIn',
        'li You made it!',
        'li Truth or dare?',
        {
            Choice: {
                Dialog: 'Choose:',
                Truth: { Text: 'Truth (WIS)', Do: 'jump LilyTruth' },
                Dare: { Text: 'Dare (RIZZ)', Do: 'jump LilyDare' }
            }
        }
    ],

    'LilyTruth': [
        statCheck('WISDOM', 5),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump LilyTruthGood',
                'False': 'jump LilyTruthBad'
            }
        }
    ],

    'LilyTruthGood': [
        changeVar('lilyAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'li Wow... that was honest.',
        'jump LilyDate2'
    ],

    'LilyTruthBad': [
        changeVar('lilyAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'li Oh... okay.',
        'jump LilyDate2'
    ],

    'LilyDare': [
        statCheck('RIZZ', 5),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump LilyDareGood',
                'False': 'jump LilyDareBad'
            }
        }
    ],

    'LilyDareGood': [
        changeVar('lilyAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'li You actually did it! Amazing!',
        'jump LilyDate2'
    ],

    'LilyDareBad': [
        changeVar('lilyAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'li Points for trying!',
        'jump LilyDate2'
    ],

    'LilyDate2': [
        'li Share dessert?',
        {
            Choice: {
                Dialog: 'Share?',
                Yes: { Text: 'Share (RIZZ)', Do: 'jump LilyDessert' },
                No: { Text: 'Too full', Do: 'jump LilyEnd' }
            }
        }
    ],

    'LilyDessert': [
        statCheck('RIZZ', 4),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump LilyDessertGood',
                'False': 'jump LilyDessertBad'
            }
        }
    ],

    'LilyDessertGood': [
        changeVar('lilyAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'li This is really nice.',
        'jump LilyEnd'
    ],

    'LilyDessertBad': [
        changeVar('lilyAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'li Let me help clean that.',
        'jump LilyEnd'
    ],

    'LilyEnd': [
        'li Tonight was wonderful!',
        'jump BigD_Message'
    ],

    'DateLucy1': [
        'clear',
        'show scene #8b0000 with fadeIn',
        'lu Ready for real Hell?',
        'lu Drinking game?',
        {
            Choice: {
                Dialog: 'Join?',
                Join: { Text: 'Join (CON)', Do: 'jump LucyDrink' },
                Watch: { Text: 'Watch', Do: 'jump LucyDate2' }
            }
        }
    ],

    'LucyDrink': [
        statCheck('CONSTITUTION', 5),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump LucyDrinkGood',
                'False': 'jump LucyDrinkBad'
            }
        }
    ],

    'LucyDrinkGood': [
        changeVar('lucyAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'lu YOOO! Beast mode!',
        'jump LucyDate2'
    ],

    'LucyDrinkBad': [
        changeVar('lucyAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'lu Easy there!',
        'jump LucyDate2'
    ],

    'LucyDate2': [
        'lu Sketchy demon approaching...',
        {
            Choice: {
                Dialog: 'Handle it?',
                Handle: { Text: 'Handle it (RIZZ)', Do: 'jump LucyMerchant' },
                LetLucy: { Text: 'Let Lucy', Do: 'jump LucyEnd' }
            }
        }
    ],

    'LucyMerchant': [
        statCheck('RIZZ', 5),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump LucyMerchantGood',
                'False': 'jump LucyMerchantBad'
            }
        }
    ],

    'LucyMerchantGood': [
        changeVar('lucyAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'lu That was kinda hot.',
        'jump LucyEnd'
    ],

    'LucyMerchantBad': [
        changeVar('lucyAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'lu *steps in* Beat it.',
        'jump LucyEnd'
    ],

    'LucyEnd': [
        'lu Tonight was fun.',
        'jump BigD_Message'
    ],

    'DateSam1': [
        'clear',
        'show scene #ff4500 with fadeIn',
        's Ready for combat?',
        's Bet 20 souls?',
        {
            Choice: {
                Dialog: 'Bet?',
                Bet: { Text: 'Bet (WIS)', Do: 'jump SamBet' },
                Pass: { Text: 'Just watch', Do: 'jump SamDate2' }
            }
        }
    ],

    'SamBet': [
        statCheck('WISDOM', 4),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump SamBetGood',
                'False': 'jump SamBetBad'
            }
        }
    ],

    'SamBetGood': [
        changeVar('samAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        's You called it! Impressive.',
        'jump SamDate2'
    ],

    'SamBetBad': [
        changeVar('samAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        's Better luck next time.',
        'jump SamDate2'
    ],

    'SamDate2': [
        's Hellhound wings?',
        {
            Choice: {
                Dialog: 'Try them?',
                Try: { Text: 'Challenge! (CON)', Do: 'jump SamWings' },
                Pass: { Text: 'Something mild', Do: 'jump SamEnd' }
            }
        }
    ],

    'SamWings': [
        statCheck('CONSTITUTION', 5),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump SamWingsGood',
                'False': 'jump SamWingsBad'
            }
        }
    ],

    'SamWingsGood': [
        changeVar('samAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        's Holy shit! Respect.',
        'jump SamEnd'
    ],

    'SamWingsBad': [
        changeVar('samAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        's HAHA! Here, drink this.',
        'jump SamEnd'
    ],

    'SamEnd': [
        's Tonight was solid.',
        'jump BigD_Message'
    ],

    'DateBelle1': [
        'clear',
        'show scene #9370db with fadeIn',
        'b Welcome!',
        'b Ancient puzzle!',
        {
            Choice: {
                Dialog: 'Solve it?',
                Solve: { Text: 'Solve (INT)', Do: 'jump BellePuzzle' },
                Watch: { Text: 'Let Belle', Do: 'jump BelleDate2' }
            }
        }
    ],

    'BellePuzzle': [
        statCheck('INTELLIGENCE', 5),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump BellePuzzleGood',
                'False': 'jump BellePuzzleBad'
            }
        }
    ],

    'BellePuzzleGood': [
        changeVar('belleAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'b Brilliant!',
        'jump BelleDate2'
    ],

    'BellePuzzleBad': [
        changeVar('belleAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'b Quite tricky!',
        'jump BelleDate2'
    ],

    'BelleDate2': [
        'b Sneak into restricted?',
        {
            Choice: {
                Dialog: 'Sneak?',
                Sneak: { Text: 'Let\'s do it! (DEX)', Do: 'jump BelleSneak' },
                No: { Text: 'Better not', Do: 'jump BelleEnd' }
            }
        }
    ],

    'BelleSneak': [
        statCheck('DEXTERITY', 4),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump BelleSneakGood',
                'False': 'jump BelleSneakBad'
            }
        }
    ],

    'BelleSneakGood': [
        changeVar('belleAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'b Exhilarating!',
        'jump BelleEnd'
    ],

    'BelleSneakBad': [
        changeVar('belleAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'b Quick, run!',
        'jump BelleEnd'
    ],

    'BelleEnd': [
        'b Absolutely delightful!',
        'jump BigD_Message'
    ],

    'DateMolly1': [
        'clear',
        'show scene #ffb6c1 with fadeIn',
        'm You came!',
        'm Pick a movie!',
        {
            Choice: {
                Dialog: 'Genre?',
                Horror: { Text: 'Horror (CON)', Do: 'jump MollyHorror' },
                Romance: { Text: 'Romance (RIZZ)', Do: 'jump MollyRomance' }
            }
        }
    ],

    'MollyHorror': [
        statCheck('CONSTITUTION', 4),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump MollyHorrorGood',
                'False': 'jump MollyHorrorBad'
            }
        }
    ],

    'MollyHorrorGood': [
        changeVar('mollyAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'm So brave!',
        'jump MollyDate2'
    ],

    'MollyHorrorBad': [
        changeVar('mollyAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'm We\'re both scared!',
        'jump MollyDate2'
    ],

    'MollyRomance': [
        statCheck('RIZZ', 5),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump MollyRomanceGood',
                'False': 'jump MollyRomanceBad'
            }
        }
    ],

    'MollyRomanceGood': [
        changeVar('mollyAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'm This is really nice.',
        'jump MollyDate2'
    ],

    'MollyRomanceBad': [
        changeVar('mollyAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'm Want more popcorn?',
        'jump MollyDate2'
    ],

    'MollyDate2': [
        'm Board game?',
        {
            Choice: {
                Dialog: 'Play?',
                Play: { Text: 'Let\'s play! (WIS)', Do: 'jump MollyGame' },
                Keep: { Text: 'Finish movie', Do: 'jump MollyEnd' }
            }
        }
    ],

    'MollyGame': [
        statCheck('WISDOM', 4),
        {
            'Conditional': {
                'Condition': function() {
                    return monogatari.storage()._lastSuccess;
                },
                'True': 'jump MollyGameGood',
                'False': 'jump MollyGameBad'
            }
        }
    ],

    'MollyGameGood': [
        changeVar('mollyAffection', 2),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✓]',
        'm Great team!',
        'jump MollyEnd'
    ],

    'MollyGameBad': [
        changeVar('mollyAffection', 1),
        'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} ✗]',
        'm Still fun!',
        'jump MollyEnd'
    ],

    'MollyEnd': [
        'm Tonight was perfect!',
        'jump BigD_Message'
    ],

    'BigD_Message': [
        'clear',
        'show scene #000000 with fadeIn',
        'y *BUZZ*',
        'y "Unknown: Having fun?"',
        'y "Unknown: Don\'t get TOO comfortable."',
        'y "Unknown: See you soon~ -D"',
        'y Who is D?',
        'centered Day 1 Complete',
        resetDailyActivities(),
        'end'
    ]
});