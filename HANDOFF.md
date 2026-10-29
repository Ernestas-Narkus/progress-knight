HANDOFF

Script order: boot, HackTimer, content, classes, requirements, game, ui, save, main (classic scripts, no modules, opened from disk)

HANDLERS (never rename, keep as `function` declarations): ['exportGameData', 'importGameData', 'rebirthOne', 'rebirthTwo', 'resetGameData', 'setAutoPause', 'setLightDarkMode', 'setPause', 'setSpeedMultiplier', 'setStickySidebar', 'setTab', 'setTimeWarping']

Done so far:
P1 done: requirements is now a global `var requirements` (declared in requirements.js), not part of gameData or the save. `buildRequirements()` returns the name -> Requirement map, copied verbatim from the old main.js block. main.js sets `requirements = buildRequirements()` after rows and entity data exist and before `loadGameData()`. `tempData` is removed.
All `gameData.requirements` uses are replaced with `requirements` in game.js (isUnlocked, autoPromote, rebirthReset) and ui.js (updateRequiredRows, hideEntities). In updateRequiredRows the locals were renamed to `entityRequirement` and `requirementList` so they no longer shadow the global.
save.js rewritten. Constants: SAVE_KEY='cultivationJourneySave', LEGACY_KEY='gameDataSave' (never deleted), SAVE_VERSION=1, RENAMES={}. Save API = saveGameData / loadGameData / importGameData / exportGameData / resetGameData, plus buildSaveObject / validateSave(obj) -> {ok, errors[]} / migrateSave(obj) / applySave(obj).
Save format is plain JSON {v, coins, days, evil, paused, timeWarpingEnabled, speedMultiplier, martialRank, cultivationRank, rebirthOneCount, rebirthTwoCount, settings, loadouts, collapsedCategories, tasks:{name:{level,maxLevel,xp}}, unlocked:[names], current:{job, skill, property, misc:[names]}}.
applySave mutates gameData, taskData and itemData in place and sets requirements[name].completed from `unlocked`. Corrupt or invalid saves are copied to SAVE_KEY+'_corrupt_'+Date.now() and a fresh game starts, with showStatus giving the reason. resetGameData uses confirm() and removes only SAVE_KEY and LEGACY_KEY.

Known TODOs left on purpose: rank reset policy in rebirthReset; applyMultipliers rounding; checkSkillSkipped reads DOM
Also open: checkSkillSkipped is declared twice in game.js with identical bodies; assignMethods and replaceSaveDict in save.js are no-op stubs kept for old callers; the left-panel quick task display (requirement "Quick task display", age 20) was reported not showing the current job and skill, and is unresolved because the HTML was not available.

