// ======================================================================
// js/audio.js - Sonido con la Web Audio API: osciladores y ruido filtrado, sin archivos de audio.
// QUÉ EXPLICAR: playTone() crea un oscilador + ganancia; playSound() mapea eventos a sonidos.
// ======================================================================
// --- Audio System ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let actx; let isAudioEnabled = true; let ambientGain = null;

function initAudio() {
    if (!isAudioEnabled) return;
    if (!actx) {
        actx = new AudioContext();
        createAmbientNoise();
    }
    if (actx.state === 'suspended') actx.resume();
}

function playTone(freq, type, duration, vol = 0.1, sweep = false) {
    if (!isAudioEnabled || !actx) return;
    const osc = actx.createOscillator(); const gain = actx.createGain();
    osc.type = type;
    if (sweep) {
        osc.frequency.setValueAtTime(freq, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 2, actx.currentTime + duration);
    } else { osc.frequency.setValueAtTime(freq, actx.currentTime); }
    gain.gain.setValueAtTime(vol, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + duration);
    osc.connect(gain); gain.connect(actx.destination);
    osc.start(); osc.stop(actx.currentTime + duration);
}

function createAmbientNoise() {
    if(!actx) return;
    const bufferSize = actx.sampleRate * 2;
    const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const noise = actx.createBufferSource(); noise.buffer = buffer; noise.loop = true;
    const filter = actx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 300;
    ambientGain = actx.createGain(); ambientGain.gain.value = 0.02; // Very quiet background
    noise.connect(filter); filter.connect(ambientGain); ambientGain.connect(actx.destination);
    noise.start();
}

function modulateAmbient(isFishing) {
    if(ambientGain && actx) ambientGain.gain.setTargetAtTime(isFishing ? 0.05 : 0.02, actx.currentTime, 0.5);
}

function playSound(name) {
    initAudio();
    switch(name) {
        case 'click': playTone(400, 'square', 0.1, 0.05); break;
        case 'cast': playTone(250, 'sine', 0.4, 0.1, true); break;
        case 'splash': 
            if(actx) {
                const osc = actx.createOscillator(); const g = actx.createGain();
                osc.type = 'square'; osc.frequency.setValueAtTime(100, actx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(10, actx.currentTime + 0.3);
                g.gain.setValueAtTime(0.3, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.3);
                osc.connect(g); g.connect(actx.destination);
                osc.start(); osc.stop(actx.currentTime + 0.3);
            } break;
        case 'alert': playTone(880, 'square', 0.1, 0.1); setTimeout(()=>playTone(1200, 'square', 0.15, 0.1), 100); break;
        case 'error': playTone(150, 'sawtooth', 0.4, 0.1); break;
        case 'catch_common': playTone(500, 'square', 0.2); break;
        case 'catch_rare': playTone(600, 'square', 0.1); setTimeout(()=>playTone(800, 'square', 0.2), 100); break;
        case 'catch_epic': playTone(600, 'square', 0.1); setTimeout(()=>playTone(800, 'square', 0.1), 100); setTimeout(()=>playTone(1200, 'square', 0.3), 200); break;
        case 'catch_legendary': playTone(800, 'sine', 0.1); setTimeout(()=>playTone(1000, 'sine', 0.1), 100); setTimeout(()=>playTone(1200, 'sine', 0.1), 200); setTimeout(()=>playTone(1600, 'sine', 0.5), 300); break;
    }
}

window.toggleAudio = function() {
    isAudioEnabled = !isAudioEnabled;
    state.soundOn = isAudioEnabled; saveToCloud(); // el sonido se recuerda
    if(isAudioEnabled) initAudio(); else if(actx) actx.suspend();
    document.getElementById('btnToggleAudio').innerText = `Sonido: ${isAudioEnabled ? 'ON' : 'OFF'}`;
    playSound('click');
}
