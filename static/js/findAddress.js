/*
    Summary:
    This function integrates Google Maps Places API's Autocomplete feature to enhance user convenience
    during address input. It dynamically populates address fields (e.g., street address, city, state, ZIP)
    by extracting components from the selected autocomplete suggestion. The function simplifies the data 
    entry process by reducing manual input and ensuring data consistency.

    Key Features:
    - Automatically fills in street address, city, state, and ZIP fields based on user selection.
    - Makes fields non-editable after populating to prevent unintentional changes.
    - Allows manual entry when Google Autocomplete cannot find an address.
    - Dynamically handles state field updates, including dropdown selection for state abbreviations.
    - Restricts Autocomplete suggestions to US-based addresses for focused usability.

    Purpose:
    - Enhances user experience by minimizing typing effort and ensuring accurate address data.
    - Provides flexibility for users to manually enter details if Autocomplete fails.
*/


// Define initAutocomplete in the global scope so the Google Maps script can call it immediately.
function initAutocomplete() {
    const input = document.getElementById("autocomplete");
    if (!input) {
        console.error("Autocomplete input field not found.");
        return;
    }

    const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["address"],
        componentRestrictions: { country: "us" },
    });

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place || !place.address_components) {
            console.error("Place details not found.");
            return;
        }

        // Extract street number and route
        let streetNumber = "";
        let route = "";
        place.address_components.forEach((component) => {
            if (component.types.includes("street_number")) {
                streetNumber = component.long_name;
            }
            if (component.types.includes("route")) {
                route = component.long_name;
            }
        });

        // Combine street number and route
        const fullAddress = `${streetNumber} ${route}`.trim();
        const addressField = document.getElementById("address");
        if (addressField) {
            addressField.value = fullAddress;
            addressField.placeholder = ""; // Remove placeholder text
            addressField.setAttribute("readonly", "true"); // Make the field non-editable
            console.log("Address field value updated:", addressField.value);
        }

        // Map remaining fields (City, State, ZIP, etc.)
        const fieldMappings = {
            city: "locality",
            state: "administrative_area_level_1",
            zip: "postal_code",
        };

        Object.keys(fieldMappings).forEach((key) => {
            const field = document.getElementById(key);
            const component = place.address_components.find((c) =>
                c.types.includes(fieldMappings[key])
            );
            if (field && component) {
                field.value = component.long_name || component.short_name;
                field.placeholder = ""; // Remove placeholder text for city, state, and zip
                field.setAttribute("readonly", "true"); // Make these fields non-editable
                console.log(`${key} field value updated:`, field.value);
            }
        });

        // Handle state dropdown
        const stateField = document.getElementById("state");
        const stateComponent = place.address_components.find((c) =>
            c.types.includes("administrative_area_level_1")
        );
        if (stateField && stateComponent) {
            const stateAbbreviation = stateComponent.short_name;
            Array.from(stateField.options).forEach((option) => {
                option.selected = option.value === stateAbbreviation;
            });
            console.log("State field value updated:", stateAbbreviation);
        }
    });

    // Handle manual entry when Google can't find the address
    input.addEventListener("input", function () {
        const addressField = document.getElementById("address");
        const cityField = document.getElementById("city");
        const zipField = document.getElementById("zip");

        // Allow editing if Google can't find the address (i.e., no autocomplete)
        addressField.removeAttribute("readonly");
        cityField.removeAttribute("readonly");
        zipField.removeAttribute("readonly");
    });
}

// Make initAutocomplete accessible globally for the Google Maps callback
window.initAutocomplete = initAutocomplete;
