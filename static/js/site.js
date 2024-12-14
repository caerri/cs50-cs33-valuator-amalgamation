/*
    Summary:
    This script manages a simple dropdown menu for early project functionality. 
    It enables toggling the visibility of a dropdown menu on user interaction 
    and ensures the menu closes when clicking outside the dropdown.

    Key Features:
    - Toggles dropdown visibility when the menu toggle is clicked.
    - Closes the dropdown automatically when a user clicks anywhere outside the menu.
    - Provides basic interactivity for navigation or selection purposes.
    - Early implementation for enhancing the user interface.

    Purpose:
    - Introduced to provide foundational dropdown functionality before advanced features were added.
    - Ensures a clean and user-friendly experience for basic dropdown interactions.
*/


document.addEventListener("DOMContentLoaded", () => {
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    dropdownToggle.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
        const isVisible = dropdownMenu.style.display === "block";
        dropdownMenu.style.display = isVisible ? "none" : "block";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });
});