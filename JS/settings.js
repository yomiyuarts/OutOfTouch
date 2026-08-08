
    const settingsButton = document.getElementById("settingsButton");
    const settingsModal = document.getElementById("settingsModal");

    settingsButton.onclick = function () {
        settingsModal.classList.add("active");
    };

    settingsModal.onclick = function (event) {
        if (event.target === settingsModal) {
            settingsModal.classList.remove("active");
        }
    };

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            settingsModal.classList.remove("active");
        }
    });
