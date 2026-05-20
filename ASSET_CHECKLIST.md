# Hell Story Day 1 Asset Checklist

Use this as the plug-and-play list for replacing placeholder art/audio during Day 1 polish.

## Background art

Put scene files in `assets/scenes`, then update the matching filename in `js/script.js` inside `monogatari.assets('scenes', {...})`.

- **`office`**: opening call center / cubicle office.
- **`traffic`**: rainy highway commute.
- **`hellLanding`**: crash landing / girls surround player / general Hell plaza placeholder.
- **`hellOrientation`**: orientation or intake office.
- **`hphoneChat`**: H-Phone or group chat background.
- **`hellMorning`**: morning/free-time hub.
- **`hellmazon`**: Hellmazon shop/purchase screen background.
- **`dayWork`**: work/money activity.
- **`dayGym`**: Sam strength activity.
- **`dayParkour`**: Lucy dexterity activity.
- **`dayPool`**: Lily constitution/lava pool activity.
- **`dayLibrary`**: Belle intelligence/library activity.
- **`dayMeditation`**: Molly wisdom/meditation activity.
- **`daySocialClub`**: Lucy/Rizz social activity.
- **`dateLilyRoom`**: Lily date location.
- **`dateLucyLounge`**: Lucy date location.
- **`dateSamArena`**: Sam date location.
- **`dateBelleArchive`**: Belle date location.
- **`dateMollyWorkshop`**: Molly date location.

## Character sprites

Put replacement sprites in `assets/characters`, then update `monogatari.characters({...})` in `js/script.js` only if the filenames change.

- **Lily**: `lily.png`
- **Lucy**: `lucy.png`
- **Belle**: `belle.png`
- **Sam**: `sam.png`
- **Molly**: `molly.png`

## Music

Put music files in `assets/music`, then update the matching filename in `monogatari.assets('music', {...})`.

- **`title`**: title screen music.
- **`menu`**: menus / H-Phone / texting.
- **`office`**: office intro.
- **`traffic`**: commute chaos.
- **`hellAmbient`**: Hell landing/orientation ambience.
- **`dayFreeTime`**: free-time activity loop.
- **`nightText`**: night texting route selection.
- **`dateLily`**: Lily date music.
- **`dateLucy`**: Lucy date music.
- **`dateSam`**: Sam date music.
- **`dateBelle`**: Belle date music.
- **`dateMolly`**: Molly date music.

## SFX

Put SFX files in `assets/sounds`. The sound registry is currently empty in `js/script.js` so the game will not request missing files yet.

Suggested future keys:

- **`uiClick`**: menu/H-Phone click.
- **`phoneBuzz`**: H-Phone notification.
- **`impact`**: crash landing/table smash.
- **`confetti`**: confetti burst.
- **`cash`**: Hellmazon purchase.
- **`glitch`**: commute reality glitch.
- **`fireWhoosh`**: Hell transitions.

## Logo/title

- **Home/cinematic logo image**: `assets/images/hellstorylogo.jpg`
- **Hell landing placeholder duplicate**: `assets/images/hell_landing_bg_placeholder.jpg`

## Recommended asset sizes

- **Backgrounds**: 1920x1080 JPG/WebP/PNG.
- **Character sprites**: transparent PNG, roughly 1200-1800px tall.
- **Music**: MP3 or OGG, normalized volume, loop-friendly where possible.
- **SFX**: short MP3/OGG/WAV, trimmed silence.

## Replacement workflow

1. Drop the finished file into the correct `assets` folder.
2. Keep the key name the same in the story.
3. Change only the filename in the asset registry at the top of `js/script.js`.
4. Run `node --check js/script.js` after script edits.
5. Test the Day 1 path on desktop and real phone Chrome.
