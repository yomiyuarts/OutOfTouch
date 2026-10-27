
(function () {
    const DB_NAME = "/idbfs";
    const FOLDER = "/idbfs/716d711bf3bb93657f89578919ec4b16/";

    const DRAWING_PATHS = [
        FOLDER + "intro_drawing_computer.png",
        FOLDER + "intro_drawing_sketchbook.png",
        FOLDER + "intro_drawing_bathroom_unfog.png",
        FOLDER + "intro_drawing_bathroom_fog.png",
        FOLDER + "chap1_drawing1.png",
        FOLDER + "chap1_drawing2.png"
    ];

    const SELECTOR = ".drawn-char, .drawn-char2, .drawn-char3, .drawn-char4";

    let noticeTimeout;

const drawingNotice = document.createElement("div");
drawingNotice.className = "drawing-notice";
drawingNotice.textContent = "Play our experience for a surprise!";
document.body.appendChild(drawingNotice);

function showDrawingNotice(event) {
    drawingNotice.classList.add("show");

    if (event) {
        drawingNotice.style.left = event.clientX + 15 + "px";
        drawingNotice.style.top = event.clientY + 15 + "px";
        drawingNotice.style.bottom = "auto";
    }

    clearTimeout(noticeTimeout);

    noticeTimeout = setTimeout(function () {
        drawingNotice.classList.remove("show");
    }, 3000);
}

    const popSound = new Audio("CSS/assets/pop.mp3");
    popSound.volume = 0.5;

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
        const availableDrawings = [];

        for (const path of paths) {
            const url = await getDrawing(db, path);

            if (!url) {
                continue;
            }

            const isValid = await loadImage(url);

            if (!isValid) {
                URL.revokeObjectURL(url);
                continue;
            }

            if (validDrawings[path]) {
                URL.revokeObjectURL(url);
            } else {
                validDrawings[path] = url;
            }

            availableDrawings.push(path);
        }

        const currentPath = assignedDrawings.get(element);

        const otherDrawings = availableDrawings.filter(
            path => path !== currentPath
        );

        const choices = otherDrawings.length > 0
            ? otherDrawings
            : availableDrawings;

        if (choices.length > 0) {
            const nextPath = choices[
                Math.floor(Math.random() * choices.length)
            ];

            setDrawing(element, nextPath);
        } else {
            assignedDrawings.delete(element);
            element.style.backgroundImage = "";
            showDrawingNotice();
        }

    } catch (error) {
        console.error("Could not refresh saved drawings:", error);
    } finally {
        if (db) {
            db.close();
        }
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

    

document.addEventListener("click", async function (event) {
    const character = event.target.closest(SELECTOR);

    if (!character) {
        return;
    }

    const hasDrawing = assignedDrawings.has(character);

    if (!hasDrawing || !validDrawings[assignedDrawings.get(character)]) {
        await randomizeCharacter(character);

        if (!assignedDrawings.has(character)) {
            showDrawingNotice();
            return;
        }
    } else {
        popSound.currentTime = 0;

        popSound.play().catch(error => {
            console.warn("Could not play pop sound:", error);
        });

        await randomizeCharacter(character);
    }
});

document.addEventListener("mouseover", function (event) {
    const character = event.target.closest(SELECTOR);

    if (!character) {
        return;
    }

    const hasDrawing = assignedDrawings.has(character);

    if (!hasDrawing || !validDrawings[assignedDrawings.get(character)]) {
        showDrawingNotice(event);
    }
});

document.addEventListener("mouseout", function (event) {
    const character = event.target.closest(SELECTOR);

    if (!character) {
        return;
    }

    if (event.relatedTarget && character.contains(event.relatedTarget)) {
        return;
    }

    drawingNotice.classList.remove("show");
    clearTimeout(noticeTimeout);
});



    window.loadSavedDrawing = loadSavedDrawing;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadSavedDrawing);
    } else {
        loadSavedDrawing();
    }
})();
