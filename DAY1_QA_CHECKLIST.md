# Hell Story Day 1 Demo QA Checklist

Use this before calling the Day 1 demo ready. This is for testing and polish only, not adding new features.

## Core route smoke test

- **Start game**: title/menu loads, music starts if expected, no console errors.
- **Name input**: player name saves and appears later as `{{player.name}}`.
- **Office intro**: office background and office music load.
- **Commute sequence**: traffic background, traffic music, and chaos overlays play in order.
- **Logo sting**: falling animation cuts to black, home-screen logo sting appears, then continues.
- **Crash landing**: Hell landing background appears, confetti overlay plays, all five characters appear.
- **Orientation**: each character introduction displays and hides correctly.
- **Stat allocation**: all buttons are reachable, confirm button enables only when points hit zero.
- **H-Phone receive**: H-Phone UI appears and can be put away.
- **Day activity loop**: each available activity spends stamina and returns to the router.
- **Night texting**: H-Phone message UI appears and date choices are reachable.
- **Chosen date route**: selected girl route plays to `BigD_Message`.
- **Ending**: `Day 1 Complete` appears and the demo ends cleanly.

## Date route checks

Test each date once from a fresh save or by using saves before night choice.

- **Lily**: sincere/flirt choice works, hotel/goodnight branch works, `sleptWithLilyNight1` only changes on upstairs path.
- **Lucy**: office/diner scenes use correct background slot and return to ending.
- **Sam**: arena/bowling scenes use correct background slot and return to ending.
- **Belle**: archive scenes use correct background slot and return to ending.
- **Molly**: workshop/axe range scenes use correct background slot and return to ending.

## Asset replacement checks

When replacing art/audio, update only the filename on the right side of the asset registry in `js/script.js`.

- **Background keys**: confirm every playable `show scene key` has a matching key in `monogatari.assets('scenes', {...})`.
- **Music keys**: confirm every playable `play music key` has a matching key in `monogatari.assets('music', {...})`.
- **SFX keys**: add sound keys only after files exist in `assets/sounds`.
- **Character sprites**: confirm all filenames in `monogatari.characters({...})` exist in `assets/characters`.
- **Logo image**: confirm `assets/images/hellstorylogo.jpg` is final or intentionally placeholder.

## Mobile checks

Test on real phone Chrome or installed fullscreen Chrome app, not only desktop emulator.

- **Title screen**: logo and buttons fit without clipping.
- **Dialogue textbox**: text is readable, left aligned, and not blocked by browser UI.
- **Choices**: all choices are tappable and wrap cleanly.
- **Stat allocation**: overlay scrolls vertically and confirm button is reachable.
- **H-Phone**: phone UI opens, closes, and does not remain stuck after Hellmazon purchase.
- **Hellmazon**: daily item can be bought once and UI cleans up afterward.
- **Landscape/short viewport**: major screens remain usable or scrollable.

## Audio checks

- **Menu/title music**: not too loud compared to story music.
- **Office music**: starts in intro and does not continue over commute unless intended.
- **Traffic music**: starts during commute and stops before home/landing transition.
- **Date music**: once final tracks are added, verify each date has the right mood.
- **SFX volume**: UI clicks/phone buzz/crash/confetti should be noticeable but not painful.

## Technical checks

Run after script edits:

```powershell
node --check js/script.js
```

Optional manual checks:

- **Console**: no red errors during a full Day 1 playthrough.
- **Saves**: saving before night choice and loading still works.
- **Refresh**: refreshing the page does not trap the game in a broken overlay.
- **Deployment**: Netlify/deployed build uses the same asset paths and has no 404s for final assets.

## Known structure note

`js/script.js` contains an older prototype script block and a later active Day 1 rewrite block. For demo edits, use the later block marked:

```js
/* ===== PLAYABLE DAY 1 REWRITE ===== */
```

The later block wins when label names are duplicated.
