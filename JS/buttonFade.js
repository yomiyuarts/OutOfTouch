document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.scroll-down');
    const targetSection = document.querySelector('.stepinto');

    if (!startButton || !targetSection) {
        console.error('Button or target section not found.');
        return;
    }

    function checkScroll() {
        const targetPosition = targetSection.getBoundingClientRect().top;
        const triggerPoint = window.innerHeight * 0.8;

        if (targetPosition <= triggerPoint) {
            startButton.style.opacity = '0';
            startButton.style.pointerEvents = 'none';
        } else {
            startButton.style.opacity = '1';
            startButton.style.pointerEvents = 'auto';
        }
    }

    startButton.style.transition = 'opacity 0.5s ease';

    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    checkScroll();
});