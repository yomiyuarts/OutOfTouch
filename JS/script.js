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
            e.preventDefault(); // Prevents instant jump if button is an 'a' tag
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

    // Only run music code if the elements actually exist on the current page
    if (audio && icon) {
        // Check if user previously unmuted the music
        const isMuted = sessionStorage.getItem("musicMuted") === "true"; 
        audio.muted = isMuted;
        
        // Update icon visually based on state
        if (audio.muted) {
            icon.className = "fa-solid fa-volume-xmark";
        } else {
            icon.className = "fa-solid fa-volume-high";
        }

        // Track continuous playback position across pages
        const savedTime = sessionStorage.getItem("musicTime");
        if (savedTime) {
            audio.currentTime = parseFloat(savedTime);
        }

        // Continuously save the current time of the song
        setInterval(() => {
            if (!audio.paused) {
                sessionStorage.setItem("musicTime", audio.currentTime);
            }
        }, 1000);

        // Attempt Autoplay safely
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

    sessionStorage.setItem("welcomeSeen", "true");

    const audio = document.getElementById("bgMusic");

    if (audio && !audio.muted) {
        audio.play().catch(error => {
            console.log("Music playback failed:", error);
        });
    }
}

if (welcomeModal) {
    if (sessionStorage.getItem("welcomeSeen") === "true") {
        welcomeModal.classList.add("is-hidden");
        unlockScroll();
    } else {
        welcomeModal.classList.remove("is-hidden");
        lockScroll();
    }
}

if (welcomeButton) {
    welcomeButton.onclick = closeWelcomeModal;
}

if (welcomeButtonNO) {
    welcomeButtonNO.onclick = function () {
        closeWelcomeModal();

        const settingsButton = document.getElementById("settingsButton");

        if (settingsButton) {
            settingsButton.click();
        }
    };
}
});


function toggleMusic() {
    const audio = document.getElementById("bgMusic");
    const icon = document.getElementById("musicIcon");

    if (!audio || !icon) return;

    if (audio.muted) {
        audio.muted = false;
        audio.play().catch(err => console.log("Playback failed:", err));
        icon.className = "fa-solid fa-volume-high";
        sessionStorage.setItem("musicMuted", "false");
    } else {
        audio.muted = true;
        icon.className = "fa-solid fa-volume-xmark";
        sessionStorage.setItem("musicMuted", "true");
    }
}
