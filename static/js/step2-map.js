/**
 * This script integrates interactive map features, Google Places autocomplete, 
 * dynamic calculations, and form field enhancements to streamline user input and 
 * improve the overall user experience in a web application.
 * 
 * Key Features:
 * - **Map Integration:** Uses Leaflet with OpenStreetMap to display dynamic markers 
 *   for the subject property and comparables, updating based on user input.
 * - **Address Geocoding:** Geocodes addresses via Nominatim API to place markers 
 *   on the map and handles incomplete or invalid address inputs.
 * - **Google Maps Autocomplete:** Enhances address input fields with suggestions 
 *   and auto-fills related fields like city, state, and ZIP, while supporting manual entry.
 * - **Days on Market (DOM) Calculation:** Calculates the time a property was on 
 *   the market, updating dynamically when relevant fields change.
 * - **Site Size Conversion:** Converts inputted site size from square feet to acres 
 *   and updates fields automatically.
 * - **Event Listeners:** Monitors changes in address, date, and site size fields 
 *   to trigger appropriate updates across features.
 * 
 * TODO:
 * - **Autocomplete Compatibility:** Investigate whether Google Places Autocomplete 
 *   can work seamlessly alongside the Nominatim-based geocoding without conflicts.
 * - **Consolidate Logic:** Combine repetitive logic in the script to reduce redundancy 
 *   and improve maintainability.
 * - **Enhanced Error Handling:** Refine error logging and user feedback to provide 
 *   a smoother experience.
 * - **Performance Optimization:** Explore optimization strategies for geocoding 
 *   requests and map updates to ensure smooth performance for larger datasets.
 */


document.addEventListener('DOMContentLoaded', function () {
  // Initialize the map, default to the center of the US if no coordinates are passed
  var map = L.map('map').setView([39.8283, -98.5795], 4);  // Default center (USA)

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
  }).addTo(map);

  // Layer for markers
  var markersLayer = L.layerGroup().addTo(map);

  // Function to geocode addresses and add markers
  function geocodeAndAddMarkers() {
      // Clear existing markers
      markersLayer.clearLayers();

      var addresses = [
          {
              label: 'Subject',
              address: document.getElementById('subject_address').value,
              city: document.getElementById('subject_city').value,
              state: document.getElementById('subject_state').value,
              zip: document.getElementById('subject_zip').value,
          },
          {
              label: 'Comp 1',
              address: document.getElementById('comp1_address').value,
              city: document.getElementById('comp1_city').value,
              state: document.getElementById('comp1_state').value,
              zip: document.getElementById('comp1_zip').value,
          },
          {
              label: 'Comp 2',
              address: document.getElementById('comp2_address').value,
              city: document.getElementById('comp2_city').value,
              state: document.getElementById('comp2_state').value,
              zip: document.getElementById('comp2_zip').value,
          },
          {
              label: 'Comp 3',
              address: document.getElementById('comp3_address').value,
              city: document.getElementById('comp3_city').value,
              state: document.getElementById('comp3_state').value,
              zip: document.getElementById('comp3_zip').value,
          },
      ];

      addresses.forEach(function (item) {
          // Check if address fields are not empty
          if (item.address && item.city && item.state && item.zip) {
              var fullAddress = `${item.address}, ${item.city}, ${item.state} ${item.zip}`;
              geocodeAddress(fullAddress, function (latlng) {
                  if (latlng) {
                      var marker = L.marker(latlng).addTo(markersLayer);
                      marker.bindPopup(`<b>${item.label}</b><br>${fullAddress}`);
                  }
              });
          } else {
              console.warn('Incomplete address for:', item.label);
          }
      });
  }

  // Geocode function using Nominatim API
  function geocodeAddress(address, callback) {
      var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=3&q=' + encodeURIComponent(address);

      fetch(url)
          .then((response) => response.json())
          .then((data) => {
              if (data && data.length > 0) {
                  var lat = data[0].lat;
                  var lon = data[0].lon;
                  callback([lat, lon]);
              } else {
                  console.error('Address not found: ' + address);
                  callback(null);
              }
          })
          .catch((error) => {
              console.error('Error fetching geocode data:', error);
              callback(null);
          });
  }

  // Add event listeners to update map when addresses change
  ['subject', 'comp1', 'comp2', 'comp3'].forEach(function (prefix) {
      ['address', 'city', 'state', 'zip'].forEach(function (field) {
          var input = document.getElementById(prefix + '_' + field);
          if (input) {
              input.addEventListener('change', function () {
                  geocodeAndAddMarkers();
              });
          }
      });
  });

  // Get latitude and longitude from Flask's data attributes
  const latitude = parseFloat(document.getElementById('property_type_data').getAttribute('data-latitude'));
  const longitude = parseFloat(document.getElementById('property_type_data').getAttribute('data-longitude'));

  // If valid latitude and longitude, center the map on those coordinates
  if (latitude && longitude) {
      map.setView([latitude, longitude], 14);  // Zoom in closer to the location
      var marker = L.marker([latitude, longitude]).addTo(markersLayer);
      marker.bindPopup(`<b>Subject Property</b><br>${latitude}, ${longitude}`).openPopup();
  } else {
      console.error("Invalid latitude/longitude data");
  }

  // Initial call to populate map if addresses are pre-filled
  geocodeAndAddMarkers();
});


// // Load issues 
//     <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB5AOrudYl6jVW3gGRCc1i4aKdLj0JyA28&libraries=places&callback=initAutocomplete" async defer></script>

//     <script>
//         let autocomplete1, autocomplete2, autocomplete3;
    
//         function initAutocomplete() {
//             // Initialize Google Maps Autocomplete for comparables
//             autocomplete1 = new google.maps.places.Autocomplete(
//                 document.getElementById('comp1_address'), { types: ['geocode'] });
//             autocomplete2 = new google.maps.places.Autocomplete(
//                 document.getElementById('comp2_address'), { types: ['geocode'] });
//             autocomplete3 = new google.maps.places.Autocomplete(
//                 document.getElementById('comp3_address'), { types: ['geocode'] });
    
//             // Add event listeners to handle the place change for comparables
//             autocomplete1.addListener('place_changed', function() {
//                 fillInAddress(autocomplete1, 'comp1');
//             });
//             autocomplete2.addListener('place_changed', function() {
//                 fillInAddress(autocomplete2, 'comp2');
//             });
//             autocomplete3.addListener('place_changed', function() {
//                 fillInAddress(autocomplete3, 'comp3');
//             });
//         }
    
//         // Function to fill in the address and other fields (city, state, zip) based on the selected address
//         function fillInAddress(autocomplete, comp) {
//             const place = autocomplete.getPlace();
//             if (!place.geometry) {
//                 console.log("No details available for input: " + place.name);
//                 return;
//             }
    
//             // Fill in the address
//             document.getElementById(comp + '_address').value = place.formatted_address;
    
//             // Initialize the city, state, zip
//             let city = '';
//             let state = '';
//             let zip = '';
    
//             // Iterate through the address components and fill city, state, and zip
//             for (let i = 0; i < place.address_components.length; i++) {
//                 const component = place.address_components[i];
//                 if (component.types.includes("locality")) {
//                     city = component.long_name;
//                 }
//                 if (component.types.includes("administrative_area_level_1")) {
//                     state = component.short_name;
//                 }
//                 if (component.types.includes("postal_code")) {
//                     zip = component.long_name;
//                 }
//             }
    
//             // Populate the other fields with the extracted data
//             document.getElementById(comp + '_city').value = city;
//             document.getElementById(comp + '_state').value = state;
//             document.getElementById(comp + '_zip').value = zip;
//         }
//     </script> -->    

<script>
    // Function to calculate the DOM (Days on Market)
    function calculateDOM(listDateId, saleDateId, outputId) {
        const listDateValue = document.getElementById(listDateId).value;
        const saleDateValue = document.getElementById(saleDateId).value;

        if (listDateValue && saleDateValue) {
            const listDate = new Date(listDateValue);
            const saleDate = new Date(saleDateValue);

            if (!isNaN(listDate) && !isNaN(saleDate)) {
                const timeDiff = saleDate - listDate; // Difference in milliseconds
                const daysOnMarket = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert to days

                document.getElementById(outputId).value = daysOnMarket >= 0 ? daysOnMarket : 0;
                return;
            }
        }

        // Clear the DOM field if dates are invalid or missing
        document.getElementById(outputId).value = "";
    }

    // Attach event listeners to date fields
    document.addEventListener('DOMContentLoaded', function () {
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
    });
</script>

<script>document.addEventListener('DOMContentLoaded', function () {
    // Function to convert site size to acreage
    function convertToAcreage(inputField) {
        const sqftValue = parseFloat(inputField.value);
        if (!isNaN(sqftValue)) {
            if (sqftValue >= 43560) {
                const acreage = (sqftValue / 43560).toFixed(2); // Convert to acres
                inputField.value = acreage; // Only store numeric value
                inputField.setAttribute('data-acres', `${acreage} acres`); // Add display value as data attribute
            }
        } else {
            inputField.value = ""; // Clear field if the input is invalid
        }
    }

    // Add event listeners to all site size fields
    const siteSizeFields = document.querySelectorAll('#subject_site_size, #comp1_site_size, #comp2_site_size, #comp3_site_size');
    siteSizeFields.forEach(function (field) {
        field.addEventListener('change', function () {
            convertToAcreage(field);
        });
    });
});

</script>