/*
    File: map_and_autocomplete.js

    Summary:
    This file manages the integration of OpenStreetMap and Google Places API for geocoding,
    mapping, and autocomplete functionalities. It enables dynamic interaction with property 
    addresses and comparables, including:
    - Geocoding property addresses using the Nominatim API to display markers on OpenStreetMap.
    - Autocompleting addresses with Google Places Autocomplete for ease of input.
    - Calculating and displaying "Days on Market" (DOM) using date fields for comparables.
    - Converting site sizes from square feet to acreage with real-time calculations.

    Key Features:
    - Dynamically updates map markers as address data changes.
    - Adds keyboard event listeners to ensure seamless interaction with date fields and size inputs.
    - Highlights potential issues and includes TODOs for further debugging, such as improving map 
      initialization and resolving inconsistencies in geocoding behavior.

    TODO:
    - Fix inconsistencies in map initialization when latitude/longitude data is provided.
    - Investigate conflicts between Google Places Autocomplete and OpenStreetMap marker updates.
    - Enhance error handling for geocoding and autocomplete failures.

    Note:
    This script supports the valuation tool project but requires additional refinement to ensure
    production-level reliability and seamless user experience.
*/

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map, default to the center of the US if no coordinates are passed
    // TODO: Functionality is not consistent and was working prior to attempting to implement long and lattitude
    // From specific property addresses. Further research on the documentation is needed, there is probably an easier way
    const map = L.map('map').setView([39.8283, -98.5795], 4); // Default center (USA)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Layer for markers
    const markersLayer = L.layerGroup().addTo(map);

    // Geocode function using Nominatim API
    function geocodeAddress(address, callback) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${encodeURIComponent(address)}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    callback([data[0].lat, data[0].lon]);
                } else {
                    console.error(`Address not found: ${address}`);
                    callback(null);
                }
            })
            .catch(error => {
                console.error(`Error fetching geocode data: ${error}`);
                callback(null);
            });
    }

    // Function to geocode addresses and add markers
    function geocodeAndAddMarkers() {
        markersLayer.clearLayers();
        const addresses = [
            { label: 'Subject', id: 'subject' },
            { label: 'Comp 1', id: 'comp1' },
            { label: 'Comp 2', id: 'comp2' },
            { label: 'Comp 3', id: 'comp3' },
        ];

        addresses.forEach(item => {
            const address = document.getElementById(`${item.id}_address`).value;
            const city = document.getElementById(`${item.id}_city`).value;
            const state = document.getElementById(`${item.id}_state`).value;
            const zip = document.getElementById(`${item.id}_zip`).value;

            if (address && city && state && zip) {
                const fullAddress = `${address}, ${city}, ${state} ${zip}`;
                geocodeAddress(fullAddress, function (latlng) {
                    if (latlng) {
                        const marker = L.marker(latlng).addTo(markersLayer);
                        marker.bindPopup(`<b>${item.label}</b><br>${fullAddress}`);
                    }
                });
            } else {
                console.warn(`Incomplete address for: ${item.label}`);
            }
        });
    }

    // Attach event listeners to address fields
    ['subject', 'comp1', 'comp2', 'comp3'].forEach(prefix => {
        ['address', 'city', 'state', 'zip'].forEach(field => {
            const input = document.getElementById(`${prefix}_${field}`);
            if (input) {
                input.addEventListener('change', geocodeAndAddMarkers);
            }
        });
    });

    // Initialize Google Maps Autocomplete for address fields
    // TODO: May be conflicting with the existing fucntions
    let autocompleteInstances = {};

    function initAutocomplete() {
        ['comp1', 'comp2', 'comp3'].forEach(prefix => {
            autocompleteInstances[prefix] = new google.maps.places.Autocomplete(
                document.getElementById(`${prefix}_address`),
                { types: ['geocode'] }
            );

            autocompleteInstances[prefix].addListener('place_changed', function () {
                fillInAddress(autocompleteInstances[prefix], prefix);
            });
        });
    }

    function fillInAddress(autocomplete, prefix) {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            console.warn(`No details available for input: ${place.name}`);
            return;
        }

        document.getElementById(`${prefix}_address`).value = place.formatted_address;

        let city = '';
        let state = '';
        let zip = '';

        place.address_components.forEach(component => {
            if (component.types.includes('locality')) {
                city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name;
            }
            if (component.types.includes('postal_code')) {
                zip = component.long_name;
            }
        });

        document.getElementById(`${prefix}_city`).value = city;
        document.getElementById(`${prefix}_state`).value = state;
        document.getElementById(`${prefix}_zip`).value = zip;

        geocodeAndAddMarkers();
    }

    // Calculate DOM (Days on Market)
    function calculateDOM(listDateId, saleDateId, outputId) {
        const listDateValue = document.getElementById(listDateId).value;
        const saleDateValue = document.getElementById(saleDateId).value;

        if (listDateValue && saleDateValue) {
            const listDate = new Date(listDateValue);
            const saleDate = new Date(saleDateValue);

            if (!isNaN(listDate) && !isNaN(saleDate)) {
                const timeDiff = saleDate - listDate; 
                const daysOnMarket = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); 

                document.getElementById(outputId).value = daysOnMarket >= 0 ? daysOnMarket : 0;
                return;
            }
        }

        document.getElementById(outputId).value = '';
    }

    // Attach event listeners to date fields for DOM calculation
    const comparables = [
        { listDate: 'comp1_orig_list_date', saleDate: 'comp1_sale_date', output: 'comp1_cdom' },
        { listDate: 'comp2_orig_list_date', saleDate: 'comp2_sale_date', output: 'comp2_cdom' },
        { listDate: 'comp3_orig_list_date', saleDate: 'comp3_sale_date', output: 'comp3_cdom' },
    ];

    comparables.forEach(comp => {
        const listDateField = document.getElementById(comp.listDate);
        const saleDateField = document.getElementById(comp.saleDate);

        if (listDateField && saleDateField) {
            listDateField.addEventListener('change', () => calculateDOM(comp.listDate, comp.saleDate, comp.output));
            saleDateField.addEventListener('change', () => calculateDOM(comp.listDate, comp.saleDate, comp.output));
        }
    });

    // Convert site size to acreage
    function convertToAcreage(inputField) {
        const sqftValue = parseFloat(inputField.value);
        if (!isNaN(sqftValue)) {
            if (sqftValue >= 43560) {
                const acreage = (sqftValue / 43560).toFixed(2);
                inputField.value = acreage;
                inputField.setAttribute('data-acres', `${acreage} acres`);
            }
        } else {
            inputField.value = '';
        }
    }

    const siteSizeFields = document.querySelectorAll('#subject_site_size, #comp1_site_size, #comp2_site_size, #comp3_site_size');
    siteSizeFields.forEach(field => {
        field.addEventListener('change', () => convertToAcreage(field));
    });

    // Initialize map markers and autocomplete
    // TODO: Not working as expected, seems to be conflicting with the existing functions
    geocodeAndAddMarkers();
    initAutocomplete();
});
