// ======================================================================
// js/render.js - Dibujo de la escena en el <canvas> con requestAnimationFrame (bucle de juego).
// QUÉ EXPLICAR: Orden de dibujado: cielo -> fondo -> agua -> vehículo -> caña -> línea -> manos.
// ======================================================================
const cvs = document.getElementById('gameCanvas');
const ctx = cvs.getContext('2d', { alpha: false });
const WIDTH = 320; const HEIGHT = 180;
cvs.width = WIDTH; cvs.height = HEIGHT;
ctx.imageSmoothingEnabled = false;

let globalTime = 0;

function renderScene() {
    globalTime += 0.02; // Very slow time for relaxing feel
    const l = state.currentLocation;
    const v = state.currentVehicle;

    // Sky
    if(l === 'noruega') {
        ctx.fillStyle = '#64748b'; ctx.fillRect(0, 0, WIDTH, 30);
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(0, 30, WIDTH, 30);
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(0, 60, WIDTH, 30);
    } else if (l === 'tropico') {
        ctx.fillStyle = '#0ea5e9'; ctx.fillRect(0, 0, WIDTH, 30);
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(0, 30, WIDTH, 30);
        ctx.fillStyle = '#7dd3fc'; ctx.fillRect(0, 60, WIDTH, 30);
        // Sun
        ctx.fillStyle = '#fef08a'; ctx.fillRect(200, 20, 20, 20);
    } else if (l === 'pantano') {
        ctx.fillStyle = '#3f3f46'; ctx.fillRect(0, 0, WIDTH, 30);
        ctx.fillStyle = '#52525b'; ctx.fillRect(0, 30, WIDTH, 30);
        ctx.fillStyle = '#71717a'; ctx.fillRect(0, 60, WIDTH, 30);
    } else { // Orilla / Profundas (Sunset)
        ctx.fillStyle = '#5b537d'; ctx.fillRect(0, 0, WIDTH, 20);
        ctx.fillStyle = '#755d82'; ctx.fillRect(0, 20, WIDTH, 20);
        ctx.fillStyle = '#9b7285'; ctx.fillRect(0, 40, WIDTH, 20);
        ctx.fillStyle = '#c3877b'; ctx.fillRect(0, 60, WIDTH, 15);
        ctx.fillStyle = '#d69c73'; ctx.fillRect(0, 75, WIDTH, 15);
        // Sun
        ctx.fillStyle = '#fceea5'; ctx.fillRect(60, 50, 16, 16);
    }

    // Clouds (Slow)
    ctx.fillStyle = (l === 'pantano') ? '#52525b' : '#fff';
    ctx.globalAlpha = 0.5;
    let cloudX = (globalTime * 1) % (WIDTH + 100) - 50;
    ctx.fillRect(cloudX, 30, 40, 6); ctx.fillRect(cloudX + 10, 26, 20, 4);
    ctx.globalAlpha = 1.0;

    // Background Terrain
    if(l === 'noruega') {
        ctx.fillStyle = '#e2e8f0'; // Snowy mountains
        ctx.beginPath(); ctx.moveTo(0, 90); ctx.lineTo(80, 30); ctx.lineTo(150, 90); 
        ctx.lineTo(250, 20); ctx.lineTo(WIDTH, 90); ctx.fill();
    } else if (l === 'tropico') {
        // Far Island
        ctx.fillStyle = '#fcd34d'; ctx.beginPath(); ctx.arc(100, 90, 40, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#15803d'; ctx.fillRect(95, 60, 10, 30); // Palm trunk
        ctx.beginPath(); ctx.arc(100, 60, 20, 0, Math.PI*2); ctx.fill(); // Leaves
    } else if (l === 'pantano') {
        ctx.fillStyle = '#27272a'; // Dark silhouette
        ctx.beginPath(); ctx.moveTo(0, 90); ctx.lineTo(50, 60); ctx.lineTo(120, 90); ctx.fill();
        // Dead trees
        ctx.fillStyle = '#18181b';
        for(let i=10; i<100; i+=20) { ctx.fillRect(i, 60+(i%10), 4, 30); ctx.fillRect(i-5, 70+(i%10), 10, 2); }
    } else if (l === 'orilla') {
        // Sunset Mountains & Pines
        ctx.fillStyle = '#5b6276';
        ctx.beginPath(); ctx.moveTo(0, 90); ctx.lineTo(60, 50); ctx.lineTo(120, 70); 
        ctx.lineTo(220, 40); ctx.lineTo(WIDTH, 90); ctx.fill();
        ctx.fillStyle = '#3a4d46';
        for(let i = 0; i < WIDTH; i += 15) {
            let h = 15 + Math.sin(i)*10;
            ctx.fillRect(i + 2, 90 - h, 3, h); ctx.fillRect(i, 90 - h + 5, 7, 10);
        }
    }

    // Water
    let waterColor = state.customization.water || '#4c6a85';
    if(l === 'noruega' || l === 'profundas') waterColor = '#1e3a8a';
    if(l === 'tropico' || l === 'pantano') waterColor = state.customization.water;
    ctx.fillStyle = waterColor;
    ctx.fillRect(0, 90, WIDTH, HEIGHT - 90);

    // Water Ripples (Slow Sine Waves)
    const numRipples = 15;
    for(let i=0; i<numRipples; i++) {
        let wy = 92 + i*6;
        let offset = Math.sin(globalTime + i) * 5;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect((i*20 + globalTime*10)%WIDTH + offset, wy, 20 + i*2, 2);
    }

    // Foreground Vehicle
    if (v === 'orilla') {
        // Isometric Pier from bottom left
        ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.moveTo(0, HEIGHT); ctx.lineTo(0, 140); ctx.lineTo(100, 110); ctx.lineTo(180, HEIGHT); ctx.fill();
        ctx.fillStyle = '#4e342e'; ctx.fillRect(0, 140, 100, 2); // Border
        ctx.fillStyle = '#261410'; // Planks
        ctx.fillRect(0, 145, 110, 1); ctx.fillRect(0, 155, 130, 2); ctx.fillRect(0, 170, 160, 2);
        // Posts
        ctx.fillStyle = '#1e110d'; ctx.fillRect(80, 100, 10, 30); ctx.fillRect(20, 120, 10, 35);
    } else if (v === 'bote') {
        // Wooden Boat interior
        ctx.fillStyle = '#6b4c3a'; ctx.beginPath(); ctx.moveTo(0, HEIGHT); ctx.lineTo(40, 150); ctx.lineTo(280, 150); ctx.lineTo(WIDTH, HEIGHT); ctx.fill();
        ctx.fillStyle = '#4a3528'; ctx.fillRect(40, 150, 240, 4);
        for(let px=60; px<280; px+=50) { ctx.fillStyle = '#3a271d'; ctx.fillRect(px, 154, 3, 30); }
    } else if (v === 'barco') {
        // Metal Fishing Ship
        ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.moveTo(0, HEIGHT); ctx.lineTo(20, 140); ctx.lineTo(300, 140); ctx.lineTo(WIDTH, HEIGHT); ctx.fill();
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(0, 120, WIDTH, 5); // Railing
        for(let px=20; px<WIDTH; px+=60) ctx.fillRect(px, 125, 5, 15);
    }

    // Hands & Fishing Rod (Very calm idle movement)
    let breathY = (fState === 'IDLE' || fState === 'WAITING') ? Math.sin(globalTime) * 1.5 : 0;

    let rodColor = state.customization.rod || GAME_DATA.rods[state.currentRod].color;
    let rodStartX = 280; let rodStartY = 190 + breathY;
    let rodTipX = 160; let rodTipY = 60 + breathY;

    if(fState === 'HOOKED') {
        rodTipY = 120 + Math.sin(globalTime*50)*8;
        rodTipX = 140 + Math.random()*5; // Violent shake
    } else if (fState === 'WAITING') {
        rodTipY += 10;
    }

    // Draw segmented rod (Thick to thin)
    let segments = 5;
    let prevX = rodStartX; let prevY = rodStartY;
    for(let i=1; i<=segments; i++) {
        let t = i/segments;
        // Bezier curve interpolation for bend
        let cpX = rodStartX - 30; let cpY = rodTipY + 40;
        let curX = (1-t)*(1-t)*rodStartX + 2*(1-t)*t*cpX + t*t*rodTipX;
        let curY = (1-t)*(1-t)*rodStartY + 2*(1-t)*t*cpY + t*t*rodTipY;

        ctx.lineWidth = 10 - (t*8); ctx.strokeStyle = '#111'; // Border
        ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(curX, curY); ctx.stroke();
        ctx.lineWidth = 8 - (t*8); ctx.strokeStyle = rodColor; // Inside
        ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(curX, curY); ctx.stroke();
        ctx.lineWidth = Math.max(1, 2 - (t * 1.5)); ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath(); ctx.moveTo(prevX - 1, prevY - 1); ctx.lineTo(curX - 1, curY - 1); ctx.stroke();

        // Draw Ring
        if(i < segments) {
            ctx.fillStyle = '#fff'; ctx.fillRect(curX-2, curY-2, 4-(t*2), 6-(t*2));
        }
        prevX = curX; prevY = curY;
    }

    // Reel (Carrete)
    let reelX = rodStartX - 20; let reelY = rodStartY - 10;
    ctx.fillStyle = '#333'; ctx.fillRect(reelX-10, reelY-10, 20, 25);
    ctx.fillStyle = state.customization.reel; ctx.beginPath(); ctx.arc(reelX, reelY, 12, 0, Math.PI*2); ctx.fill();
    if(fState === 'HOOKED') { // Spinning reel
        ctx.fillStyle = '#111';
        let spinX = reelX + Math.cos(globalTime*40)*8; let spinY = reelY + Math.sin(globalTime*40)*8;
        ctx.beginPath(); ctx.arc(spinX, spinY, 4, 0, Math.PI*2); ctx.fill();
    }

    // Line & Bobber
    if (fState !== 'IDLE') {
        let bobX = 110; let bobY = 110;
        if(fState === 'HOOKED') {
            bobY += 6; bobX += Math.sin(globalTime*60)*3;
            ctx.fillStyle = '#fff'; ctx.fillRect(bobX-8, bobY, 16, 3); // Splash
        }

        ctx.lineWidth = 1; ctx.strokeStyle = state.customization.line;
        ctx.beginPath(); ctx.moveTo(rodTipX, rodTipY); ctx.lineTo(bobX, bobY); ctx.stroke();

        // Boya más detallada
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(bobX-1, bobY-7, 2, 3); // Antena
        ctx.fillStyle = '#111'; ctx.fillRect(bobX-1, bobY-4, 2, 2);    // Franja negra
        ctx.fillStyle = state.customization.bobber; ctx.fillRect(bobX-3, bobY-2, 6, 4); // Cuerpo superior de la boya
        ctx.fillStyle = '#fff'; ctx.fillRect(bobX-3, bobY+2, 6, 4);    // Cuerpo inferior blanco
        ctx.fillStyle = '#111'; ctx.fillRect(bobX-2, bobY+6, 4, 1);    // Base
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(bobX-2, bobY-1, 2, 2); // Brillo

    } else {
        // Line hanging down
        let hangX = rodTipX; let hangY = rodTipY + 40;
        ctx.lineWidth = 1; ctx.strokeStyle = state.customization.line;
        ctx.beginPath(); ctx.moveTo(rodTipX, rodTipY); ctx.lineTo(hangX, hangY); ctx.stroke();

        // Draw bait emoji & hook
        ctx.strokeStyle = '#999'; ctx.beginPath(); ctx.arc(hangX, hangY, 4, 0, Math.PI, true); ctx.stroke();
        if(state.currentBait !== 'none' && GAME_DATA.baits[state.currentBait]) {
            ctx.font = '12px Arial'; ctx.textAlign = 'center';
            ctx.fillText(GAME_DATA.baits[state.currentBait].icon, hangX, hangY+10);
        }
    }

    // Hands (Gloves)
    let handY = 140 + breathY;

    // Piel (Brazos)
    ctx.fillStyle = '#dcb394'; ctx.beginPath(); ctx.moveTo(270, 200+breathY); ctx.lineTo(200, HEIGHT); ctx.lineTo(WIDTH, HEIGHT); ctx.fill();
    ctx.fillStyle = '#dfaf8a'; ctx.beginPath(); ctx.moveTo(220, 200+breathY); ctx.lineTo(160, HEIGHT); ctx.lineTo(200, HEIGHT); ctx.fill();

    // Guante Izquierdo (sosteniendo carrete)
    ctx.fillStyle = '#3e2723'; 
    ctx.fillRect(210, handY+8, 24, 28); 
    ctx.fillStyle = '#4e342e'; 
    ctx.fillRect(212, handY+10, 20, 10);
    ctx.fillStyle = '#261410'; 
    ctx.fillRect(215, handY+10, 2, 25); 
    // Dedos rodeando el carrete
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(230, handY+14, 12, 6); 
    ctx.fillRect(230, handY+22, 10, 6); 

    // Guante Derecho (sosteniendo caña)
    ctx.fillStyle = '#3e2723'; 
    ctx.fillRect(250, handY+28, 30, 24); 
    // Pulgar
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(245, handY+28, 8, 12);
    // Resto de dedos
    ctx.fillRect(255, handY+25, 20, 8);
    ctx.fillStyle = '#261410';
    ctx.fillRect(260, handY+25, 2, 8); ctx.fillRect(267, handY+25, 2, 8);

    requestAnimationFrame(renderScene);
}
