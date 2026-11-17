// ======================================================================
// js/data.js - Datos del juego: peces, cañas, cebos, vehículos, zonas y logros + generación de sprites.
// QUÉ EXPLICAR: Todo el contenido es datos: añadir un pez nuevo = añadir una línea al array.
//               Los sprites se pintan desde plantillas de texto en un <canvas> (sin imágenes).
// ======================================================================
const GAME_DATA = {
    rarities: {
        COMMON: { id: 'COMMON', name: 'Común', class: 'rarity-common' },
        RARE: { id: 'RARE', name: 'Raro', class: 'rarity-rare' },
        EPIC: { id: 'EPIC', name: 'Épico', class: 'rarity-epic' },
        LEGENDARY: { id: 'LEGENDARY', name: 'Legendario', class: 'rarity-legendary' }
    },
    baits: {
        none: { id: 'none', name: 'Sin Cebo', icon: '❌', cost: 0, tier: 0 },
        bread: { id: 'bread', name: 'Miga de Pan', icon: '🍞', cost: 20, tier: 1, desc: 'Atrae Raros. Da 5 usos.' },
        worm: { id: 'worm', name: 'Gusano', icon: '🐛', cost: 80, tier: 2, desc: 'Atrae Épicos. Da 5 usos.' },
        octopus: { id: 'octopus', name: 'Pulpito', icon: '🦑', cost: 300, tier: 3, desc: 'Para Legendarios. Da 5 usos.' }
    },
    rods: {
        bamboo: { id: 'bamboo', name: 'Caña Bambú', cost: 0, waitMult: 1.0, catchWindow: 1200, desc: 'Básica.', color: '#d6a74b' },
        fiber: { id: 'fiber', name: 'Caña Fibra', cost: 500, waitMult: 0.7, catchWindow: 1800, desc: 'Pican antes. Tiempo de reacción medio.', color: '#e2e8f0' },
        carbon: { id: 'carbon', name: 'Caña Carbono', cost: 2000, waitMult: 0.5, catchWindow: 2500, desc: 'Muy rápida. Máximo tiempo de reacción.', color: '#334155' }
    },
    vehicles: {
        orilla: { id: 'orilla', name: 'A pie (Orilla)', cost: 0, icon: '🏕️', desc: 'Pesca básica desde tierra firme.' },
        bote: { id: 'bote', name: 'Bote de Madera', cost: 800, icon: '🛶', desc: 'Permite remar hacia lagos y pantanos.' },
        barco: { id: 'barco', name: 'Barco Pesquero', cost: 3000, icon: '🚢', desc: 'Diseñado para alta mar y viajes largos.' }
    },
    locations: {
        orilla: { id: 'orilla', name: 'Muelle Local', reqVeh: 'orilla', desc: 'Tranquilo y seguro para empezar.' },
        pantano: { id: 'pantano', name: 'Pantano Oscuro', reqVeh: 'bote', desc: 'Aguas turbias, peces resbaladizos.' },
        profundas: { id: 'profundas', name: 'Aguas Profundas', reqVeh: 'bote', desc: 'Alejado de la costa. Buena pesca.' },
        noruega: { id: 'noruega', name: 'Fiordos Noruegos', reqVeh: 'barco', desc: 'Aguas heladas llenas de salmón.' },
        tropico: { id: 'tropico', name: 'Arrecife Tropical', reqVeh: 'barco', desc: 'Peces exóticos bajo el sol.' }
    },
    achievements: [
        { id: 'a1', name: 'Principiante', desc: 'Pesca 10 peces en total', req: 10, type: 'fish', reward: 50 },
        { id: 'a2', name: 'Pescador Local', desc: 'Pesca 50 peces en total', req: 50, type: 'fish', reward: 200 },
        { id: 'a3', name: 'Lobo de Mar', desc: 'Pesca 200 peces en total', req: 200, type: 'fish', reward: 1000 },
        { id: 'a4', name: 'Nivel 5', desc: 'Alcanza el nivel 5', req: 5, type: 'level', reward: 150 },
        { id: 'a5', name: 'Maestro Pescador', desc: 'Alcanza el nivel 10', req: 10, type: 'level', reward: 500 },
        { id: 'a6', name: 'Suerte Azul', desc: 'Pesca 1 pez Raro', req: 1, type: 'rare', reward: 100 },
        { id: 'a7', name: 'Pesca Épica', desc: 'Pesca 1 pez Épico', req: 1, type: 'epic', reward: 300 },
        { id: 'a8', name: 'Leyenda Viva', desc: 'Pesca 1 pez Legendario', req: 1, type: 'legendary', reward: 1000 }
    ],
    fishes: [
        // Orilla
        { id: 'f1', name: 'Sardina', loc: 'orilla', rarity: 'COMMON', val: 2, xp: 5, pat: 'sardine', c1: '#8ba6b5', c2: '#cbd5e1', minTier: 0 },
        { id: 'f2', name: 'Pez Sol', loc: 'orilla', rarity: 'COMMON', val: 3, xp: 8, pat: 'fat', c1: '#d97736', c2: '#eab308', minTier: 0 },
        { id: 'f3', name: 'Trucha', loc: 'orilla', rarity: 'RARE', val: 12, xp: 20, pat: 'long', c1: '#4d7c5c', c2: '#a3c2b0', minTier: 1 },
        { id: 'f4', name: 'Carpa Koi', loc: 'orilla', rarity: 'EPIC', val: 40, xp: 60, pat: 'fat', c1: '#ef4444', c2: '#fff', minTier: 2 },
        { id: 'f5', name: 'Rana Dorada', loc: 'orilla', rarity: 'LEGENDARY', val: 150, xp: 300, pat: 'sardine', c1: '#fbbf24', c2: '#fef08a', minTier: 3 },
        // Pantano (Requiere Bote)
        { id: 'f6', name: 'Perca', loc: 'pantano', rarity: 'COMMON', val: 4, xp: 10, pat: 'fat', c1: '#65a30d', c2: '#bef264', minTier: 0 },
        { id: 'f7', name: 'Pez Gato', loc: 'pantano', rarity: 'RARE', val: 18, xp: 30, pat: 'long', c1: '#52525b', c2: '#a1a1aa', minTier: 1 },
        { id: 'f8', name: 'Bagre', loc: 'pantano', rarity: 'EPIC', val: 60, xp: 90, pat: 'epic', c1: '#3f3f46', c2: '#71717a', minTier: 2 },
        { id: 'f9', name: 'Monstruo Fango', loc: 'pantano', rarity: 'LEGENDARY', val: 250, xp: 500, pat: 'epic', c1: '#064e3b', c2: '#34d399', minTier: 3 },
        // Aguas Profundas (Requiere Bote)
        { id: 'f10', name: 'Jurel', loc: 'profundas', rarity: 'COMMON', val: 5, xp: 12, pat: 'sardine', c1: '#3b82f6', c2: '#93c5fd', minTier: 0 },
        { id: 'f11', name: 'Lucio', loc: 'profundas', rarity: 'RARE', val: 20, xp: 35, pat: 'long', c1: '#3f624d', c2: '#7c9a87', minTier: 1 },
        { id: 'f12', name: 'Atún', loc: 'profundas', rarity: 'EPIC', val: 80, xp: 120, pat: 'fat', c1: '#1d4ed8', c2: '#60a5fa', minTier: 2 },
        { id: 'f13', name: 'Calamar Gigante', loc: 'profundas', rarity: 'LEGENDARY', val: 300, xp: 600, pat: 'epic', c1: '#be123c', c2: '#fb7185', minTier: 3 },
        // Noruega (Requiere Barco)
        { id: 'f14', name: 'Arenque', loc: 'noruega', rarity: 'COMMON', val: 8, xp: 15, pat: 'sardine', c1: '#64748b', c2: '#94a3b8', minTier: 0 },
        { id: 'f15', name: 'Bacalao', loc: 'noruega', rarity: 'RARE', val: 30, xp: 45, pat: 'fat', c1: '#78716c', c2: '#d6d3d1', minTier: 1 },
        { id: 'f16', name: 'Salmón', loc: 'noruega', rarity: 'EPIC', val: 100, xp: 150, pat: 'long', c1: '#f43f5e', c2: '#fda4af', minTier: 2 },
        { id: 'f17', name: 'Leviatán Helado', loc: 'noruega', rarity: 'LEGENDARY', val: 500, xp: 1000, pat: 'epic', c1: '#38bdf8', c2: '#e0f2fe', minTier: 3 },
        // Tropico (Requiere Barco)
        { id: 'f18', name: 'Pez Payaso', loc: 'tropico', rarity: 'COMMON', val: 10, xp: 20, pat: 'fat', c1: '#ea580c', c2: '#fff', minTier: 0 },
        { id: 'f19', name: 'Mahi Mahi', loc: 'tropico', rarity: 'RARE', val: 35, xp: 55, pat: 'long', c1: '#10b981', c2: '#fde047', minTier: 1 },
        { id: 'f20', name: 'Pez Espada', loc: 'tropico', rarity: 'EPIC', val: 120, xp: 200, pat: 'long', c1: '#0284c7', c2: '#7dd3fc', minTier: 2 },
        { id: 'f21', name: 'Kraken', loc: 'tropico', rarity: 'LEGENDARY', val: 600, xp: 1200, pat: 'epic', c1: '#7e22ce', c2: '#d8b4fe', minTier: 3 }
    ]
};

const FISH_PATTERNS = {
    sardine: ["   111      ","  12221    1"," 1222221  12"," 12892211121","  12221    1","   111      "],
    fat: ["   1111     ","  122221   1"," 12222221 12"," 12892222112"," 133333331 1","  1111111   "],
    long: ["    111       ","   12221      ","  1222221111 1"," 1228922222212","  1333333333 1","   111111111  "],
    epic: ["    1       ","   121  1   ","  12221121  "," 12892222211","  13333332 1","   111221   ","      11    "]
};

function generateFishSprite(patternName, colorMain, colorAlt) {
    const pattern = FISH_PATTERNS[patternName] || FISH_PATTERNS.sardine;
    const c = document.createElement('canvas');
    c.width = pattern[0].length; c.height = pattern.length;
    const ctx = c.getContext('2d');
    for(let y=0; y<pattern.length; y++) {
        for(let x=0; x<pattern[y].length; x++) {
            const char = pattern[y][x];
            if (char === '1') ctx.fillStyle = '#111'; // Border
            else if (char === '2') ctx.fillStyle = colorMain;
            else if (char === '3') ctx.fillStyle = colorAlt;
            else if (char === '8') ctx.fillStyle = '#fff'; // Eye white
            else if (char === '9') ctx.fillStyle = '#000'; // Pupil
            else continue;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    return c.toDataURL();
}

GAME_DATA.fishes.forEach(f => f.spriteData = generateFishSprite(f.pat, f.c1, f.c2));
