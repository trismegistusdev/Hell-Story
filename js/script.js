/* global monogatari */

/*
 * HELL STORY SCRIPT GUIDE
 * -----------------------
 * This file is where most of your story lives.
 *
 * Normal narration:
 *   'This text appears with no character name.',
 *
 * Character dialogue:
 *   'li Lily says this.',
 *   'lu Lucy says this.',
 *   'b Belle says this.',
 *   's Sam says this.',
 *   'm Molly says this.',
 *   'y The player says this.',
 *
 * Story sections are labels:
 *   'SceneName': [
 *       'Text goes here',
 *       'jump NextScene'
 *   ],
 *
 * The safest place to paste new story is inside monogatari.script({ ... })
 * farther down in this file. Add a new label near the section it belongs to,
 * then jump to it from an existing scene.
 */

/* ===== MUSIC FILES =====
 * These names point to files in assets/music.
 * Example: 'office': 'office.mp3' means the script can use:
 *   'play music office with loop'
 */
monogatari.assets('music', {
    'title': 'title.mp3',
    'menu': 'menu.mp3',
    'office': 'office.mp3',
    'traffic': 'traffic.mp3'
});

/* ===== BACKGROUND SCENE FILES =====
 * These names point to files in assets/scenes.
 * To add one:
 * 1. Put the image in assets/scenes.
 * 2. Add it here like 'bedroom': 'bedroom.jpg',
 * 3. Use it below as 'show scene bedroom with fadeIn'
 */
monogatari.assets('scenes', {
    'office': 'office.jpg',
    'traffic': 'traffic.jpg'
});


/* ===== NOTIFICATIONS & MESSAGES =====
 * Optional engine popups/help messages.
 * You probably will not touch this for normal story writing.
 */
monogatari.action('Notification').notifications({
    'Welcome': { title: 'Welcome!', body: 'This is the Monogatari VN Engine', icon: '' }
});

monogatari.action('Message').messages({
    'Help': { title: 'Help', subtitle: 'Need assistance?', body: 'This game says: "You should read the documentation!"' }
});

/* ===== GAME STORAGE / VARIABLES =====
 * Storage is the game's memory: name, stats, money, affection, flags.
 * You can display a value in dialogue with {{variableName}}.
 * Example:
 *   'y I have {{money}} souls.'
 */
monogatari.storage({
    player: { name: '' },
    lilyAffection: 0, lucyAffection: 0, mollyAffection: 0, belleAffection: 0, samAffection: 0,
    receivedHPhone: false,
    STRENGTH: 1, DEXTERITY: 1, CONSTITUTION: 1, INTELLIGENCE: 1, WISDOM: 1, RIZZ: 1,
    dayStamina: 6, money: 10,
    didGymToday: false, didReadToday: false, didChillToday: false, didWorkToday: false, 
    didParkourToday: false, didPoolToday: false, didPartyToday: false,
    boughtItemToday: false,
    activeItemName: '', activeItemBuffs: {}, dailyShopItems: []
});

/* ===== CHARACTERS =====
 * Dialogue codes:
 * y = You/player, li = Lily, lu = Lucy, b = Belle, s = Sam, m = Molly.
 * Sprite images live in assets/characters.
 */
monogatari.characters({
    y: { name: 'You'},
    li: { name: 'Lily', color: '#d96f72', sprites: { normal: 'lily.png' }},
    lu: { name: 'Lucy', color: '#9797bb', sprites: { normal: 'lucy.png' } },
    b: { name: 'Belle', color: '#d96f72', sprites: { normal: 'belle.png' } },
    s: { name: 'Sam', color: '#ff989f', sprites: { normal: 'sam.png' } },
    m: { name: 'Molly', color: '#b6e9ba', sprites: { normal: 'molly.png' } }
});

/* ===== HELPER FUNCTIONS =====
 * These are reusable engine helpers. If you are only writing story, skip down
 * to MAIN SCRIPT. Use these helpers inside scenes when stats/flags change.
 */

// Adds or subtracts from a storage variable.
// Example: changeVar('lilyAffection', 1),
// Example: changeVar('money', -3),
function changeVar(varName, amount) {
    return {
        Function: {
            Apply: function() {
                const storage = monogatari.storage();
                this._oldValue = storage[varName];
                storage[varName] = (storage[varName] || 0) + amount;
                monogatari.storage(storage);
                return true;
            },
            Reverse: function() {
                const storage = monogatari.storage();
                storage[varName] = this._oldValue;
                monogatari.storage(storage);
                return true;
            }
        }
    };
}

// Sets a storage variable to one exact value.
// Example: setVar('receivedHPhone', true),
function setVar(varName, value) {
    return {
        Function: {
            Apply: function() {
                const storage = monogatari.storage();
                this._oldValue = storage[varName];
                storage[varName] = value;
                monogatari.storage(storage);
                return true;
            },
            Reverse: function() {
                const storage = monogatari.storage();
                storage[varName] = this._oldValue;
                monogatari.storage(storage);
                return true;
            }
        }
    };
}

// Runs a stat check and saves the result in _lastRoll/_lastTotal/etc.
// Example: statCheck('STRENGTH', 5),
function statCheck(statName, difficulty) {
    return {
        Function: {
            Apply: function() {
                const storage = monogatari.storage();
                const statValue = storage[statName] || 1;
                const roll = Math.floor(Math.random() * 5) + 1;
                const total = statValue + roll;
                
                Object.assign(storage, {
                    _lastRoll: roll,
                    _lastStat: statValue,
                    _lastTotal: total,
                    _lastDifficulty: difficulty,
                    _lastSuccess: total >= difficulty,
                    _lastStatName: statName
                });
                
                monogatari.storage(storage);
                return true;
            },
            Reverse: () => true
        }
    };
}

// Resets activity flags and stamina at the end of a day.
function resetDailyActivities() {
    return {
        Function: {
            Apply: function() {
                const storage = monogatari.storage();
                Object.assign(storage, {
                    didGymToday: false,
                    didReadToday: false,
                    didChillToday: false,
                    didWorkToday: false,
                    didParkourToday: false,
                    didPoolToday: false,
                    didPartyToday: false,
                    dayStamina: 3,
                    boughtItemToday: false,
                    activeItemName: '',
                    activeItemBuffs: {}
                });
                storage.dailyShopItems = pickDailyShopItems();
                monogatari.storage(storage);
                return true;
            },
            Reverse: () => true
        }
    };
}

// Sends the player to night if stamina is gone, otherwise back to day choices.
function checkStaminaAndRoute() {
    return {
        Conditional: {
            Condition: () => monogatari.storage().dayStamina <= 0,
            True: 'jump Night1Texting',
            False: 'jump DayNext'
        }
    };
}

/* ===== SHOP SYSTEM =====
 * To add an item, copy one item line and change name/price/buffs/debuffs/desc.
 * Stat names must match storage exactly:
 * STRENGTH, DEXTERITY, CONSTITUTION, INTELLIGENCE, WISDOM, RIZZ
 */
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

function pickDailyShopItems() {
    return [...SHOP_ITEMS].sort(() => Math.random() - 0.5).slice(0, 2);
}

function generateDailyShopItems() {
    const storage = monogatari.storage();
    storage.dailyShopItems = pickDailyShopItems();
    monogatari.storage(storage);
}

// Builds the stat allocation popup. This is interface code, not story text.
function showStatAllocation() {
    return {
        Function: {
            Apply: function() {
                return new Promise((resolve) => {
                    const overlay = document.createElement('div');
                    overlay.id = 'stat-allocation-overlay';
                    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center;';
                    
                    const STATS = ['STRENGTH', 'DEXTERITY', 'CONSTITUTION', 'INTELLIGENCE', 'WISDOM', 'RIZZ'];
                    const statLabels = { STRENGTH: 'STR', DEXTERITY: 'DEX', CONSTITUTION: 'CON', INTELLIGENCE: 'INT', WISDOM: 'WIS', RIZZ: 'RIZZ' };
                    
                    const statBoxes = STATS.map(stat => `
                        <div style="padding:15px; background:#2a2a2a; border-radius:5px;">
                            <p style="font-size:18px; margin-bottom:10px;"><strong>${statLabels[stat]}:</strong> <span data-stat-value="${stat}" style="color:#4ecdc4; font-size:20px; font-weight:bold;">1</span></p>
                            <button type="button" data-add="${stat}" style="padding:8px 20px; margin-right:10px; font-size:16px; cursor:pointer; background:#4ecdc4; border:none; border-radius:5px; color:#000; font-weight:bold;">+</button>
                            <button type="button" data-sub="${stat}" style="padding:8px 20px; font-size:16px; cursor:pointer; background:#ff6b6b; border:none; border-radius:5px; color:#fff; font-weight:bold;">-</button>
                        </div>
                    `).join('');
                    
                    overlay.innerHTML = `
                        <div id="stat-screen" style="padding:40px; max-width:700px; background:#1a1a1a; color:#fff; border:2px solid #888; border-radius:10px; box-shadow:0 0 30px rgba(0,0,0,0.8);">
                            <h2 style="text-align:center; margin-bottom:20px; font-size:28px;">Allocate Your Stats</h2>
                            <p style="text-align:center; font-size:18px; margin-bottom:30px;">You have <span id="points-left" style="color:#ff6b6b; font-weight:bold; font-size:24px;">10</span> points remaining</p>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:30px;">${statBoxes}</div>
                            <div style="text-align:center;">
                                <button type="button" id="confirm-stats" disabled style="padding:15px 40px; font-size:20px; background:#555; border:none; border-radius:5px; color:#fff; font-weight:bold; cursor:not-allowed;">Confirm Stats</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(overlay);
                    
                    const stats = {};
                    const storage = monogatari.storage();
                    STATS.forEach(s => stats[s] = storage[s] || 1);
                    
                    const update = () => {
                        const used = STATS.reduce((sum, s) => sum + (stats[s] - 1), 0);
                        const points = 10 - used;
                        
                        overlay.querySelector('#points-left').textContent = points;
                        
                        STATS.forEach(s => {
                            overlay.querySelector(`[data-stat-value="${s}"]`).textContent = stats[s];
                            overlay.querySelector(`[data-add="${s}"]`).disabled = points <= 0 || stats[s] >= 6;
                            overlay.querySelector(`[data-sub="${s}"]`).disabled = stats[s] <= 1;
                        });
                        
                        const confirmBtn = overlay.querySelector('#confirm-stats');
                        confirmBtn.disabled = points !== 0;
                        confirmBtn.style.background = points === 0 ? '#95e1d3' : '#555';
                        confirmBtn.style.cursor = points === 0 ? 'pointer' : 'not-allowed';
                        confirmBtn.style.color = points === 0 ? '#000' : '#fff';
                        confirmBtn.textContent = points === 0 ? 'Confirm Stats' : `Use all ${points} points`;
                    };
                    
                    STATS.forEach(s => {
                        overlay.querySelector(`[data-add="${s}"]`).addEventListener('click', () => {
                            if (stats[s] < 6) { stats[s]++; update(); }
                        });
                        overlay.querySelector(`[data-sub="${s}"]`).addEventListener('click', () => {
                            if (stats[s] > 1) { stats[s]--; update(); }
                        });
                    });
                    
                    overlay.querySelector('#confirm-stats').addEventListener('click', () => {
                        if (10 - STATS.reduce((sum, s) => sum + (stats[s] - 1), 0) !== 0) return;
                        STATS.forEach(s => storage[s] = stats[s]);
                        monogatari.storage(storage);
                        overlay.remove();
                        resolve();
                    });
                    
                    update();
                });
            },
            Reverse: function() {
                document.getElementById('stat-allocation-overlay')?.remove();
                return true;
            }
        }
    };
}

/* ===== MAIN SCRIPT / STORY FLOW =====
 * This is the main place to write your script.
 *
 * Each label is a scene/section. The format is:
 *   'LabelName': [
 *       'line of narration',
 *       'characterCode dialogue',
 *       'jump AnotherLabel'
 *   ],
 *
 * IMPORTANT:
 * - Keep a comma after each line, except the very last line inside a block can
 *   skip it. Keeping commas everywhere is usually easiest.
 * - Every label name must be unique.
 * - If you add 'jump MyNewScene', you must also create 'MyNewScene': [ ... ].
 */
monogatari.script({
    /* ===== OPENING / OFFICE INTRO =====
     * START is the first label because options.js says Label: 'Start'.
     * Put the first scene of the game here.
     */
    'Start': [
        // Engine command: stop menu music if it is playing.
        'stop music menu',
        // Engine command: show a black screen.
        'show scene #000 with fadeIn 100',
        // Engine command: start office music.
        'play music office with loop',
        // Story text begins here.
        '......',
        'show scene office with fadeIn 100',
        'Oh shit!',
        'I was asleep at work!',
        'Shit, shit, shit.....Okay play it cool, I dont think anyone saw you',
        'I just need to enter my name and log in my computer and just be chill, no one saw me....',
        'jump AskName'
    ],

    /* ===== PLAYER NAME INPUT =====
     * This asks for the player's name and saves it to player.name.
     * You can use the name later with {{player.name}}.
     */
    'AskName': [
        { Input: { Text: "What is your name?", Validation: input => input.trim().length > 0, Save: input => { const storage = monogatari.storage(); storage.player.name = input.trim(); monogatari.storage(storage); return true; }}},
        "{{player.name}}! sucessfully logged in, welcome to SystemAssest Corp internal intranet",
        'Phew......',
        'Now what was I doing? Oh yeah I had that paperwork for HR to fill out',
        "It didn't make much sense what they were asking though....Oh well, when HR says to do it, you do it I guess.......",
        "Sigh.....",
        'jump StatAllocation_Screen'
    ],

    // Shows the stat popup, then jumps to Intro.
    'StatAllocation_Screen': [showStatAllocation(), 'jump Intro'],

    /* ===== FIRST HELL ARRIVAL SCENE =====
     * This is a good example of mixing story text, music, background changes,
     * character sprites, and a choice.
     */
    'Intro': [
        "y Well at least I'm done with this shit for today",
        "y What is today anyways? Tuesday? Wednesday? If it was Friday, everyone would have made the Fri-Yay jokes.",
        "y Fuck, I need to go home. It's quitting time",
        "y Can't wait to be free",
        'show scene #000000',
        'stop music office',
        "wait 2000",
        "show scene traffic with fadeIn 100",
        "play music traffic with loop",
        "Goddamit",
        "This is not free",
        "stop music traffic",
        'show character li normal at bigLeft with fadeIn',
        'li STR: {{STRENGTH}}, DEX: {{DEXTERITY}}, RIZZ: {{RIZZ}}',
        'show scene #880808 with fadeIn',
        'li Welcome to Hell!',
        // Choice example:
        // Dialog is the question. Text is the button. Do is where it jumps.
        { Choice: { Dialog: 'li Ready?', Yes: { Text: 'Yes', Do: 'jump Scene0' }, No: { Text: 'No', Do: 'jump Scene0' }}}
    ],

    /* ===== H-PHONE GIVEN TO PLAYER =====
     * setVar('receivedHPhone', true) remembers that the player got the phone.
     */
    'Scene0': [
        'clear',
        'show scene #ff9a9a with fadeIn',
        'lu Here is your H-Phone!',
        setVar('receivedHPhone', true),
        'y Added to: HELL SQUAD',
        'jump GroupChatNight0'
    ],

    /* ===== GROUP CHAT NIGHT 0 =====
     * This whole chunk is a conversation with choices.
     *
     * To add more texting:
     * 1. Add more dialogue lines inside one of these labels, OR
     * 2. Make a new label like 'GC_Scene6': [ ... ],
     * 3. Change the previous jump to 'jump GC_Scene6'.
     */
    'GroupChatNight0': [
        'show scene #1a1a1a with fadeIn',
        'li Hey {{player.name}}!', 'm Hi!!', 'b Hello!', 's yo',
        { Choice: { Dialog: 'What do you say?', Good: { Text: 'Hey everyone!', Do: 'jump GC_Good1' }, Bad: { Text: 'Uh... hi?', Do: 'jump GC_Bad1' }}}
    ],
    // Choice result: player picked the "good" answer, so Lily affection rises.
    'GC_Good1': [changeVar('lilyAffection', 1), 'li Great attitude!', 's not bad', 'jump GC_Scene2'],
    'GC_Bad1': [changeVar('lucyAffection', 1), 'lu lol awkward much', 'jump GC_Scene2'],

    'GC_Scene2': [
        'm How do you like Hell?',
        { Choice: { Dialog: 'Response?', Good: { Text: 'You all seem cool!', Do: 'jump GC_Good2' }, Bad: { Text: 'Still processing...', Do: 'jump GC_Bad2' }}}
    ],
    'GC_Good2': [changeVar('lilyAffection', 1), changeVar('mollyAffection', 1), 'm Aww!', 'jump GC_Scene3'],
    'GC_Bad2': [changeVar('samAffection', 1), 's fair', 'jump GC_Scene3'],

    'GC_Scene3': [
        'lu wanna hit the cafe tomorrow?', 'm YES!',
        { Choice: { Dialog: 'Join them?', Good: { Text: 'I am in!', Do: 'jump GC_Good3' }, Bad: { Text: 'Maybe...', Do: 'jump GC_Bad3' }}}
    ],
    'GC_Good3': [changeVar('lucyAffection', 1), changeVar('mollyAffection', 1), 'lu nice', 'jump GC_Scene4'],
    'GC_Bad3': ['m Oh... okay!', 'jump GC_Scene4'],

    'GC_Scene4': ['s gotta bounce', 's night', 'b Goodnight!', 'jump GC_Scene5'],

    'GC_Scene5': [
        'lu yo {{player.name}}', 'lu we got your back',
        { Choice: { Dialog: 'Final message:', Good: { Text: 'Thanks everyone', Do: 'jump GC_GoodEnd' }, Bad: { Text: 'Cool', Do: 'jump GC_BadEnd' }}}
    ],
    'GC_GoodEnd': [changeVar('lucyAffection', 1), changeVar('lilyAffection', 1), 'lu anytime', 'li Goodnight!', 'jump NextMorning'],
    'GC_BadEnd': ['lu night', 'jump NextMorning'],

    /* ===== DAY SYSTEM =====
     * This starts the free-time/activity loop.
     * The player chooses daytime activities until stamina reaches 0.
     */
    'NextMorning': ['clear', 'show scene #f7f6f6 with fadeIn', 'y New day. Stamina: {{dayStamina}}', 'jump DayChoiceRouter'],
    'DayNext': ['y Stamina: {{dayStamina}}', 'jump DayChoiceRouter'],

    // Decides whether to show all day choices or hide activities already done.
    'DayChoiceRouter': [{
        Conditional: {
            Condition: () => {
                const s = monogatari.storage();
                return !s.didGymToday && !s.didReadToday && !s.didChillToday && !s.didWorkToday && !s.didParkourToday && !s.didPoolToday && !s.didPartyToday;
            },
            True: 'jump DayChoice_All',
            False: 'jump DayChoice_Filtered'
        }
    }],

    /* Dynamic filtered menu:
     * This rebuilds the daytime choice list and removes activities already done.
     * You usually do not need to edit this unless you add a new daytime activity.
     */
    'DayChoice_Filtered': [
        {
            Function: {
                Apply: function() {
                    const s = monogatari.storage();
                    const choices = { Dialog: 'What do you want to do?' };
                    
                    // To add a new activity, copy one of these lines and make a matching label below.
                    if (!s.didGymToday) choices.Gym = { Text: 'Gym (STR Check)', Do: 'jump DayGym' };
                    if (!s.didParkourToday) choices.Parkour = { Text: 'Parkour Park (DEX Check)', Do: 'jump DayParkour' };
                    if (!s.didPoolToday) choices.Pool = { Text: 'Lava Pool (CON Check)', Do: 'jump DayPool' };
                    if (!s.didReadToday) choices.Read = { Text: 'Library (INT Check)', Do: 'jump DayRead' };
                    if (!s.didChillToday) choices.Chill = { Text: 'Meditation Garden (WIS Check)', Do: 'jump DayChill' };
                    if (!s.didPartyToday) choices.Party = { Text: 'Social Club (RIZZ Check)', Do: 'jump DayParty' };
                    if (!s.didWorkToday) choices.Work = { Text: 'Work (Earn Money)', Do: 'jump DayWork' };
                    choices.CheckHPhone = { Text: 'Check H-Phone', Do: 'jump HPhone' };
                    
                    monogatari.script()['DayChoice_Dynamic'] = [{ Choice: choices }];
                    return true;
                },
                Reverse: () => true
            }
        },
        'jump DayChoice_Dynamic'
    ],

    // First daytime menu of the day. It shows every activity.
    'DayChoice_All': [{
        Choice: {
            Dialog: 'What do you want to do?',
            Gym: { Text: 'Gym (STR Check)', Do: 'jump DayGym' },
            Parkour: { Text: 'Parkour Park (DEX Check)', Do: 'jump DayParkour' },
            Pool: { Text: 'Lava Pool (CON Check)', Do: 'jump DayPool' },
            Read: { Text: 'Library (INT Check)', Do: 'jump DayRead' },
            Chill: { Text: 'Meditation Garden (WIS Check)', Do: 'jump DayChill' },
            Party: { Text: 'Social Club (RIZZ Check)', Do: 'jump DayParty' },
            Work: { Text: 'Work (Earn Money)', Do: 'jump DayWork' },
            CheckHPhone: { Text: 'Check H-Phone', Do: 'jump HPhone' }
        }
    }],

    /* ===== H-PHONE SYSTEM =====
     * This is the phone menu. It can send the player to shop/messages/socials
     * or back to the day activity menu.
     */
    'HPhone': [
        'y Money: {{money}} souls',
        { Conditional: { Condition: () => monogatari.storage().activeItemName !== '', True: 'jump HPhone_WithItem', False: 'jump HPhone_NoItem' }}
    ],

    'HPhone_WithItem': [
        'y Active Item: {{activeItemName}}',
        { Choice: {
            Dialog: 'H-Phone Menu',
            Shop: { Text: 'Browse Hell-Mazon', Do: 'jump HellMazon' },
            Messages: { Text: 'Check Messages', Do: 'jump HPhoneMessages' },
            Socials: { Text: 'Check Socials', Do: 'jump HPhoneSocials' },
            Return: { Text: 'Put Phone Away', Do: 'jump DayNext' }
        }}
    ],

    'HPhone_NoItem': [{
        Choice: {
            Dialog: 'H-Phone Menu',
            Shop: { Text: 'Browse Hell-Mazon', Do: 'jump HellMazon' },
            Messages: { Text: 'Check Messages', Do: 'jump HPhoneMessages' },
            Socials: { Text: 'Check Socials', Do: 'jump HPhoneSocials' },
            Return: { Text: 'Put Phone Away', Do: 'jump DayNext' }
        }
    }],

    'HPhoneMessages': ['y Nothing new.', 'jump HPhone'],
    'HPhoneSocials': ['y Same old stuff.', 'jump HPhone'],

    /* ===== HELL-MAZON SHOP =====
     * This section builds the shop choices from SHOP_ITEMS at the top.
     * If you only want to write story, skip this.
     */
    'HellMazon': [
        'show scene #ff4500 with fadeIn',
        'y Hell-Mazon!',
        { Conditional: { Condition: () => monogatari.storage().boughtItemToday, True: 'jump HellMazon_AlreadyBought', False: 'jump HellMazon_Shop' }}
    ],

    'HellMazon_AlreadyBought': ['y Already bought today!', 'jump HPhone'],

    'HellMazon_Shop': [
        'y Money: {{money}} souls',
        {
            Function: {
                Apply: function() {
                    const storage = monogatari.storage();
                    
                    if (!storage.dailyShopItems?.length) {
                        storage.dailyShopItems = pickDailyShopItems();
                        monogatari.storage(storage);
                    }
                    
                    const choices = { Dialog: 'Today\'s Deals' };
                    
                    storage.dailyShopItems.forEach((item, i) => {
                        const key = storage.money >= item.price ? `Item${i+1}` : `Item${i+1}Locked`;
                        choices[key] = {
                            Text: `${item.name} - ${item.price} (${storage.money >= item.price ? item.desc : 'TOO EXPENSIVE'})`,
                            Do: storage.money >= item.price ? `jump BuyItem${i+1}` : 'jump CantAfford'
                        };
                    });
                    
                    choices.Exit = { Text: 'Close', Do: 'jump HPhone' };
                    monogatari.script()['HellMazon_Dynamic'] = [{ Choice: choices }];
                    return true;
                },
                Reverse: () => true
            }
        },
        'jump HellMazon_Dynamic'
    ],

    'CantAfford': ['y Cannot afford it!', 'jump HellMazon_Shop'],

    'BuyItem1': [{
        Function: {
            Apply: () => {
                const storage = monogatari.storage();
                storage._purchasedItem = storage.dailyShopItems[0];
                monogatari.storage(storage);
                return true;
            },
            Reverse: () => true
        }
    }, 'jump ProcessPurchase'],

    'BuyItem2': [{
        Function: {
            Apply: () => {
                const storage = monogatari.storage();
                storage._purchasedItem = storage.dailyShopItems[1];
                monogatari.storage(storage);
                return true;
            },
            Reverse: () => true
        }
    }, 'jump ProcessPurchase'],

    'ProcessPurchase': [
        {
            Function: {
                Apply: function() {
                    const storage = monogatari.storage();
                    const item = storage._purchasedItem;
                    if (!item) {
                        storage._effectText = 'No item selected.';
                        monogatari.storage(storage);
                        return true;
                    }
                    
                    storage.activeItemName = item.name;
                    storage.activeItemBuffs = { buffs: item.buffs, debuffs: item.debuffs };
                    
                    [...Object.entries(item.buffs), ...Object.entries(item.debuffs)].forEach(([stat, val]) => {
                        storage[stat] = (storage[stat] || 0) + val;
                    });
                    
                    storage.boughtItemToday = true;
                    storage.money -= item.price;
                    
                    const effects = [...Object.entries(item.buffs).map(([s, v]) => `${s} +${v}`), ...Object.entries(item.debuffs).map(([s, v]) => `${s} ${v}`)];
                    storage._effectText = effects.join(', ');
                    
                    monogatari.storage(storage);
                    return true;
                },
                Reverse: () => true
            }
        },
        'show scene #8b0000 with fadeIn',
        'y PURCHASED!',
        'y Consumed: {{_purchasedItem.name}}',
        'y {{_effectText}}',
        'y Money: {{money}}',
        'jump DayNext'
    ],

    /* ===== DAY ACTIVITIES =====
     * Each activity follows this pattern:
     * 1. Show scene/background.
     * 2. Mark the activity as done today with setVar(..., true).
     * 3. Show dialogue and a choice.
     * 4. Run a stat check or choice result.
     * 5. Reduce stamina.
     * 6. Call checkStaminaAndRoute().
     */
    'DayWork': [
        'show scene #f5deb3 with fadeIn',
        setVar('didWorkToday', true),
        {
            Function: {
                Apply: () => {
                    const storage = monogatari.storage();
                    storage._workEarnings = Math.floor(Math.random() * 4) + 3;
                    storage.money += storage._workEarnings;
                    monogatari.storage(storage);
                    return true;
                },
                Reverse: () => true
            }
        },
        'y Earned {{_workEarnings}} souls!',
        changeVar('dayStamina', -1),
        checkStaminaAndRoute()
    ],

    // STR activity: Gym with Sam.
    'DayGym': [
        'show scene #000000 with fadeIn',
        setVar('didGymToday', true),
        'show character s normal at bigLeft with fadeIn',
        's Spot me?',
        { Choice: { Dialog: 'Help Sam?', Good: { Text: 'Sure! (STR)', Do: 'jump GymCheck' }, Bad: { Text: 'Too tired (-1)', Do: 'jump GymBad' }}}
    ],
    'GymCheck': [statCheck('STRENGTH', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump GymGood', False: 'jump GymFail' }}],
    'GymGood': [changeVar('samAffection', 2), changeVar('STRENGTH', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 's Damn! Nice work!', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'GymFail': [changeVar('STRENGTH', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 's Whoa! I got it.', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'GymBad': [changeVar('samAffection', -1), changeVar('STRENGTH', 1), 's Alright...', changeVar('dayStamina', -1), checkStaminaAndRoute()],

    // DEX activity: Parkour with Lucy.
    'DayParkour': [
        'show scene #000000 with fadeIn',
        setVar('didParkourToday', true),
        'show character lu normal at bigLeft with fadeIn',
        'lu Race me through the obstacle course?',
        { Choice: { Dialog: 'Race Lucy?', Good: { Text: 'You\'re on! (DEX)', Do: 'jump ParkourCheck' }, Bad: { Text: 'Just watch (-1)', Do: 'jump ParkourBad' }}}
    ],
    'ParkourCheck': [statCheck('DEXTERITY', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump ParkourGood', False: 'jump ParkourFail' }}],
    'ParkourGood': [changeVar('lucyAffection', 2), changeVar('DEXTERITY', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'lu Holy shit you\'re fast!', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'ParkourFail': [changeVar('DEXTERITY', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'lu Better luck next time!', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'ParkourBad': [changeVar('lucyAffection', -1), changeVar('DEXTERITY', 1), 'lu Boring...', changeVar('dayStamina', -1), checkStaminaAndRoute()],

    // CON activity: Lava Pool with Lily.
    'DayPool': [
        'show scene #000000 with fadeIn',
        'show character li normal at bigLeft with fadeIn',
        setVar('didPoolToday', true),
        'li 100 laps! Join me?',
        { Choice: { Dialog: 'Swim with Lily?', Good: { Text: 'Let\'s go! (CON)', Do: 'jump PoolCheck' }, Bad: { Text: 'Too hot (-1)', Do: 'jump PoolBad' }}}
    ],
    'PoolCheck': [statCheck('CONSTITUTION', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump PoolGood', False: 'jump PoolFail' }}],
    'PoolGood': [changeVar('lilyAffection', 2), changeVar('CONSTITUTION', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'li Your endurance is incredible!', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'PoolFail': [changeVar('CONSTITUTION', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'li That\'s okay, it takes practice!', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'PoolBad': [changeVar('lilyAffection', -1), changeVar('CONSTITUTION', 1), 'li Oh... okay then.', changeVar('dayStamina', -1), checkStaminaAndRoute()],

    // INT activity: Library with Belle.
    'DayRead': [
        'show scene #000000 with fadeIn',
        'show character b normal at bigLeft with fadeIn',
        setVar('didReadToday', true),
        'b Read together?',
        { Choice: { Dialog: 'Join Belle?', Good: { Text: 'Sure! (INT)', Do: 'jump ReadCheck' }, Bad: { Text: 'I saw it first (-1)', Do: 'jump ReadBad' }}}
    ],
    'ReadCheck': [statCheck('INTELLIGENCE', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump ReadGood', False: 'jump ReadFail' }}],
    'ReadGood': [changeVar('belleAffection', 2), changeVar('INTELLIGENCE', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'b Your insights are remarkable!', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'ReadFail': [changeVar('belleAffection', 1), changeVar('INTELLIGENCE', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'b These topics are dense!', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'ReadBad': [changeVar('belleAffection', -1), changeVar('INTELLIGENCE', 1), 'b Oh... okay.', changeVar('dayStamina', -1), checkStaminaAndRoute()],

    // WIS activity: Meditation with Molly.
    'DayChill': [
        'show scene #000000 with fadeIn',
        'show character m normal at bigLeft with fadeIn',        
        setVar('didChillToday', true),
        'm Meditate together?',
        { Choice: { Dialog: 'Join Molly?', Good: { Text: 'Sounds peaceful! (WIS)', Do: 'jump ChillCheck' }, Bad: { Text: 'Want to be alone (-1)', Do: 'jump ChillBad' }}}
    ],
    'ChillCheck': [statCheck('WISDOM', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump ChillGood', False: 'jump ChillFail' }}],
    'ChillGood': [changeVar('mollyAffection', 2), changeVar('WISDOM', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'm You really get it! So nice!', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'ChillFail': [changeVar('mollyAffection', 1), changeVar('WISDOM', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'm Oh... yeah?', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'ChillBad': [changeVar('mollyAffection', -1), changeVar('WISDOM', 1), 'm Oh... okay.', changeVar('dayStamina', -1), checkStaminaAndRoute()],

    // RIZZ activity: Social Club with Lucy.
    'DayParty': [
        'show scene #000000 with fadeIn',
        'show character lu normal at bigLeft with fadeIn',        
        setVar('didPartyToday', true),
        'lu Party! Chat up some demons?',
        { Choice: { Dialog: 'Socialize?', Good: { Text: 'Let\'s mingle! (RIZZ)', Do: 'jump PartyCheck' }, Bad: { Text: 'Wallflower (-1)', Do: 'jump PartyBad' }}}
    ],
    'PartyCheck': [statCheck('RIZZ', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump PartyGood', False: 'jump PartyFail' }}],
    'PartyGood': [changeVar('lucyAffection', 2), changeVar('RIZZ', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'lu Damn you\'re smooth!', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'PartyFail': [changeVar('RIZZ', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'lu Don\'t worry, I got you.', changeVar('dayStamina', -1), checkStaminaAndRoute()],
    'PartyBad': [changeVar('lucyAffection', -1), changeVar('RIZZ', 1), 'lu Come on, don\'t be boring.', changeVar('dayStamina', -1), checkStaminaAndRoute()],

    /* ===== DATE SYSTEM - NIGHT 1 =====
     * This is where the player chooses who to spend the night with.
     *
     * To add a new date option:
     * 1. Add a new button here:
     *      NewPerson: { Text: 'New Person (Place)', Do: 'jump DateNewPerson1' },
     * 2. Create a matching label below:
     *      'DateNewPerson1': [ ... ],
     */
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

    /* ===== LILY DATE =====
     * Date labels are written compactly right now, but they work the same way:
     * dialogue lines, choices, stat checks, then a jump to the next label.
     */
    'DateLily1': ['clear', 'show scene #ff6b6b with fadeIn', 'li You made it!', 'li Truth or dare?', { Choice: { Dialog: 'Choose:', Truth: { Text: 'Truth (WIS)', Do: 'jump LilyTruth' }, Dare: { Text: 'Dare (RIZZ)', Do: 'jump LilyDare' }}}],
    'LilyTruth': [statCheck('WISDOM', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump LilyTruthGood', False: 'jump LilyTruthBad' }}],
    'LilyTruthGood': [changeVar('lilyAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'li Wow... that was honest.', 'jump LilyDate2'],
    'LilyTruthBad': [changeVar('lilyAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'li Oh... okay.', 'jump LilyDate2'],
    'LilyDare': [statCheck('RIZZ', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump LilyDareGood', False: 'jump LilyDareBad' }}],
    'LilyDareGood': [changeVar('lilyAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'li You actually did it! Amazing!', 'jump LilyDate2'],
    'LilyDareBad': [changeVar('lilyAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'li Points for trying!', 'jump LilyDate2'],
    'LilyDate2': ['li Share dessert?', { Choice: { Dialog: 'Share?', Yes: { Text: 'Share (RIZZ)', Do: 'jump LilyDessert' }, No: { Text: 'Too full', Do: 'jump LilyEnd' }}}],
    'LilyDessert': [statCheck('RIZZ', 4), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump LilyDessertGood', False: 'jump LilyDessertBad' }}],
    'LilyDessertGood': [changeVar('lilyAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'li This is really nice.', 'jump LilyEnd'],
    'LilyDessertBad': [changeVar('lilyAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'li Let me help clean that.', 'jump LilyEnd'],
    'LilyEnd': ['li Tonight was wonderful!', 'jump BigD_Message'],

    // Lucy date path.
    'DateLucy1': ['clear', 'show scene #8b0000 with fadeIn', 'lu Ready for real Hell?', 'lu Drinking game?', { Choice: { Dialog: 'Join?', Join: { Text: 'Join (CON)', Do: 'jump LucyDrink' }, Watch: { Text: 'Watch', Do: 'jump LucyDate2' }}}],
    'LucyDrink': [statCheck('CONSTITUTION', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump LucyDrinkGood', False: 'jump LucyDrinkBad' }}],
    'LucyDrinkGood': [changeVar('lucyAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'lu YOOO! Beast mode!', 'jump LucyDate2'],
    'LucyDrinkBad': [changeVar('lucyAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'lu Easy there!', 'jump LucyDate2'],
    'LucyDate2': ['lu Sketchy demon approaching...', { Choice: { Dialog: 'Handle it?', Handle: { Text: 'Handle it (RIZZ)', Do: 'jump LucyMerchant' }, LetLucy: { Text: 'Let Lucy', Do: 'jump LucyEnd' }}}],
    'LucyMerchant': [statCheck('RIZZ', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump LucyMerchantGood', False: 'jump LucyMerchantBad' }}],
    'LucyMerchantGood': [changeVar('lucyAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'lu That was kinda hot.', 'jump LucyEnd'],
    'LucyMerchantBad': [changeVar('lucyAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'lu *steps in* Beat it.', 'jump LucyEnd'],
    'LucyEnd': ['lu Tonight was fun.', 'jump BigD_Message'],

    // Sam date path.
    'DateSam1': ['clear', 'show scene #ff4500 with fadeIn', 's Ready for combat?', 's Bet 20 souls?', { Choice: { Dialog: 'Bet?', Bet: { Text: 'Bet (WIS)', Do: 'jump SamBet' }, Pass: { Text: 'Just watch', Do: 'jump SamDate2' }}}],
    'SamBet': [statCheck('WISDOM', 4), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump SamBetGood', False: 'jump SamBetBad' }}],
    'SamBetGood': [changeVar('samAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 's You called it! Impressive.', 'jump SamDate2'],
    'SamBetBad': [changeVar('samAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 's Better luck next time.', 'jump SamDate2'],
    'SamDate2': ['s Hellhound wings?', { Choice: { Dialog: 'Try them?', Try: { Text: 'Challenge! (CON)', Do: 'jump SamWings' }, Pass: { Text: 'Something mild', Do: 'jump SamEnd' }}}],
    'SamWings': [statCheck('CONSTITUTION', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump SamWingsGood', False: 'jump SamWingsBad' }}],
    'SamWingsGood': [changeVar('samAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 's Holy shit! Respect.', 'jump SamEnd'],
    'SamWingsBad': [changeVar('samAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 's HAHA! Here, drink this.', 'jump SamEnd'],
    'SamEnd': ['s Tonight was solid.', 'jump BigD_Message'],

    // Belle date path.
    'DateBelle1': ['clear', 'show scene #9370db with fadeIn', 'b Welcome!', 'b Ancient puzzle!', { Choice: { Dialog: 'Solve it?', Solve: { Text: 'Solve (INT)', Do: 'jump BellePuzzle' }, Watch: { Text: 'Let Belle', Do: 'jump BelleDate2' }}}],
    'BellePuzzle': [statCheck('INTELLIGENCE', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump BellePuzzleGood', False: 'jump BellePuzzleBad' }}],
    'BellePuzzleGood': [changeVar('belleAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'b Brilliant!', 'jump BelleDate2'],
    'BellePuzzleBad': [changeVar('belleAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'b Quite tricky!', 'jump BelleDate2'],
    'BelleDate2': ['b Sneak into restricted?', { Choice: { Dialog: 'Sneak?', Sneak: { Text: 'Let\'s do it! (DEX)', Do: 'jump BelleSneak' }, No: { Text: 'Better not', Do: 'jump BelleEnd' }}}],
    'BelleSneak': [statCheck('DEXTERITY', 4), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump BelleSneakGood', False: 'jump BelleSneakBad' }}],
    'BelleSneakGood': [changeVar('belleAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'b Exhilarating!', 'jump BelleEnd'],
    'BelleSneakBad': [changeVar('belleAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'b Quick, run!', 'jump BelleEnd'],
    'BelleEnd': ['b Absolutely delightful!', 'jump BigD_Message'],

    // Molly date path.
    'DateMolly1': ['clear', 'show scene #ffb6c1 with fadeIn', 'm You came!', 'm Pick a movie!', { Choice: { Dialog: 'Genre?', Horror: { Text: 'Horror (CON)', Do: 'jump MollyHorror' }, Romance: { Text: 'Romance (RIZZ)', Do: 'jump MollyRomance' }}}],
    'MollyHorror': [statCheck('CONSTITUTION', 4), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump MollyHorrorGood', False: 'jump MollyHorrorBad' }}],
    'MollyHorrorGood': [changeVar('mollyAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'm So brave!', 'jump MollyDate2'],
    'MollyHorrorBad': [changeVar('mollyAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'm We\'re both scared!', 'jump MollyDate2'],
    'MollyRomance': [statCheck('RIZZ', 5), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump MollyRomanceGood', False: 'jump MollyRomanceBad' }}],
    'MollyRomanceGood': [changeVar('mollyAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'm This is really nice.', 'jump MollyDate2'],
    'MollyRomanceBad': [changeVar('mollyAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'm Want more popcorn?', 'jump MollyDate2'],
    'MollyDate2': ['m Board game?', { Choice: { Dialog: 'Play?', Play: { Text: 'Let\'s play! (WIS)', Do: 'jump MollyGame' }, Keep: { Text: 'Finish movie', Do: 'jump MollyEnd' }}}],
    'MollyGame': [statCheck('WISDOM', 4), { Conditional: { Condition: () => monogatari.storage()._lastSuccess, True: 'jump MollyGameGood', False: 'jump MollyGameBad' }}],
    'MollyGameGood': [changeVar('mollyAffection', 2), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€œ]', 'm Great team!', 'jump MollyEnd'],
    'MollyGameBad': [changeVar('mollyAffection', 1), 'y [Roll {{_lastRoll}}+{{_lastStat}}={{_lastTotal}} vs {{_lastDifficulty}} Ã¢Å“â€”]', 'm Still fun!', 'jump MollyEnd'],
    'MollyEnd': ['m Tonight was perfect!', 'jump BigD_Message'],

    /* ===== CURRENT ENDING =====
     * Right now every date route jumps here.
     * To continue the story, replace 'end' with 'jump YourNextDayLabel',
     * then create that new label below or above this ending.
     */
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

