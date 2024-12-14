# Purpose: This file demonstrates an attempt to integrate the ATTOM API for property data retrieval.
# While authentication issues prevented full implementation, it remains in the project to showcase:
# 1. Proof of Concept:
#    - Demonstrates the initial setup for accessing the ATTOM API with correct HTTP request structure.
#    - Includes proper headers, including the "Authorization: Bearer" token, and formatted URL parameters.
# 2. API Exploration:
#    - Serves as documentation for testing connectivity and response handling from the ATTOM API.
#    - Validates the feasibility of using the API for future implementation once authentication issues are resolved.
# 3. Learning Documentation:
#    - Retained to showcase challenges encountered during the project and future steps for resolution.

import http.client

# Set up the connection
conn = http.client.HTTPSConnection("api.gateway.attomdata.com")

# Correctly formatted headers with Authorization: Bearer YOUR_API_KEY
headers = { 
    'accept': "application/json", 
    'Authorization': "Bearer e8cca6c67865e587c6e4f936cf3e6491"  # Replace with your actual API key
}

# Correctly formatted URL, ensure no line breaks in the string
url = "/propertyapi/v1.0.0/property/detail?address1=4529%20Winona%20Court&address2=Denver%2C%20CO"

# Make the GET request
conn.request("GET", url, headers=headers)

# Get the response
res = conn.getresponse()

# Read the response data
data = res.read()

# Print the response (decoded as a string)
print(data.decode("utf-8"))