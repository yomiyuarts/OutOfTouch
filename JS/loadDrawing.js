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
        if (!file || !file.contents) {
          resolve(null);
          return;
        }

        const bytes = new Uint8Array(file.contents);
        const blob = new Blob([bytes], { type: "image/png" });
        resolve(URL.createObjectURL(blob));
      };
      
      request.onerror = function () { reject(request.error); };
    });
  }

  // New function to inspect image data for real content
  function isDrawingBlank(imgElement) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = imgElement.naturalWidth || imgElement.width;
      canvas.height = imgElement.naturalHeight || imgElement.height;
      
      if (canvas.width === 0 || canvas.height === 0) return true;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(imgElement, 0, 0);
      
      // Pull all pixel RGBA data
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      let firstR = data[0], firstG = data[1], firstB = data[2], firstA = data[3];
      let isIdenticalToFirstPixel = true;
      let hasAnyVisiblePixels = false;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        let a = data[i + 3];

        // Check 1: If there is ANY alpha transparency above 0, it has color structure
        if (a > 0) {
          hasAnyVisiblePixels = true;
        }

        // Check 2: See if it's just a single solid color block (like all white or all black)
        if (r !== firstR || g !== firstG || b !== firstB || a !== firstA) {
          isIdenticalToFirstPixel = false;
        }
      }

      // It's blank if it's completely transparent OR 100% one solid flat color
      return !hasAnyVisiblePixels || isIdenticalToFirstPixel;
    } catch (e) {
      console.error("Error analyzing pixel data:", e);
      return false; // Safely fall back to showing it if canvas analysis fails
    }
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
          if (!imageURL) continue; 

          const images = document.querySelectorAll(".drawn-char, .drawn-char2");
          if (!images.length) {
            URL.revokeObjectURL(imageURL);
            console.warn("No target image elements found.");
            return;
          }

          // Load image into memory to check its pixels
          const testImg = new Image();
          const loaded = await new Promise((resolve) => {
            testImg.onload = () => resolve(true);
            testImg.onerror = () => resolve(false);
            testImg.src = imageURL;
          });

          // Verify if it renders and actually has drawings on it
          if (!loaded || isDrawingBlank(testImg)) {
            console.warn(`[Skipped Blank Template] ${path} is valid file-wise, but contains no actual player drawings.`);
            URL.revokeObjectURL(imageURL);
            continue; 
          }

          // If it passes pixel checks, paint it to your webpage elements
          images.forEach(function (img) {
            img.src = imageURL;
          });
          console.log("Successfully verified and loaded user drawing:", path);
          return; 
        } catch (fileError) {
          console.warn(`Error processing file ${path}, skipping...`, fileError);
        }
      }
      console.log("No non-blank user drawings found in IndexedDB.");
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
