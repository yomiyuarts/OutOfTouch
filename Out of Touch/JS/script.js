document.addEventListener("DOMContentLoaded", () => {
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
  
  function addSmoothScroll(buttonId, targetId) {

        const button = document.getElementById(buttonId);
        const target = document.getElementById(targetId);

        if (!button || !target) return;

        button.addEventListener("click", () => {

            target.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        });
    }

    addSmoothScroll("scrollToExperience", "experience");
    addSmoothScroll("scrollToMain", "trailer");
});