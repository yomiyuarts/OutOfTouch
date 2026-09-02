document.addEventListener("DOMContentLoaded", function () {

    // Prevent browser from restoring previous scroll position
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    // Start page at the top
    window.scrollTo(0, 0);

    // Fade in
    setTimeout(function () {
        document.body.classList.add("page-loaded");
    }, 10);


    const links = document.querySelectorAll("a");

    links.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const href = this.getAttribute("href");

            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("http") ||
                href.startsWith("mailto:") ||
                this.target === "_blank"
            ) {
                return;
            }

            event.preventDefault();

            // Fade out from wherever the user currently is
            document.body.classList.remove("page-loaded");
            document.body.classList.add("fade-out");

            setTimeout(function () {

                // Reset scroll right before navigating
                window.scrollTo(0, 0);

                window.location.href = href;

            }, 400);

        });

    });

});