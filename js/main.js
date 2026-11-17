// ======================================================================
// js/main.js - Arranque: eventos iniciales, regalo diario y carga de la partida (window.onload).
// QUÉ EXPLICAR: Se carga primero la partida y solo entonces se habilita el botón Iniciar.
// ======================================================================
window.returnToMainMenu = function() {
    clearTimeout(hookTimer); clearTimeout(missedTimer); endFight(); resetFishing();
    playSound('click'); closeMenu('pauseMenu');
    document.getElementById('gameUI').classList.add('hidden'); document.getElementById('mainMenu').classList.remove('hidden'); document.getElementById('mainMenu').classList.add('flex');
    modulateAmbient(false); if(actx) actx.suspend(); 
}

document.getElementById('btnStartGame').addEventListener('click', () => {
    initAudio(); playSound('click');
    document.getElementById('mainMenu').classList.add('hidden'); document.getElementById('mainMenu').classList.remove('flex');
    document.getElementById('gameUI').classList.remove('hidden');
    const today = new Date().toDateString();
    if (state.lastDaily !== today) {
        state.dayStreak = state.lastDaily === new Date(Date.now() - 864e5).toDateString() ? state.dayStreak + 1 : 1;
        state.lastDaily = today;
        const reward = 50 * Math.min(state.dayStreak, 7);
        state.coins += reward; saveToCloud();
        showToast(`🎁 Regalo diario día ${state.dayStreak}: +${reward} 🪙`);
    }
    updateHUD();
});

// Selectores de la pantalla Personalizar: [id del input, clave en state.customization]
[['rodColorPicker', 'rod'], ['reelColorPicker', 'reel'], ['lineColorPicker', 'line'],
 ['bobberColorPicker', 'bobber'], ['waterColorPicker', 'water']].forEach(([id, key]) => {
    document.getElementById(id).addEventListener('input', e => updateCustomization(key, e.target.value));
});

window.onload = async () => {
    renderScene();
    const cloudTxt = document.getElementById('cloudStatus');
    cloudTxt.innerText = window.pixelCloud ? 'Conectando a la nube...' : 'Modo Local · falta configuración Firebase';
    try { await loadGame(); }
    finally {
        isDataLoaded = true;
        document.getElementById('btnStartGame').disabled = false;
    }
    isAudioEnabled = state.soundOn !== false;
    document.getElementById('btnToggleAudio').innerText = `Sonido: ${isAudioEnabled ? 'ON' : 'OFF'}`;
};
