// ======================================================================
// js/ui.js - Interfaz: HUD, avisos, menús (tienda, mochila, viajes, logros, personalizar).
// QUÉ EXPLICAR: Los menús se rellenan con innerHTML desde GAME_DATA; equipItem() cambia el equipo.
// ======================================================================
function updateHUD() {
    document.getElementById('hudCoins').innerText = state.coins;
    document.getElementById('hudStreak').innerText = state.streak > 1 ? `🔥 Racha x${state.streak} (+${Math.min((state.streak - 1) * 10, 100)}%)` : '';
    document.getElementById('hudLevel').innerText = state.level;
    document.getElementById('hudXpBar').style.width = Math.min(100, (state.xp / (state.level * 100)) * 100) + '%';
}

let toastTID;
function showToast(msg) {
    const t = document.getElementById('toastMessage'); t.innerText = msg; t.classList.add('show');
    clearTimeout(toastTID); toastTID = setTimeout(() => t.classList.remove('show'), 3000);
}

window.openMenu = function(id) {
    playSound('click');
    document.getElementById(id).classList.remove('hidden'); document.getElementById(id).classList.add('flex');
    if(id === 'shopMenu') renderShop('baits');
    if(id === 'inventoryMenu') renderInventory();
    if(id === 'travelMenu') renderTravel();
    if(id === 'achievementsMenu') renderAchievements();
    if(id === 'customizeMenu') renderCustomization();
}
window.closeMenu = function(id) {
    playSound('click');
    document.getElementById(id).classList.add('hidden'); document.getElementById(id).classList.remove('flex');
    updateHUD(); saveToCloud();
}

function renderCustomization() {
    const customization = state.customization;
    document.getElementById('rodColorPicker').value = customization.rod;
    document.getElementById('reelColorPicker').value = customization.reel;
    document.getElementById('lineColorPicker').value = customization.line;
    document.getElementById('bobberColorPicker').value = customization.bobber;
    document.getElementById('waterColorPicker').value = customization.water;
}

function updateCustomization(key, value) {
    state.customization[key] = value; // se guarda al cerrar el menú (closeMenu)
}

window.resetCustomization = function() {
    state.customization = { ...defaultState.customization };
    renderCustomization();
    saveToCloud();
    showToast('Colores restaurados.');
}

window.switchShopTab = function(tab) { playSound('click'); renderShop(tab); }

function renderShop(tab) {
    ['baits', 'rods', 'vehicles'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if(t === tab) {
            btn.classList.add('bg-emerald-700', 'border-white');
            btn.classList.remove('bg-gray-800');
        } else {
            btn.classList.add('bg-gray-800');
            btn.classList.remove('bg-emerald-700', 'border-white');
        }
    });
    document.getElementById('shopCoins').innerText = state.coins;
    const content = document.getElementById('shopContent'); content.innerHTML = '';

    const items = GAME_DATA[tab];
    Object.values(items).forEach(item => {
        if(item.id === 'none') return;
        let isUnlocked = false; let btnTxt = 'Comprar';
        if (tab === 'baits') btnTxt = 'Comprar (x5)';
        else if (tab === 'rods') isUnlocked = state.unlockedRods.includes(item.id);
        else if (tab === 'vehicles') isUnlocked = state.unlockedVehicles.includes(item.id);

        const canAfford = state.coins >= item.cost;
        const div = document.createElement('div');
        div.className = 'bg-[#111] border-2 border-gray-600 p-2 flex justify-between items-center';
        div.innerHTML = `
            <div class="flex-1 pr-2">
                <div class="text-xs text-white">${item.icon || '🎣'} ${item.name}</div>
                <div class="text-xxs text-gray-400 mt-1">${item.desc}</div>
            </div>
            <div class="flex flex-col items-end min-w-[60px]">
                ${isUnlocked ? '<span class="text-green-500 text-xxs">Adquirido</span>' : 
                  `<div class="text-yellow-300 text-xxs mb-1">${item.cost}🪙</div>
                   <button onclick="buyItem('${tab}', '${item.id}',${item.cost})" class="pixel-btn text-xxs p-1 ${canAfford?'bg-blue-600':'bg-gray-600'}" ${canAfford?'':'disabled'}>${btnTxt}</button>`
                }
            </div>`;
        content.appendChild(div);
    });
}

window.buyItem = function(cat, id, cost) {
    if(state.coins >= cost) {
        state.coins -= cost; playSound('click');
        if (cat === 'baits') { state.baitCounts[id] = (state.baitCounts[id] || 0) + 5; showToast(`+5 ${GAME_DATA.baits[id].name}`); } 
        else if (cat === 'rods') { state.unlockedRods.push(id); equipItem('rods', id); }
        else if (cat === 'vehicles') { state.unlockedVehicles.push(id); equipItem('vehicles', id); }
        saveToCloud(); renderShop(cat);
    }
}

function renderTravel() {
    document.getElementById('currentTravelVeh').innerText = GAME_DATA.vehicles[state.currentVehicle].name;
    const content = document.getElementById('travelContent'); content.innerHTML = '';

    Object.values(GAME_DATA.locations).forEach(loc => {
        if(loc.reqVeh !== state.currentVehicle) return; // Only show locations for current vehicle
        const isEquipped = state.currentLocation === loc.id;

        const div = document.createElement('div');
        div.className = `border-2 p-3 flex flex-col gap-2 ${isEquipped ? 'bg-sky-900 border-sky-400' : 'bg-[#111] border-gray-600'}`;

        div.innerHTML = `
            <div class="text-sm text-white font-bold text-shadow">🗺️ ${loc.name}</div>
            <div class="text-xs text-gray-400 mb-1">${loc.desc}</div>
            <div class="mt-auto">
                ${isEquipped ? '<span class="text-green-400 text-xs font-bold text-shadow">¡ESTÁS AQUÍ!</span>' : 
                  `<button onclick="equipItem('locations', '${loc.id}')" class="pixel-btn bg-sky-600 text-xs py-2 w-full">Viajar a Zona</button>`}
            </div>`;
        content.appendChild(div);
    });
    if(content.innerHTML === '') content.innerHTML = '<div class="text-xs text-gray-400 text-center mt-4">No hay más rutas para este vehículo.</div>';
}

function renderAchievements() {
    const content = document.getElementById('achievementsContent'); content.innerHTML = '';
    GAME_DATA.achievements.forEach(a => {
        const isNotified = state.notifiedAchievements.includes(a.id);
        const isClaimed = state.claimedAchievements.includes(a.id);

        let prog = 0;
        if(a.type === 'fish') prog = state.totalCaught;
        else if(a.type === 'level') prog = state.level;
        else if(a.type === 'rare') prog = state.caughtRare;
        else if(a.type === 'epic') prog = state.caughtEpic;
        else if(a.type === 'legendary') prog = state.caughtLegendary;

        const div = document.createElement('div');
        div.className = `border-2 p-3 mb-2 flex justify-between items-center ${isClaimed ? 'bg-green-900/30 border-green-800' : 'bg-[#111] border-gray-600'}`;

        div.innerHTML = `
            <div class="flex-1">
                <div class="text-xs font-bold ${isClaimed ? 'text-green-400' : 'text-white'}">${a.name}</div>
                <div class="text-xxs text-gray-400 mt-1">${a.desc}</div>
                <div class="text-xxs text-blue-300 mt-1">Progreso: ${Math.min(prog, a.req)} / ${a.req}</div>
            </div>
            <div>
                ${isClaimed ? '<span class="text-green-500 text-xs font-bold">Completado</span>' : 
                  isNotified ? `<button onclick="claimAchievement('${a.id}')" class="pixel-btn bg-amber-600 text-xs p-2">+${a.reward}🪙 Reclamar</button>` : 
                  `<div class="text-gray-500 text-xs">${a.reward}🪙</div>`
                }
            </div>`;
        content.appendChild(div);
    });
}

window.equipItem = function(cat, id) {
    if (fState !== 'IDLE' && cat !== 'baits') { playSound('error'); showToast('Recoge la caña antes de cambiar de equipo.'); return; }
    playSound('click');
    if(cat === 'baits') state.currentBait = id;
    if(cat === 'rods') state.currentRod = id;
    if(cat === 'locations') { state.currentLocation = id; renderTravel(); }
    if(cat === 'vehicles') { 
        state.currentVehicle = id; 
        // Reset location to default for that vehicle
        const defaultLoc = Object.values(GAME_DATA.locations).find(l => l.reqVeh === id);
        if(defaultLoc) state.currentLocation = defaultLoc.id;
        renderInventory(); 
    }
    saveToCloud(); updateHUD();
}

function renderInventory() {
    document.getElementById('invVeh').innerText = GAME_DATA.vehicles[state.currentVehicle].name;
    document.getElementById('invRod').innerText = GAME_DATA.rods[state.currentRod].name;
    document.getElementById('invBait').innerText = state.currentBait === 'none' ? 'Ninguno' : `${GAME_DATA.baits[state.currentBait].name} (x${state.baitCounts[state.currentBait]})`;

    const vCont = document.getElementById('inventoryVehiclesContent'); vCont.innerHTML = '';
    state.unlockedVehicles.forEach(vId => {
        const v = GAME_DATA.vehicles[vId];
        vCont.innerHTML += `<button onclick="equipItem('vehicles', '${vId}')" class="pixel-btn text-xxs ${state.currentVehicle===vId?'bg-yellow-600':'bg-gray-700'}">${v.icon} ${v.name}</button>`;
    });

    const rCont = document.getElementById('inventoryRodsContent'); rCont.innerHTML = '';
    state.unlockedRods.forEach(rId => {
        rCont.innerHTML += `<button onclick="equipItem('rods', '${rId}')" class="pixel-btn text-xxs ${state.currentRod===rId?'bg-yellow-600':'bg-gray-600'}">${GAME_DATA.rods[rId].name}</button>`;
    });

    const bCont = document.getElementById('inventoryBaitsContent');
    bCont.innerHTML = `<button onclick="equipItem('baits', 'none')" class="pixel-btn text-xxs ${state.currentBait==='none'?'bg-yellow-600':'bg-gray-700'}">❌ Quitar</button>`;
    Object.keys(state.baitCounts).forEach(bId => {
        if(state.baitCounts[bId] > 0) {
            const b = GAME_DATA.baits[bId];
            bCont.innerHTML += `<button onclick="equipItem('baits', '${bId}')" class="pixel-btn text-xxs ${state.currentBait===bId?'bg-yellow-600':'bg-indigo-600'}">${b.icon} ${b.name} (x${state.baitCounts[bId]})</button>`;
        }
    });

    const fCont = document.getElementById('inventoryFishContent'); fCont.innerHTML = '';
    GAME_DATA.fishes.forEach(f => {
        const count = state.inventory[f.id] || 0;
        if(count > 0) {
            const r = GAME_DATA.rarities[f.rarity];
            fCont.innerHTML += `
                <div class="border border-gray-700 p-2 text-center flex flex-col items-center">
                    <img src="${f.spriteData}" class="w-10 h-10" style="image-rendering: pixelated;">
                    <div class="text-xxs ${r.class} mt-1 text-shadow truncate w-full">${f.name}</div>
                    <div class="text-xxs text-white">x${count}</div>
                </div>`;
        }
    });
}
