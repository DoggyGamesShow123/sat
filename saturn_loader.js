// Saturn Loader v1.01 (for yabause_libretro.wasm + yabause_libretro.js)

const canvas = document.getElementById("screen");
let gameBuffer = null;

// ---- Drag & Drop ----
document.getElementById("dropzone").addEventListener("dragover", e => {
    e.preventDefault();
});
document.getElementById("dropzone").addEventListener("drop", async e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    gameBuffer = new Uint8Array(await file.arrayBuffer());
    startEmulator();
});

// ---- BIOS Loader ----
async function loadBIOS() {
    const biosFetch = await fetch("saturn_bios.bin");
    if (!biosFetch.ok) {
        alert("saturn_bios.bin not found!");
        return null;
    }
    return new Uint8Array(await biosFetch.arrayBuffer());
}

// ---- Emulator Start ----
async function startEmulator() {
    const bios = await loadBIOS();
    if (!bios) return;

    if (!gameBuffer) {
        alert("No game dropped.");
        return;
    }

    // Module config required by yabause_libretro.js
    window.Module = {
        canvas: canvas,
        onRuntimeInitialized: () => {
            // Mount BIOS
            Module.FS_createDataFile("/", "saturn_bios.bin", bios, true, true);

            // Mount ROM
            Module.FS_createDataFile("/", "game.bin", gameBuffer, true, true);

            // Load BIOS
            Module._core_load_bios("saturn_bios.bin");

            // Load Game
            Module._core_load_game("game.bin");

            // Start the Saturn core
            Module._core_run();
        }
    };

    // Loads and initializes the WASM core
    console.log("Starting Yabause Libretro WASM core…");
}
