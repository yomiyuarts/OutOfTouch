
window.OnDrawingExported = function (fileName, base64) {
    if (!fileName || !base64) {
        console.log("Unity did not return a saved drawing.");
        return;
    }

    const imageURL = "data:image/png;base64," + base64;

    document.querySelectorAll(".drawn-char, .drawn-char2").forEach(function (img) {
        img.src = imageURL;
    });

    console.log("Drawing displayed:", fileName);
};

window.loadSavedDrawing = function () {
    if (!window.unityInstance) {
        console.error("Unity has not initialized yet.");
        return;
    }

    window.unityInstance.SendMessage("DrawingExporter", "ExportDrawing");
};
