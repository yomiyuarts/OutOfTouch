(function () {
  const DB_NAME = "/idbfs";
  const FOLDER = "/idbfs/716d711bf3bb93657f89578919ec4b16/";
  const DRAWING_PATHS = [
    FOLDER + "intro_drawing_computer.png",
    FOLDER + "intro_sketchbook.png",
    FOLDER + "intro_drawing_bathroom_unfog.png",
    FOLDER + "intro_drawing_bathroom_fog.png"
  ];

  // STRICT FILE SIZE FILTER: 4 KB in bytes
  const MIN_FILE_SIZE_BYTES = 4096;

  function openUnityDatabase() {
    return new Promise(function (resolve, reject) {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
  }

  function getDrawing(db, path) {
    return new Promise(function (resolve, reject) {
      const transaction = db.transaction("FILE_DATA", "readonly");
      const request = transaction.objectStore("FILE_DATA").get(path);
      
      request.onsuccess = function () {
        const file = request.result;
        
        // 1. Check if the database entry exists at all
        if (!file || !file.contents) {
          resolve(null);
          return;
        }

        // 2. Read the file size directly from the ArrayBuffer
        const fileSizeInBytes = file.contents.byteLength;
        console.log(`File: ${path} | Size: ${(fileSizeInBytes / 1024).toFixed(2)} KB (${fileSizeInBytes} bytes)`);

        // 3. Apply the 4 KB threshold filter
        if (fileSizeInBytes < MIN_FILE_SIZE_BYTES) { 
          console.warn(`[Skipped] ${path} is below the 4 KB threshold. Likely an empty or broken canvas.`);
          resolve(null);
          return;
        }
        
        // Convert valid binary payload to an image URL
        const bytes = new Uint8Array(file.contents);
        const blob = new Blob([bytes], { type: "image/png" });
        resolve(URL.createObjectURL(blob));
      };
      
      request.onerror = function () { reject(request.error); };
    });
  }

  async function loadSavedDrawing() {
    let db;
    try {
      db = await openUnityDatabase();
      const shuffledPaths = [...DRAWING_PATHS];
      for (let i = shuffledPaths.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPaths[i], shuffledPaths[j]] = [shuffledPaths[j], shuffledPaths[i]];
      }

      for (const path of shuffledPaths) {
        try {
          const imageURL = await getDrawing(db, path);
          if (!imageURL) continue; // Try the next random path if this one failed the threshold

          const images = document.querySelectorAll(".drawn-char, .drawn-char2");
          if (!images.length) {
            URL.revokeObjectURL(imageURL);
            console.warn("No .drawn-char or .drawn-char2 elements found on the page.");
            return;
          }

          images.forEach(function (img) {
            img.src = imageURL;
          });
          console.log("Successfully loaded valid drawing:", path);
          return; // Stop looping once a valid drawing is found and displayed
        } catch (fileError) {
          console.warn(`Error processing file ${path}, skipping...`, fileError);
        }
      }
      console.log("No drawings passed the 4 KB threshold.");
    } catch (error) {
      console.error("Could not access the Unity database:", error);
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
