// Function to fetch subject data from the backend
function fetchSubjectData() {
    const address = document.getElementById("subject_address").value;
    const city = document.getElementById("subject_city").value;
    const state = document.getElementById("subject_state").value;
    const zip = document.getElementById("subject_zip").value;

    // Fetch data from the backend endpoint
    fetch(`/api/subject-data?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&zip=${encodeURIComponent(zip)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch subject data");
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                populateFields(data, "subject");
            }
        })
        .catch(error => console.error("Error fetching subject data:", error));
}

// Function to fetch comparable data from the backend
function fetchCompData(compNumber) {
    const address = document.getElementById(`comp${compNumber}_address`).value;
    const city = document.getElementById(`comp${compNumber}_city`).value;
    const state = document.getElementById(`comp${compNumber}_state`).value;
    const zip = document.getElementById(`comp${compNumber}_zip`).value;

    // Fetch data from the backend endpoint
    fetch(`/api/comp-data?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&zip=${encodeURIComponent(zip)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch comparable data");
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                populateFields(data, `comp${compNumber}`);
            }
        })
        .catch(error => console.error(`Error fetching comparable ${compNumber} data:`, error));
}

// Helper function to populate form fields
function populateFields(data, prefix) {
    Object.keys(data).forEach(key => {
        const field = document.getElementById(`${prefix}_${key}`);
        if (field) {
            field.value = data[key] || ''; // Populate field or leave blank if null
        }
    });
}
