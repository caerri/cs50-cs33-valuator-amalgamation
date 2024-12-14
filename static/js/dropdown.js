/*
    Summary:
    This script dynamically populates dropdown fields in the Step 2 form with pre-defined options. 
    It ensures consistency and flexibility for future updates to form fields such as Property Type, 
    Condition, View, Basement, and Garage. The dropdowns are populated for both the subject property 
    and the comparable properties, allowing seamless adjustments without modifying the HTML structure.

    Key Features:
    - Centralized dropdown options for easier future modifications.
    - Dynamic population of dropdowns for subject and comparables.
    - Default values applied based on pre-existing property data or a defined fallback.
*/


document.addEventListener("DOMContentLoaded", function () {
    // Get the property type from the data attribute
    const propertyType = document.getElementById('property_type_data').getAttribute('data-property-type');

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
        // Clear any existing options first
        selectElement.innerHTML = '';

        // Add options to the dropdown
        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });

        // Set default selected value for the dropdown
        if (defaultValue) {
            selectElement.value = defaultValue;
        }
    }

    // Populate Property Type Dropdown
    const propertyTypeSelect = document.getElementById('property_type');
    populateDropdown(propertyTypeSelect, dropdownOptions.desStyle, propertyType);

    // Populate Condition Dropdown
    const subjectConditionSelect = document.getElementById('subject_condition');
    populateDropdown(subjectConditionSelect, dropdownOptions.condition, "C1");

    // Populate View Dropdown
    const subjectViewSelect = document.getElementById('subject_view');
    populateDropdown(subjectViewSelect, dropdownOptions.view, "");

    // Populate Des/Style Dropdown
    const subjectDesStyleSelect = document.getElementById('subject_des_style');
    populateDropdown(subjectDesStyleSelect, dropdownOptions.desStyle, propertyType); // Default to propertyType for subject

    // Populate Basement Dropdown
    const subjectBasementSelect = document.getElementById('subject_basement');
    populateDropdown(subjectBasementSelect, dropdownOptions.basement, "");

    // Populate Garage Dropdown
    const subjectGarageSelect = document.getElementById('subject_garage');
    populateDropdown(subjectGarageSelect, dropdownOptions.garage, "");

    // Repeat for comparables (comp1, comp2, comp3)
    const compView1Select = document.getElementById('comp1_view');
    populateDropdown(compView1Select, dropdownOptions.view, "");

    const compView2Select = document.getElementById('comp2_view');
    populateDropdown(compView2Select, dropdownOptions.view, "");

    const compView3Select = document.getElementById('comp3_view');
    populateDropdown(compView3Select, dropdownOptions.view, "");

    const compDesStyle1Select = document.getElementById('comp1_des_style');
    populateDropdown(compDesStyle1Select, dropdownOptions.desStyle, "");

    const compDesStyle2Select = document.getElementById('comp2_des_style');
    populateDropdown(compDesStyle2Select, dropdownOptions.desStyle, "");

    const compDesStyle3Select = document.getElementById('comp3_des_style');
    populateDropdown(compDesStyle3Select, dropdownOptions.desStyle, "");

    const compCondition1Select = document.getElementById('comp1_condition');
    populateDropdown(compCondition1Select, dropdownOptions.condition, "");

    const compCondition2Select = document.getElementById('comp2_condition');
    populateDropdown(compCondition2Select, dropdownOptions.condition, "");

    const compCondition3Select = document.getElementById('comp3_condition');
    populateDropdown(compCondition3Select, dropdownOptions.condition, "");

    const compBasement1Select = document.getElementById('comp1_basement');
    populateDropdown(compBasement1Select, dropdownOptions.basement, "");

    const compBasement2Select = document.getElementById('comp2_basement');
    populateDropdown(compBasement2Select, dropdownOptions.basement, "");

    const compBasement3Select = document.getElementById('comp3_basement');
    populateDropdown(compBasement3Select, dropdownOptions.basement, "");

    const compGarage1Select = document.getElementById('comp1_garage');
    populateDropdown(compGarage1Select, dropdownOptions.garage, "");

    const compGarage2Select = document.getElementById('comp2_garage');
    populateDropdown(compGarage2Select, dropdownOptions.garage, "");

    const compGarage3Select = document.getElementById('comp3_garage');
    populateDropdown(compGarage3Select, dropdownOptions.garage, "");
});
