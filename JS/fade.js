const button = document.querySelector('.scroll-down');
const experience = document.getElementById('experience');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            button.classList.add('hidden');
        } else {
            button.classList.remove('hidden');
        }
    });
}, {
    threshold: 0,
    rootMargin: "0px 0px 500px 0px"
});

observer.observe(experience);

let autoScrolling = false;
let animationFrame;

setTimeout(() => {
    const target = document.getElementById('experience');
    const targetPosition = target.offsetTop;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;

    const duration = 20000;
    let startTime = null;

    autoScrolling = true;

    function scrollAnimation(currentTime) {
        if (!autoScrolling) return;

        if (!startTime) startTime = currentTime;

        const progress = Math.min(
            (currentTime - startTime) / duration,
            1
        );

        window.scrollTo(
            0,
            startPosition + distance * progress
        );

        if (progress < 1) {
            animationFrame = requestAnimationFrame(scrollAnimation);
        } else {
            autoScrolling = false;
        }
    }

    animationFrame = requestAnimationFrame(scrollAnimation);
}, 15000);


// Stop automatic scrolling when the user scrolls
window.addEventListener('wheel', () => {
    if (autoScrolling) {
        autoScrolling = false;
        cancelAnimationFrame(animationFrame);
    }
}, { passive: true });