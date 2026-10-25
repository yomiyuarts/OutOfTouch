document.addEventListener("DOMContentLoaded", () => {

    // --- Fade-in Scroll Animations ---
    const fadeElements = document.querySelectorAll(".fade-in-element");

    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));


    // --- Smooth Scrolling Setup ---
    function addSmoothScroll(buttonId, targetId) {
        const button = document.getElementById(buttonId);
        const target = document.getElementById(targetId);

        if (!button || !target) return;

        button.addEventListener("click", (e) => {
            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    }

    addSmoothScroll("scrollToExperience", "experience");
    addSmoothScroll("scrollToMain", "trailer");


    // --- Background Music Setup ---
    const audio = document.getElementById("bgMusic");
    const icon = document.getElementById("musicIcon");

    if (audio) {
        const isMuted = localStorage.getItem("musicMuted") === "true";

        audio.muted = isMuted;
        audio.currentTime = 0;

        if (icon) {
            icon.className = audio.muted
                ? "fa-solid fa-volume-xmark"
                : "fa-solid fa-volume-high";
        }

        audio.play().catch(() => {
            console.log("Autoplay blocked. Waiting for user interaction.");
        });
    }


    // --- Welcome Modal Setup ---
    const welcomeModal = document.getElementById("welcomeModal");
    const welcomeButton = document.getElementById("welcomeButton");
    const welcomeButtonNO = document.getElementById("welcomeButtonNO");

    function lockScroll() {
        document.documentElement.classList.add("modal-open");
        document.body.classList.add("modal-open");
    }

    function unlockScroll() {
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
    }

    function closeWelcomeModal() {
        if (welcomeModal) {
            welcomeModal.classList.add("is-hidden");
        }

        unlockScroll();
        localStorage.setItem("welcomeSeen", "true");

        if (audio && !audio.muted) {
            audio.play().catch(error => {
                console.log("Music playback failed:", error);
            });
        }
    }

    if (welcomeModal) {
        if (localStorage.getItem("welcomeSeen") === "true") {
            welcomeModal.classList.add("is-hidden");
            unlockScroll();
        } else {
            welcomeModal.classList.remove("is-hidden");
            lockScroll();
        }
    }

    if (welcomeButton) {
        welcomeButton.addEventListener("click", closeWelcomeModal);
    }

    if (welcomeButtonNO) {
        welcomeButtonNO.addEventListener("click", () => {
            closeWelcomeModal();

            const settingsButton = document.getElementById("settingsButton");

            if (settingsButton) {
                settingsButton.click();
            }
        });
    }


    // --- Fullscreen Alert Setup ---
    const fullscreenButton = document.getElementById("fullscreen-button");
    const alertBox = document.getElementById("fullscreen-alert");

    if (fullscreenButton && alertBox) {
        fullscreenButton.addEventListener("click", () => {
            alertBox.classList.add("show");

            setTimeout(() => {
                alertBox.classList.remove("show");
            }, 5000);
        });
    }

});


// --- Music Toggle ---
function toggleMusic() {
    const audio = document.getElementById("bgMusic");
    const icon = document.getElementById("musicIcon");

    if (!audio || !icon) return;

    if (audio.muted) {
        audio.muted = false;

        audio.play().catch(err => {
            console.log("Playback failed:", err);
        });

        icon.className = "fa-solid fa-volume-high";
        localStorage.setItem("musicMuted", "false");
    } else {
        audio.muted = true;

        icon.className = "fa-solid fa-volume-xmark";
        localStorage.setItem("musicMuted", "true");
    }
}