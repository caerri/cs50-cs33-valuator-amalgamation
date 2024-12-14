/*
    Summary:
    This function validates a form by checking if all required fields 
    (marked with the `required` attribute) are filled. If any field is empty, 
    it alerts the user and prevents form submission. Otherwise, it allows the form to submit.

    Key Features:
    - Ensures required fields are completed before submission.
    - Displays an alert specifying the missing field.
    - Simple validation for basic form, created for Step1.html form.
*/

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');

    // Loop through each required field
    for (const field of requiredFields) {
        // Check if the field is empty
        if (!field.value.trim()) {
            alert(`${field.name} is required.`);
            return false; // Prevent form submission
        }
    }
    return true; // Allow form submission if all checks pass
}