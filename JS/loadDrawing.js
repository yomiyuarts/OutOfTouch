
(function () {
    const DB_NAME = "/idbfs";
    const FOLDER = "/idbfs/716d711bf3bb93657f89578919ec4b16/";

    const DRAWING_PATHS = [
        FOLDER + "intro_drawing_computer.png",
        FOLDER + "intro_drawing_sketchbook.png",
        FOLDER + "intro_drawing_bathroom_unfog.png",
        FOLDER + "intro_drawing_bathroom_fog.png"
    ];

    const SELECTOR = ".drawn-char, .drawn-char2, .drawn-char3, .drawn-char4";

    const validDrawings = {};
    const assignedDrawings = new Map();
    let isReady = false;

    function openUnityDatabase() {
        return new Promise(function (resolve, reject) {
            const request = indexedDB.open(DB_NAME);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function getDrawing(db, path) {
        return new Promise(function (resolve, reject) {
            const request = db.transaction("FILE_DATA", "readonly")
                .objectStore("FILE_DATA").get(path);

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

            request.onerror = () => reject(request.error);
        });
    }

    function loadImage(url) {
        return new Promise(function (resolve) {
            const img = new Image();

            img.onload = function () {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;

                    if (!canvas.width || !canvas.height) {
                        resolve(false);
                        return;
                    }

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    const data = ctx.getImageData(
                        0, 0, canvas.width, canvas.height
                    ).data;

                    let visible = false;
                    let first = null;
                    let different = false;

                    for (let i = 0; i < data.length; i += 4) {
                        const pixel = [
                            data[i],
                            data[i + 1],
                            data[i + 2],
                            data[i + 3]
                        ];

                        if (pixel[3] > 0) visible = true;

                        if (first === null) {
                            first = pixel;
                        } else if (
                            pixel[0] !== first[0] ||
                            pixel[1] !== first[1] ||
                            pixel[2] !== first[2] ||
                            pixel[3] !== first[3]
                        ) {
                            different = true;
                        }
                    }

                    resolve(visible && different);
                } catch (error) {
                    console.warn("Could not inspect drawing:", error);
                    resolve(false);
                }
            };

            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    
function setDrawing(element, path) {
    assignedDrawings.set(element, path);
    element.style.backgroundImage = `url("${validDrawings[path]}")`;

    element.classList.remove("pop");

    // Restart the animation every time the drawing changes.
    void element.offsetWidth;

    element.classList.add("pop");

    element.addEventListener("animationend", function handler() {
        element.classList.remove("pop");
        element.removeEventListener("animationend", handler);
    });
}


    
async function randomizeCharacter(element) {
    let db;

    try {
        db = await openUnityDatabase();

        const paths = shuffle([...DRAWING_PATHS]);
        let nextPath = null;

        for (const path of paths) {
            const url = await getDrawing(db, path);

            if (!url) continue;

            if (await loadImage(url)) {
                const oldUrl = validDrawings[path];

                validDrawings[path] = url;

                if (oldUrl && oldUrl !== url) {
                    URL.revokeObjectURL(oldUrl);
                }

                if (path !== assignedDrawings.get(element)) {
                    nextPath = path;
                    break;
                }
            } else {
                URL.revokeObjectURL(url);
            }
        }

        if (nextPath) {
            setDrawing(element, nextPath);
        }
    } catch (error) {
        console.error("Could not refresh saved drawings:", error);
    } finally {
        if (db) db.close();
    }
}


    async function loadSavedDrawing() {
        let db;

        try {
            db = await openUnityDatabase();

            for (const path of DRAWING_PATHS) {
                try {
                    const url = await getDrawing(db, path);

                    if (!url) continue;

                    if (await loadImage(url)) {
                        validDrawings[path] = url;
                    } else {
                        URL.revokeObjectURL(url);
                        console.log("Skipped blank drawing:", path);
                    }
                } catch (error) {
                    console.warn("Skipped drawing:", path, error);
                }
            }

            const characters = [...document.querySelectorAll(SELECTOR)];
            const paths = shuffle(Object.keys(validDrawings));

            // Assign unique drawings to each character.
            // Assign unique drawings first, allowing duplicates if needed.
characters.forEach(function (element, index) {
    if (paths.length > 0) {
        setDrawing(element, paths[index % paths.length]);
    } else {
        assignedDrawings.delete(element);
    }
});

            isReady = true;

            console.log(
                "Loaded", paths.length,
                "valid drawings for", characters.length, "characters."
            );
        } catch (error) {
            console.error("Could not access Unity database:", error);
        } finally {
            if (db) db.close();
        }
    }

    document.addEventListener("click", function (event) {
    const character = event.target.closest(".drawn-char2");

    if (character) {
        randomizeCharacter(character);
    }
});

    window.loadSavedDrawing = loadSavedDrawing;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadSavedDrawing);
    } else {
        loadSavedDrawing();
    }
})();
