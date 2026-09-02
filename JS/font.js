const fontChoice = document.getElementById("choice");

// Load saved font immediately
const savedFont = localStorage.getItem("selectedFont");

if (savedFont) {
    document.body.classList.add("font-" + savedFont);

    if (fontChoice) {
        fontChoice.value = savedFont;
    }
}


// Change font when dropdown is used
if (fontChoice) {
    fontChoice.addEventListener("change", function () {

        // Fade out
        document.body.classList.add("font-changing");

        // Wait for fade-out to finish
        setTimeout(() => {

            // Remove previous font
            document.body.classList.remove(
                "font-option1",
                "font-option2",
                "font-option3"
            );

            // Add selected font
            document.body.classList.add("font-" + this.value);

            // Save selection
            localStorage.setItem("selectedFont", this.value);

            // Fade back in
            requestAnimationFrame(() => {
                document.body.classList.remove("font-changing");
            });

        }, 250);
    });
}