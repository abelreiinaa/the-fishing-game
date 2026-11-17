// ======================================================================
// js/fishing.js - Lógica de pesca: lanzar, esperar picada, minijuego de recoger y captura.
// QUÉ EXPLICAR: Temporizadores (setTimeout) para la picada; la rareza se sortea con Math.random().
//               processCatch() calcula monedas, XP, nivel, racha y logros.
// ======================================================================
const btnFishAction = document.getElementById('btnFishAction');
const hookIndicator = document.getElementById('hookIndicator');

function triggerFishingAction() {
    if (!document.getElementById('mainMenu').classList.contains('hidden') ||
        Array.from(document.querySelectorAll('.modal-overlay')).some(m => !m.classList.contains('hidden') && m.id !== 'catchPopup')) {
        return;
    }

    initAudio();

    if (fState === 'FIGHT') { fightTap(); return; }

    if (fState === 'IDLE') {
        thrownBait = state.currentBait;
        if (state.currentBait !== 'none') {
            if (state.baitCounts[state.currentBait] > 0) {
                state.baitCounts[state.currentBait]--;
                if (state.baitCounts[state.currentBait] <= 0) {
                    state.currentBait = 'none'; showToast("Cebo agotado.");
                }
            } else { state.currentBait = 'none'; thrownBait = 'none'; }
        }
        updateHUD(); fState = 'WAITING';
        playSound('cast'); modulateAmbient(true);

        btnFishAction.innerText = 'ESPERANDO...'; btnFishAction.disabled = true; btnFishAction.classList.remove('action-btn');

        const rod = GAME_DATA.rods[state.currentRod];
        const waitTime = (Math.random() * 6000 + 4000) * rod.waitMult; // Slower wait time

        hookTimer = setTimeout(() => {
            fState = 'HOOKED';
            playSound('splash'); playSound('alert');
            hookIndicator.classList.remove('hidden');
            btnFishAction.disabled = false; btnFishAction.innerText = '¡TIRAR!'; btnFishAction.classList.add('action-btn', 'bite');

            missedTimer = setTimeout(() => {
                if (fState === 'HOOKED') { resetFishing(); state.streak = 0; updateHUD(); playSound('error'); showToast("El pez se escapó..."); }
            }, rod.catchWindow);
        }, waitTime);

    } else if (fState === 'HOOKED') {
        clearTimeout(missedTimer);

        const possible = GAME_DATA.fishes.filter(f => f.loc === state.currentLocation && GAME_DATA.baits[thrownBait].tier >= f.minTier);
        let caught = possible[0]; 
        if (possible.length > 0) {
            let roll = Math.random();
            let targetR = 'COMMON';
            if(roll > 0.98) targetR = 'LEGENDARY';
            else if(roll > 0.90) targetR = 'EPIC';
            else if(roll > 0.65) targetR = 'RARE';
            const order = ['LEGENDARY', 'EPIC', 'RARE', 'COMMON'];
            let filtered = [];
            for (let i = order.indexOf(targetR); i < order.length && filtered.length === 0; i++) {
                filtered = possible.filter(f => f.rarity === order[i]);
            }
            if(filtered.length === 0) filtered = possible;
            caught = filtered[Math.floor(Math.random() * filtered.length)];
        }

        startFight(caught);
    }
}

let fight = null;
function newFightZone() {
    fight.zs = 5 + Math.random() * (90 - fight.zone);
    const z = document.getElementById('fightZone');
    z.style.left = fight.zs + '%'; z.style.width = fight.zone + '%';
    document.getElementById('fightInfo').innerText = `¡RECOGE! ${fight.got}/${fight.need}`;
}
function fightLoop(t) {
    if (!fight) return;
    const dt = Math.min(50, t - (fight.last || t)); fight.last = t;
    fight.pos += fight.dir * fight.speed * dt / 16.7;
    if (fight.pos >= 100) { fight.pos = 100; fight.dir = -1; }
    if (fight.pos <= 0) { fight.pos = 0; fight.dir = 1; }
    document.getElementById('fightMark').style.left = fight.pos + '%';
    requestAnimationFrame(fightLoop);
}
function startFight(fish) {
    const n = { COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 }[fish.rarity];
    fight = { fish, need: n, got: 0, pos: 0, dir: 1, speed: 0.8 + n * 0.3, zone: 36 - n * 4 + GAME_DATA.rods[state.currentRod].catchWindow / 300 };
    fState = 'FIGHT';
    hookIndicator.classList.add('hidden');
    btnFishAction.classList.remove('bite'); btnFishAction.innerText = '¡RECOGER!';
    const b = document.getElementById('fightBox'); b.classList.remove('hidden'); b.classList.add('flex');
    newFightZone(); requestAnimationFrame(fightLoop);
}
function endFight() {
    fight = null;
    const b = document.getElementById('fightBox'); b.classList.add('hidden'); b.classList.remove('flex');
}
function fightTap() {
    const f = fight; if (!f) return;
    if (f.pos >= f.zs && f.pos <= f.zs + f.zone) {
        f.got++; playSound('alert');
        if (f.got >= f.need) { endFight(); resetFishing(); processCatch(f.fish); }
        else newFightZone();
    } else {
        endFight(); resetFishing(); state.streak = 0; updateHUD();
        playSound('error'); showToast('¡Se soltó el pez!');
    }
}

function resetFishing() {
    fState = 'IDLE';
    hookIndicator.classList.add('hidden');
    btnFishAction.innerText = 'LANZAR CAÑA';
    btnFishAction.classList.remove('bite'); btnFishAction.classList.add('action-btn'); btnFishAction.disabled = false;
    modulateAmbient(false);
}

btnFishAction.addEventListener('click', triggerFishingAction);
window.addEventListener('keyup', (e) => { if (e.code === 'Space') e.preventDefault(); }); // evita doble activación del botón enfocado
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (e.repeat) { e.preventDefault(); return; }
        e.preventDefault();
        const popup = document.getElementById('catchPopup');
        if (!popup.classList.contains('hidden')) closeCatchPopup();
        else triggerFishingAction();
    }
});

function checkAchievements() {
    GAME_DATA.achievements.forEach(a => {
        if(!state.notifiedAchievements.includes(a.id)) {
            let conditionMet = false;
            if(a.type === 'fish' && state.totalCaught >= a.req) conditionMet = true;
            if(a.type === 'level' && state.level >= a.req) conditionMet = true;
            if(a.type === 'rare' && state.caughtRare >= a.req) conditionMet = true;
            if(a.type === 'epic' && state.caughtEpic >= a.req) conditionMet = true;
            if(a.type === 'legendary' && state.caughtLegendary >= a.req) conditionMet = true;

            if(conditionMet) {
                state.notifiedAchievements.push(a.id);
                showToast(`🏆 ¡Logro Desbloqueado: ${a.name}!`);
                playSound('alert');
                saveToCloud();
            }
        }
    });
}

window.claimAchievement = function(id) {
    const a = GAME_DATA.achievements.find(x => x.id === id);
    if(a && state.notifiedAchievements.includes(id) && !state.claimedAchievements.includes(id)) {
        state.claimedAchievements.push(id);
        state.coins += a.reward;
        playSound('click'); showToast(`+${a.reward} 🪙`);
        saveToCloud(); renderAchievements(); updateHUD();
    }
}

function processCatch(fish) {
    playSound(`catch_${fish.rarity.toLowerCase()}`);
    const kg = +(0.7 + Math.random() * 0.8).toFixed(1);
    state.streak++; if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    const mult = 1 + Math.min(state.streak - 1, 10) * 0.1;
    const coins = Math.round(fish.val * kg * mult);
    const isRecord = kg > (state.records[fish.id] || 0);
    if (isRecord) state.records[fish.id] = kg;
    state.totalCaught++; state.coins += coins;
    state.inventory[fish.id] = (state.inventory[fish.id] || 0) + 1;

    if (fish.rarity === 'RARE') state.caughtRare++;
    if (fish.rarity === 'EPIC') state.caughtEpic++;
    if (fish.rarity === 'LEGENDARY') state.caughtLegendary++;

    state.xp += fish.xp;
    let nextXpReq = state.level * 100;
    while(state.xp >= nextXpReq) {
        state.xp -= nextXpReq; state.level++; state.coins += 50; 
        nextXpReq = state.level * 100;
        showToast(`¡Nivel Subió a ${state.level}! (+50🪙)`);
        playSound('alert');
    }

    checkAchievements();
    saveToCloud();

    const rData = GAME_DATA.rarities[fish.rarity];
    document.getElementById('catchIcon').src = fish.spriteData;
    document.getElementById('catchName').innerText = fish.name;
    document.getElementById('catchName').className = `text-base mb-2 text-shadow ${rData.class}`;
    document.getElementById('catchRarity').innerText = `${rData.name} · ${kg}kg${isRecord ? ' · ¡RÉCORD!' : ''}`;
    document.getElementById('catchTitle').innerText = state.streak > 1 ? `¡Racha x${state.streak}! +${Math.round((mult - 1) * 100)}%` : '¡Captura Exitosa!';
    document.getElementById('catchRarity').className = `text-xxs mb-4 ${rData.class}`;
    document.getElementById('catchCoins').innerText = coins;
    document.getElementById('catchXp').innerText = fish.xp;

    document.getElementById('catchPopup').classList.remove('hidden'); document.getElementById('catchPopup').classList.add('flex');
    document.getElementById('btnFishAction').parentElement.classList.add('hidden');
}

window.closeCatchPopup = function() {
    playSound('click');
    document.getElementById('catchPopup').classList.add('hidden'); document.getElementById('catchPopup').classList.remove('flex');
    document.getElementById('btnFishAction').parentElement.classList.remove('hidden');
    updateHUD();
}
