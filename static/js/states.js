/*
    Summary:
    This script dynamically populates a dropdown menu with a list of U.S. states, formatted as 
    "AB - State Name" (e.g., "CA - California"). It was implemented for the Step 1 form to enhance 
    user experience by providing a pre-defined, standardized list of states for selection.

    Key Features:
    - Dynamically creates <option> elements for each state.
    - Uses state abbreviations (e.g., "CA") as the value of the dropdown options.
    - Displays full state names (e.g., "CA - California") for user readability.

    To-Do:
    - Extend this functionality to Step 2 for consistency in state selection across forms.
    - Ensure compatibility with any pre-existing state-handling logic in Step 2.
*/


document.addEventListener("DOMContentLoaded", () => {
    const stateDropdown = document.getElementById("state");

    // List of states you mentioned, formatted as "AB - State Name"
    const states = [
        "AL - Alabama", "AZ - Arizona", "AR - Arkansas", "CA - California", "CO - Colorado", 
        "CT - Connecticut", "FL - Florida", "GA - Georgia", "IL - Illinois", "IN - Indiana",
        "KS - Kansas", "KY - Kentucky", "MA - Massachusetts", "MD - Maryland", "MI - Michigan", 
        "MN - Minnesota", "MO - Missouri", "NC - North Carolina", "NJ - New Jersey", "NV - Nevada", 
        "NY - New York", "OH - Ohio", "OK - Oklahoma", "OR - Oregon", "PA - Pennsylvania", 
        "SC - South Carolina", "TN - Tennessee", "TX - Texas", "VA - Virginia", "WA - Washington", 
        "WI - Wisconsin", "WV - West Virginia", "DC - Washington D.C."
    ];

    // Populate the state dropdown with options
    states.forEach(state => {
        const option = document.createElement("option");
        option.value = state.split(" - ")[0];  // Use the abbreviation as value
        option.textContent = state;  // Full state with abbreviation
        stateDropdown.appendChild(option);
    });
});