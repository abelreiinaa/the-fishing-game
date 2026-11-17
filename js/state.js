// ======================================================================
// js/state.js - Estado de la partida (objeto `state`) y estado de la pesca (`fState`).
// QUÉ EXPLICAR: `defaultState` es el molde; `state` es una copia profunda (JSON.parse/stringify).
//               fState es una máquina de estados: IDLE -> WAITING -> HOOKED -> FIGHT -> IDLE.
// ======================================================================
const defaultState = {
    coins: 0, level: 1, xp: 0, totalCaught: 0,
    caughtRare: 0, caughtEpic: 0, caughtLegendary: 0,
    streak: 0, bestStreak: 0, records: {}, lastDaily: '', dayStreak: 0,
    currentBait: 'none', currentRod: 'bamboo', currentVehicle: 'orilla', currentLocation: 'orilla',
    unlockedRods: ['bamboo'], unlockedVehicles: ['orilla'], unlockedLocations: ['orilla'],
    baitCounts: {}, inventory: {},
    notifiedAchievements: [], claimedAchievements: [], soundOn: true,
    customization: {
        rod: '#d6a74b', reel: '#94a3b8', line: '#ffffff', bobber: '#ef4444', water: '#4c6a85'
    }
};

let state = JSON.parse(JSON.stringify(defaultState));
let isDataLoaded = false;
let fState = 'IDLE'; 
let hookTimer = null; let missedTimer = null; let thrownBait = 'none';
