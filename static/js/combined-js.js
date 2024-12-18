document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed.");

    // Initialize Google Places Autocomplete
    function initAutocomplete() {
        const autocompleteInput = document.getElementById('autocomplete');
        if (!autocompleteInput) {
            console.error("Autocomplete input not found.");
            return;
        }

        const autocomplete = new google.maps.places.Autocomplete(autocompleteInput, {
            types: ['geocode'],
            componentRestrictions: { country: 'us' },
        });

        autocomplete.addListener('place_changed', function () {
            const place = autocomplete.getPlace();
            if (!place.address_components) {
                console.error('Place details not found.');
                alert('Could not fetch address components for this place.');
                return;
            }

            // Populate the fields based on the selected place
            updateAddressFields(place);
        });
    }

    // Populate address fields from autocomplete place
    function updateAddressFields(place) {
        const fieldMappings = {
            address: ['street_number', 'route'],
            city: 'locality',
            state: 'administrative_area_level_1',
            zip: 'postal_code',
        };

        Object.keys(fieldMappings).forEach((key) => {
            const field = document.getElementById(key);
            let value = "";

            if (Array.isArray(fieldMappings[key])) {
                value = fieldMappings[key]
                    .map((type) => {
                        const component = place.address_components.find((c) =>
                            c.types.includes(type)
                        );
                        return component ? component.long_name : "";
                    })
                    .join(" ")
                    .trim();
            } else {
                const component = place.address_components.find((c) =>
                    c.types.includes(fieldMappings[key])
                );
                if (key === 'state') {
                    value = component ? component.short_name : ""; // Use short_name for state
                } else {
                    value = component ? component.long_name : "";
                }
            }

            if (field) {
                field.value = value;
                console.log(`${key} updated to: ${value}`);
                triggerChangeEvent(field); // Trigger `change` event programmatically
            }
        });
    }

    // Fetch latitude and longitude for manual address entry
    function fetchLatLng() {
        const addressField = document.getElementById('address');
        const cityField = document.getElementById('city');
        const stateField = document.getElementById('state');
        const zipField = document.getElementById('zip');
        const latField = document.getElementById('latitude');
        const lngField = document.getElementById('longitude');

        if (!addressField || !cityField || !stateField || !zipField || !latField || !lngField) {
            console.error('Required fields for geocoding are missing.');
            return;
        }

        const fullAddress = `${addressField.value}, ${cityField.value}, ${stateField.value}, ${zipField.value}`;
        console.log('Geocoding address:', fullAddress);

        fetch('/get-lat-lng', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: fullAddress }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.latitude && data.longitude) {
                    latField.value = data.latitude;
                    lngField.value = data.longitude;
                    console.log(`Geocoded Lat/Lng: ${data.latitude}, ${data.longitude}`);
                } else {
                    console.error('Geocoding failed:', data.error || 'Unknown error');
                }
            })
            .catch((error) => {
                console.error('Error during geocoding:', error);
            });
    }

    // Attach listeners to individual fields for geocoding
    ['address', 'city', 'state', 'zip'].forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', fetchLatLng);
        }
    });

    // Trigger `change` event programmatically for updated fields
    function triggerChangeEvent(field) {
        if (!field) return;
        const event = new Event('change', { bubbles: true });
        field.dispatchEvent(event);
    }

    // Add missing global function for initialization
    window.initAutocomplete = initAutocomplete;
});
