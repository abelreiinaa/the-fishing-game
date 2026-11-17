// ======================================================================
// js/storage.js - Persistencia: localStorage (siempre) + Firestore (si hay conexión).
// QUÉ EXPLICAR: Gana la partida con `savedAt` más reciente. Promise.race evita esperar a la red.
//               Si algo falla, el juego sigue en modo local.
// ======================================================================
async function loadGame() {
    const local = localStorage.getItem('pixelFishingSave');
    if (local) {
        try { state = { ...defaultState, ...JSON.parse(local) }; }
        catch (error) { console.warn('Partida local corrupta, se ignora:', error); }
        repairState();
    }
    if (window.pixelCloud) {
        try {
            await Promise.race([
                window.pixelCloud.ready,
                new Promise(resolve => setTimeout(resolve, 6000))
            ]);
            if (window.pixelCloud.auth.currentUser) {
                const ref = window.pixelCloud.doc(window.pixelCloud.db, 'pixelFishing', window.pixelCloud.auth.currentUser.uid);
                const remote = await window.pixelCloud.getDoc(ref);
                if (remote.exists() && (remote.data().savedAt || 0) >= (state.savedAt || 0)) {
                    state = { ...defaultState, ...remote.data() };
                    repairState();
                    localStorage.setItem('pixelFishingSave', JSON.stringify(state));
                }
                window.pixelCloudRef = ref;
                document.getElementById('cloudStatus').innerText = 'Nube conectada';
            }
        } catch (error) {
            console.warn('Se mantiene el guardado local:', error);
        }
    }
    if (window.pixelCloud && !window.pixelCloudRef) document.getElementById('cloudStatus').innerText = 'Modo local · sin conexión con la nube';
    isDataLoaded = true;
    updateHUD();
}

function repairState() {
    if(!state.notifiedAchievements) state.notifiedAchievements = [];
    if(!state.claimedAchievements) state.claimedAchievements = [];
    if(!state.unlockedVehicles) state.unlockedVehicles = ['orilla'];
    if(!state.currentVehicle) state.currentVehicle = 'orilla';
    if(state.caughtRare === undefined) state.caughtRare = 0;
    if(state.caughtEpic === undefined) state.caughtEpic = 0;
    if(state.caughtLegendary === undefined) state.caughtLegendary = 0;
    if(!state.records) state.records = {};
    state.customization = { ...defaultState.customization, ...(state.customization || {}) };
}

async function saveToCloud() {
    if (!isDataLoaded) return; // no guardar hasta haber cargado la partida (evita pisarla)
    state.savedAt = Date.now();
    localStorage.setItem('pixelFishingSave', JSON.stringify(state));
    if (window.pixelCloud && window.pixelCloudRef) {
        try { await window.pixelCloud.setDoc(window.pixelCloudRef, state); }
        catch (error) { console.warn('No se pudo guardar en la nube:', error); }
    }
}
