async function fetchSubjectData() {
    const fileNumber = document.getElementById('file_number').value;

    if (!fileNumber) {
        alert('File number is required to fetch subject data.');
        return;
    }

    try {
        const response = await fetch(`/api/subject-data?file_number=${fileNumber}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        // Debugging: Print the fetched data
        console.log("Fetched subject data:", data);

        // Dynamically populate fields
        const fields = {
            subject_address: data.address,
            subject_unit: data.unit,
            subject_city: data.city,
            subject_state: data.state,
            subject_zip: data.zip,
            subject_beds: data.beds,
            subject_full_baths: data.full_baths,
            subject_half_baths: data.half_baths,
            subject_gla: data.gla,
            subject_site_size: data.site_size,
            subject_location: data.location,
            subject_view: data.view,
            subject_des_style: data.des_style,
            subject_condition: data.condition,
            subject_basement: data.basement,
            subject_garage: data.garage,
        };

        // Debugging: Print the data being populated
        console.log("Populating subject fields:", fields);

        for (const [field, value] of Object.entries(fields)) {
            const input = document.getElementById(field);
            if (input) {
                input.value = value || ''; // Use empty string if data is null/undefined
                console.log(`Field ${field} updated to: ${input.value}`);
            } else {
                console.error(`Field ${field} not found in the document.`);
            }
        }
    } catch (error) {
        console.error('Error fetching subject data:', error);
        alert('An unexpected error occurred while fetching subject data. Please try again.');
    }
}

async function fetchCompData(compNumber) {
    const fileNumber = document.getElementById('file_number').value;

    // Extract fields from the form
    const address = document.getElementById(`comp${compNumber}_address`)?.value || '';
    const city = document.getElementById(`comp${compNumber}_city`)?.value || '';
    const zip = document.getElementById(`comp${compNumber}_zip`)?.value || '';

    if (!fileNumber || !compNumber) {
        alert('File number and comparable number are required.');
        return;
    }

    // Optional: Warn the user if address details are incomplete
    if (!address || !city || !zip) {
        alert(`Please ensure that Address, City, and ZIP are filled for Comparable ${compNumber}.`);
        return;
    }

    try {
        // Fetch the comparable data based on the parameters
        const response = await fetch(
            `/api/comp-data?file_number=${encodeURIComponent(fileNumber)}&comp_number=${compNumber}&address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}&zip=${encodeURIComponent(zip)}`
        );

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        console.log(`Fetched data for comp${compNumber}:`, data);

        // Populate the fields for this comp with the fetched data
        const fields = {
            [`comp${compNumber}_address`]: data.address,
            [`comp${compNumber}_unit`]: data.unit,
            [`comp${compNumber}_city`]: data.city,
            [`comp${compNumber}_state`]: data.state,
            [`comp${compNumber}_zip`]: data.zip,
            [`comp${compNumber}_data_source`]: data.data_source,
            [`comp${compNumber}_mls`]: data.mls,
            [`comp${compNumber}_original_list_price`]: data.original_list_price,
            [`comp${compNumber}_original_list_date`]: data.original_list_date,
            [`comp${compNumber}_sale_price`]: data.sale_price,
            [`comp${compNumber}_sale_date`]: data.sale_date,
            [`comp${compNumber}_cdom`]: data.cdom,
            [`comp${compNumber}_site_size`]: data.site_size,
            [`comp${compNumber}_location`]: data.location,
            [`comp${compNumber}_view`]: data.view,
            [`comp${compNumber}_year_built`]: data.year_built,
            [`comp${compNumber}_des_style`]: data.des_style,
            [`comp${compNumber}_condition`]: data.condition,
            [`comp${compNumber}_beds`]: data.beds,
            [`comp${compNumber}_full_baths`]: data.full_baths,
            [`comp${compNumber}_half_baths`]: data.half_baths,
            [`comp${compNumber}_gla`]: data.gla,
            [`comp${compNumber}_basement`]: data.basement,
            [`comp${compNumber}_garage`]: data.garage,
        };

        for (const [field, value] of Object.entries(fields)) {
            const input = document.getElementById(field);
            if (input) {
                input.value = value || '';
            }
        }
    } catch (error) {
        console.error('Error fetching comparable data:', error);
        alert('An unexpected error occurred while fetching comparable data.');
    }
}
