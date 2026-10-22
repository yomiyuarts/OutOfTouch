
(function () {
    const DB_NAME = "/idbfs";
    const FOLDER = "/idbfs/716d711bf3bb93657f89578919ec4b16/";

    const DRAWING_PATHS = [
        FOLDER + "intro_drawing_computer.png",
        FOLDER + "intro_sketchbook.png",
        FOLDER + "intro_drawing_bathroom_unfog.png",
        FOLDER + "intro_drawing_bathroom_fog.png"
    ];

    function openUnityDatabase() {
        return new Promise(function (resolve, reject) {
            const request = indexedDB.open(DB_NAME);

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    }

    function getDrawing(db, path) {
        return new Promise(function (resolve, reject) {
            const transaction = db.transaction("FILE_DATA", "readonly");
            const request = transaction.objectStore("FILE_DATA").get(path);

            request.onsuccess = function () {
                const file = request.result;

                if (!file || !file.contents) {
                    resolve(null);
                    return;
                }

                const bytes = new Uint8Array(file.contents);
                const blob = new Blob([bytes], { type: "image/png" });

                resolve(URL.createObjectURL(blob));
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    }

    async function loadSavedDrawing() {
        let db;

        try {
            db = await openUnityDatabase();

            // Randomize the order of all four drawings.
            const shuffledPaths = [...DRAWING_PATHS];

            for (let i = shuffledPaths.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledPaths[i], shuffledPaths[j]] =
                    [shuffledPaths[j], shuffledPaths[i]];
            }

            // Choose the first drawing that actually exists.
            for (const path of shuffledPaths) {
                const imageURL = await getDrawing(db, path);

                if (!imageURL) continue;

                const images = document.querySelectorAll(
                    ".drawn-char, .drawn-char2"
                );

                if (!images.length) {
                    URL.revokeObjectURL(imageURL);
                    console.warn("No .drawn-char or .drawn-char2 images found.");
                    return;
                }

                images.forEach(function (img) {
                    img.src = imageURL;
                });

                console.log("Random drawing loaded:", path);
                return;
            }

            console.log("No saved drawings were found.");
        } catch (error) {
            console.error("Could not load Unity drawing:", error);
        } finally {
            if (db) db.close();
        }
    }

    window.loadSavedDrawing = loadSavedDrawing;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadSavedDrawing);
    } else {
        loadSavedDrawing();
    }
})();
