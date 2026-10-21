
async function loadSavedDrawing() {
    const folder = "/idbfs/716d711bf3bb93657f89578919ec4b16/";

    // Highest priority first
    const drawingPaths = [
        folder + "intro_drawing_computer.png",
        folder + "intro_sketchbook.png",
        folder + "intro_drawing_bathroom_unfog.png",
        folder + "intro_drawing_bathroom_fog.png"
    ];

    const images = document.querySelectorAll(".drawn-char, .drawn-char2");

    // Wait until Unity's filesystem is available
    const getFS = () =>
        window.unityInstance?.Module?.FS ||
        window.unityInstance?.FS ||
        null;

    let FS = getFS();

    for (let i = 0; !FS && i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        FS = getFS();
    }

    if (!FS) {
        console.warn("Unity filesystem is not exposed to the website.");
        return;
    }

    // Select the first existing drawing in priority order
    let selectedPath = null;

    for (const path of drawingPaths) {
        try {
            if (FS.analyzePath(path).exists) {
                selectedPath = path;
                break;
            }
        } catch (error) {
            console.warn("Could not check drawing:", path, error);
        }
    }

    if (!selectedPath) {
        console.log("No saved drawings were found.");
        return;
    }

    try {
        const bytes = FS.readFile(selectedPath);
        const blob = new Blob([bytes], { type: "image/png" });
        const imageURL = URL.createObjectURL(blob);

        images.forEach(img => {
            img.src = imageURL;
        });

        console.log("Loaded saved drawing:", selectedPath);
    } catch (error) {
        console.error("Could not load drawing:", error);
    }
}
