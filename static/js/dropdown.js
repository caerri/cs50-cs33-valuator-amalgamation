// Broke for some reason, had to recreate. This file is used to populate dropdowns in the form with predefined options for step2.html

document.addEventListener("DOMContentLoaded", function () {
    console.log("Dropdown initialization started.");

    // Get the property type safely
    let propertyType = "";
    const propertyTypeElement = document.getElementById('property_type_data');
    if (propertyTypeElement) {
        propertyType = propertyTypeElement.getAttribute('data-property-type') || "";
    }
    console.log("Property Type:", propertyType);

    // List of dropdown options
    const dropdownOptions = {
        view: ["", "None", "Water", "Golf", "City", "Mountain", "Park"],
        desStyle: ["", "Single Family", "Multi 2-4 Family", "Condo", "Townhouse", "Manufactured", "Detached", "Semi-Detached", "Attached"],
        condition: ["", "C1", "C2", "C3", "C4", "C5", "C6"],
        basement: ["", "None", "Full", "Partial", "Crawlspace", "Unfinished", "Finished"],
        garage: ["", "None", "1 Car", "2 Car", "3 Car", "4 Car"]
    };

    // Function to populate dropdown lists
    function populateDropdown(selectElement, options, defaultValue = "") {
        if (!selectElement) {
            console.error("Dropdown element not found:", selectElement);
            return;
        }

        // Clear existing options
        selectElement.innerHTML = '';

        // Add options
        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            if (option === defaultValue) {
                optionElement.selected = true;
            }
            selectElement.appendChild(optionElement);
        });

        console.log(`Dropdown populated: ${selectElement.id}`);
    }

    // Populate Dropdowns
    try {
        // Subject Property Dropdowns
        populateDropdown(document.getElementById('property_type'), dropdownOptions.desStyle, propertyType);
        populateDropdown(document.getElementById('subject_condition'), dropdownOptions.condition, "C1");
        populateDropdown(document.getElementById('subject_view'), dropdownOptions.view, "");
        populateDropdown(document.getElementById('subject_des_style'), dropdownOptions.desStyle, propertyType);
        populateDropdown(document.getElementById('subject_basement'), dropdownOptions.basement, "");
        populateDropdown(document.getElementById('subject_garage'), dropdownOptions.garage, "");

        // Comparables Dropdowns
        ['comp1', 'comp2', 'comp3'].forEach(comp => {
            populateDropdown(document.getElementById(`${comp}_view`), dropdownOptions.view, "");
            populateDropdown(document.getElementById(`${comp}_des_style`), dropdownOptions.desStyle, "");
            populateDropdown(document.getElementById(`${comp}_condition`), dropdownOptions.condition, "");
            populateDropdown(document.getElementById(`${comp}_basement`), dropdownOptions.basement, "");
            populateDropdown(document.getElementById(`${comp}_garage`), dropdownOptions.garage, "");
        });

        console.log("All dropdowns populated successfully.");
    } catch (error) {
        console.error("Error populating dropdowns:", error);
    }
});
