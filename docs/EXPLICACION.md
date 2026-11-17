# 📚 Guía para explicar Pixel Fishing

## 🎤 Pitch de 30 segundos
> «Es un juego de pesca en pixel art hecho **solo con HTML, CSS y JavaScript**, sin motores de juego. La escena se dibuja en un `<canvas>`, los peces se generan desde plantillas de texto, el sonido se sintetiza con la Web Audio API y la partida se guarda en el navegador y en la nube con Firebase. Si falla internet, el juego sigue funcionando en local.»

## 🧭 Recorrido de 2 minutos
1. **Juégalo 20 s**: lanza, espera el `¡!`, tira y gana el minijuego.
2. **Enseña la Tienda y Viajes**: el progreso es lo que engancha (cebos → cañas → barcos → zonas).
3. **Abre `js/` en VS Code** y muestra que el código está separado por responsabilidades.
4. **Cierra con el roadmap** del README: sabes qué mejorarías y en qué orden.

## 🗂️ Mapa del código (qué enseñar en cada archivo)

| Archivo | Responsabilidad | Concepto de DAW | Función estrella |
|---|---|---|---|
| `js/data.js` | Datos de peces, cañas, zonas, logros | Objetos y arrays, `forEach` | `generateFishSprite()` |
| `js/state.js` | Estado de la partida y de la pesca | Copia profunda, máquina de estados | `fState` |
| `js/audio.js` | Sonidos sintetizados | Web Audio API | `playTone()` |
| `js/storage.js` | Guardado local y en la nube | JSON, `localStorage`, `async/await`, `Promise.race` | `loadGame()` |
| `js/render.js` | Dibujo de la escena | Canvas 2D, `requestAnimationFrame` | `renderScene()` |
| `js/fishing.js` | Lanzar, picada, minijuego, captura | Eventos, `setTimeout`, aleatoriedad | `processCatch()` |
| `js/ui.js` | HUD, menús, tienda, mochila | DOM dinámico, plantillas de texto | `renderShop()` |
| `js/main.js` | Arranque | Ciclo de vida de la página | `window.onload` |

## ❓ Preguntas que te pueden hacer

**¿Por qué sin framework?**
Para dominar los fundamentos (DOM, eventos, Canvas, asincronía) antes de apoyarme en React o Vue. Con esa base, migrar es más fácil.

**¿Cómo se guarda la partida?**
Siempre en `localStorage` como JSON. Si hay conexión, también en Firestore con una sesión anónima. Al cargar gana la partida con el `savedAt` más reciente.

**¿Y si no hay internet?**
El guardado local sigue funcionando y el juego avisa de que está en modo local. *Ojo: ahora mismo la maquetación usa Tailwind por CDN, así que sin internet puede verse mal; quitarlo está en el roadmap (v1.1).*

**¿Cómo dibujas los peces sin imágenes?**
Cada pez es una plantilla de texto (`"12892211121"`): cada carácter es un color. Con un `<canvas>` de 12×6 píxeles se pinta píxel a píxel y se convierte a imagen con `toDataURL()`.

**¿Cómo funciona la pesca?**
Con una máquina de estados: `IDLE → WAITING → HOOKED → FIGHT`. Un `setTimeout` aleatorio provoca la picada y otro da el margen para reaccionar. Según la rareza, el minijuego pide de 1 a 4 aciertos.

**¿Es seguro Firebase con la clave en el código?**
La `apiKey` de una app web no es secreta. Lo que protege los datos son las **reglas de Firestore** (cada jugador solo accede a su documento). Están en el README.

**¿Qué mejorarías?**
Módulos ES (`import/export`), CSS propio sin Tailwind, modo offline como PWA y un ranking global. Está todo en el roadmap.

## 🐞 Bugs reales que puedes contar
- **El CSS no cargaba** por un nombre de archivo equivocado.
- **Salir al título con la caña lanzada** dejaba temporizadores vivos: hay que cancelar con `clearTimeout`.
- **Condición de carrera**: la partida de la nube podía pisar el progreso si se empezaba a jugar antes de terminar de cargar. Se arregló bloqueando el botón y no guardando hasta terminar la carga.
- **Mantener `Espacio`** repetía el evento `keydown`: se arregló con `e.repeat`.

Contar un bug y cómo lo resolviste convence más que enseñar solo lo que funciona.
