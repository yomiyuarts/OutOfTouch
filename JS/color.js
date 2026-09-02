const colorChoice = document.getElementById("colorChoice");

// Load saved color immediately
const savedColor = localStorage.getItem("selectedColor") || "blue";

if (savedColor) {
    document.body.classList.add("color-" + savedColor);

    if (colorChoice) {
        colorChoice.value = savedColor;
    }
}


// Change color when dropdown is used
if (colorChoice) {

    colorChoice.addEventListener("change", function () {

        const newColor = this.value;

        // Fade page out
        document.body.classList.remove("page-loaded");
        document.body.classList.add("fade-out");

        setTimeout(function () {

            // Remove old color
            document.body.classList.remove(
                "color-blue",
                "color-green",
                "color-red"
            );

            // Apply new color
            document.body.classList.add("color-" + newColor);

            // Save new color
            localStorage.setItem("selectedColor", newColor);

            // Fade page back in
            document.body.classList.remove("fade-out");

            setTimeout(function () {
                document.body.classList.add("page-loaded");
            }, 10);

        }, 400);

    });

}