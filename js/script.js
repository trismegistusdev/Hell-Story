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
    money: 0
});
/* CHARACTERS =================================================================================================================================================*/
monogatari.characters({
    y: { name: 'You' },
    li: { name: 'Lily',
            sprites: {
            normal: 'lily.png', // The file name of the sprite
            happy: 'notafileyet.png' //dont have one yet
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
        'y THIS IS WHERE THE INTRO WITH THE WORK INTRO GOES',
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
        'li Your Strength is {{STRENGTH}}, Dexterity is {{DEXTERITY}}, and Rizz is {{RIZZ}}.',
        'show scene #add8e6 with fadeIn',
        'y THIS IS WHERE THE INTRO WITH THE CAR CHASE AND BANANA PEEL GAG GOES HERE THE PC DIES',
        'show scene #880808 with fadeIn',
        'THIS IS WHERE THE INTRO WHERE YOU CRASH INTO THE ANNOUNCERS TABLE AND THEY SHOW YOU AROUND HELL AND TAKE YOU TO THE HELLIDAY INN',
        {
            Choice: {
                Dialog: 'li Welcoem to Hell! Are you ready>',
                Yes: { Text: 'Yes', Do: 'jump YesBranch' },
                No: { Text: 'No', Do: 'jump NoBranch' }
            }
        }
    ],

    'YesBranch': [
        'lu Awesome!',
        'jump Scene0'
    ],

    'NoBranch': [
        'li Too bad!',
        'jump Scene0'
    ],

    'Scene0': [
        'clear',
        'show scene #ff9a9a with fadeIn',
        'lu Welcome to Hell! Here is your H Phone!',
        setVar('receivedHPhone', true),
        'lu Now choose who to text tonight.',
        {
            Choice: {
                Dialog: 'Who do you text?',
                Lily: { Text: 'Lily', Do: 'jump LilyNight0' },
                Lucy: { Text: 'Lucy', Do: 'jump LucyNight0' },
                Belle: { Text: 'Belle', Do: 'jump BelleNight0' },
                Sam: { Text: 'Sam', Do: 'jump SamNight0' },
                Molly: { Text: 'Molly', Do: 'jump MollyNight0' }
            }
        }
    ],

    'LilyNight0': [
        'li Hey, it is me. I was just about to go to sleep.',
        'y What do I say to her?',
        {
            Choice: {
                Dialog: 'Choose your reply.',
                //
                //
                //   THIS IS WHERE THE "DICE ROLL" PLUS YOUR STAT FOR THE STAT IT TELLLS YOU THE VAGUE HINT OF
                //
                //
                Good: { Text: 'Hope you have sweet dreams! (+1)', Do: 'jump LilyGoodReply' },
                Bad: { Text: 'Did you miss me yet? (-1)', Do: 'jump LilyBadReply' }
            }
        }
    ],

    'LucyNight0': [
        'lu Hey, are you awake?',
        'y What do I say to her?',
        {
            Choice: {
                Dialog: 'Choose your reply.',
                //
                //
                //   THIS IS WHERE THE "DICE ROLL" PLUS YOUR STAT FOR THE STAT IT TELLLS YOU THE VAGUE HINT OF
                //
                //
                Good: { Text: 'Ask if she needs anything (+1)', Do: 'jump LucyGoodReply' },
                Bad: { Text: "Just go back to sleep, I'm busy. (-1)", Do: 'jump LucyBadReply' }
            }
        }
    ],

    'BelleNight0': [
        'b Hey! You settling in okay?',
        'y What do I say to her?',
        {
            Choice: {
                Dialog: 'Choose your reply.',
                //
                //
                //   THIS IS WHERE THE "DICE ROLL" PLUS YOUR STAT FOR THE STAT IT TELLLS YOU THE VAGUE HINT OF
                //
                //
                Good: { Text: 'Yeah, this place is interesting! (+1)', Do: 'jump BelleGoodReply' },
                Bad: { Text: 'This place sucks. (-1)', Do: 'jump BelleBadReply' }
            }
        }
    ],

    'SamNight0': [
        's Hey. You awake?',
        'y What do I say to him?',
        {
            Choice: {
                Dialog: 'Choose your reply.',
                //
                //
                //   THIS IS WHERE THE "DICE ROLL" PLUS YOUR STAT FOR THE STAT IT TELLLS YOU THE VAGUE HINT OF
                //
                //
                Good: { Text: "Yeah, what's up? (+1)", Do: 'jump SamGoodReply' },
                Bad: { Text: "I'm tired. (-1)", Do: 'jump SamBadReply' }
            }
        }
    ],

    'MollyNight0': [
        'm Hey, it is me! I wanted to tell you something.',
        'y What do I say to her?',
        {
            Choice: {
                Dialog: 'Choose your reply.',
                //
                //
                //   THIS IS WHERE THE "DICE ROLL" PLUS YOUR STAT FOR THE STAT IT TELLLS YOU THE VAGUE HINT OF
                //
                //
                Good: { Text: 'Ask what she wanted to say (+1)', Do: 'jump MollyGoodReply' },
                Bad: { Text: "I am not interested, Molly. (-1)", Do: 'jump MollyBadReply' }
            }
        }
    ],

    'LilyGoodReply': [ changeVar('lilyAffection', 1), 'li Thanks! That means a lot to me.', 'jump NextMorning' ],
    'LilyBadReply': [ changeVar('lilyAffection', -1), 'li Oh... okay then.', 'jump NextMorning' ],
    'LucyGoodReply': [ changeVar('lucyAffection', 1), 'lu You are so thoughtful!', 'jump NextMorning' ],
    'LucyBadReply': [ changeVar('lucyAffection', -1), 'lu Fine, whatever.', 'jump NextMorning' ],
    'BelleGoodReply': [ changeVar('belleAffection', 1), 'b That is the spirit!', 'jump NextMorning' ],
    'BelleBadReply': [ changeVar('belleAffection', -1), 'b Well, that is a bummer...', 'jump NextMorning' ],
    'SamGoodReply': [ changeVar('samAffection', 1), 's Cool, just wanted to chat.', 'jump NextMorning' ],
    'SamBadReply': [ changeVar('samAffection', -1), 's Alright, see you tomorrow.', 'jump NextMorning' ],
    'MollyGoodReply': [ changeVar('mollyAffection', 1), 'm Oh! I knew you would want to hear!', 'jump NextMorning' ],
    'MollyBadReply': [ changeVar('mollyAffection', -1), 'm Oh... okay. Sorry.', 'jump NextMorning' ],

    'NextMorning': [
        'clear',
        'show scene #f7f6f6 with fadeIn',
        'li The next day begins...',
        'y I wake up to the sound of my alarm. Time to decide how to spend the day.',
        'li The sun is shining brightly.',
        {
            Choice: {
                Dialog: 'What do you want to do today?',
                Gym: { Text: 'Go to the Gym (Fitness Check)', Do: 'jump DayGym' },
                Read: { Text: 'Stay in and Read (Knowledge Check)', Do: 'jump DayRead' },
                Chill: { Text: 'Chill at Home (Relaxation Check)', Do: 'jump DayChill' },
                CheckHPhone: { Text: 'Check H-Phone', Do: 'jump HPhone' }
            }
        }
    ],

    'DayNext': [
        'y You have {{dayStamina}} stamina left.',
        {
            Choice: {
                Dialog: 'What do you want to do today?',
                Gym: { Text: 'Go to the Gym (Fitness Check)', Do: 'jump DayGym' },
                Read: { Text: 'Stay in and Read (Knowledge Check)', Do: 'jump DayRead' },
                Chill: { Text: 'Chill at Home (Relaxation Check)', Do: 'jump DayChill' },
                CheckHPhone: { Text: 'Check H-Phone', Do: 'jump HPhone' }
            }
        }
    ],

    'HPhone': [
        'li You open your H-Phone. There are a few unread notifications.',
        'li The time is 9:00 AM.',
        {
            Choice: {
                Dialog: 'What do you want to check?',
                App1: { Text: 'View Messages', Do: 'jump HPhoneMessages' },
                App2: { Text: 'Check Socials', Do: 'jump HPhoneSocials' },
                Return: { Text: 'Put Phone Away (Return to Day)', Do: 'jump DayNext' }
            }
        }
    ],

    'HPhoneMessages': [ 'li You check your messages... nothing new.', 'jump DayNext' ],
    'HPhoneSocials': [ 'lu You check social media... same old stuff.', 'jump DayNext' ],

    'DayGym': [
        'li You head to the gym and work up a sweat.',
        //////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////
        'STATIC NON-RANDOM EVENT WITH BINARY VAGUE CHOICE FOR STAT ALTERATION GOES HERE',
        //////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////
        'y (Stamina reduced)',
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
        'li You spend time reading and expanding your mind.',
        //////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////
        'STATIC NON-RANDOM EVENT WITH BINARY VAGUE CHOICE FOR STAT ALTERATION GOES HERE',
        //////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////
        'y (Stamina reduced)',
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
        'li You relax at home and unwind.',
        //////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////
        'STATIC NON-RANDOM EVENT WITH BINARY VAGUE CHOICE FOR STAT ALTERATION GOES HERE',
        //////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////
        'y (Stamina reduced)',
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
        'y It is getting late. I am too tired to do anything else today.',
        'y The sun has set. I have just enough energy to send one text before bed.',
        {
            Choice: {
                Dialog: 'Who do you want to text?',
                Lily: { Text: 'Text Lily', Do: 'jump TextLily1' },
                Lucy: { Text: 'Text Lucy', Do: 'jump TextLucy1' },
                Sam: { Text: 'Text Sam', Do: 'jump TextSam1' },
                Belle: { Text: 'Text Belle', Do: 'jump TextBelle1' },
                Molly: { Text: 'Text Molly', Do: 'jump TextMolly1' }
            }
        }
    ],
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
    // NEED BINARY REPLAY OPTIONS FOR STAT CHANGE HERE FOR EACH 
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
    'TextLily1': [ 'y Hey Lily, thanks for the welcome today.', 'li Of course! I hope you sleep well!', 'li See you tomorrow! <3', 'jump Night1Ending' ],
    'TextLucy1': [ 'y Hey Lucy. You awake?', 'lu Yeah. Just scrolling. You need something?', 'y Just saying goodnight.', 'lu Oh. Night.', 'jump Night1Ending' ],
    'TextSam1': [ 'y Yo Sam.', 's Yo. What is up?', 'y Just heading to bed. Long day.', 's Tell me about it. Catch you later.', 'jump Night1Ending' ],
    'TextBelle1': [ 'y Hi Belle!', 'b Hiiii! Enjoying your first night?', 'y Yeah, it is interesting here.', 'b Glad to hear it! Sweet dreams!', 'jump Night1Ending' ],
    'TextMolly1': [ 'y Hey Molly.', 'm Oh! You texted me!', 'm I was just thinking about you!', 'm Sleep tight, okay?', 'jump Night1Ending' ],

    'Night1Ending': [
        'y I put my phone on the charger.',
        'y Darkness takes me as I close my eyes.',
        'THIS IS WHERE YOU GET THE TEXT FROM THE DEVIL',
        'centered Day 1 Complete',
        'end'
    ]
});