""" This module does not currently function. ATTOM approved my request for a trial developer API. 
I am not sure why the API is not allowing me to authenticate. I also created a test_attom.py which 
confirms authentication issues, unfortunately. It seems that ATTOM documentation outlines that implementation
with Python and js is possible. I will continue to work on this issue to showcase to my employer. 
After reviewing the ATTOM API documentation, I still feel that this was an appropriate approach to take. 
I am leaving this here as I feel it could provide value in the future after troubleshooting authentication or
subscription issues that may require a paid subscription.

"""

import http.client
import json

def get_property_data(address, city, state, zip_code):
    api_key = "e8cca6c67865e587c6e4f936cf3e6491"  # Replace with your actual API key

    # Prepare the request URL with encoded address, city, state, and zip code
    url = f"/propertyapi/v1.0.0/property/detail?address1={address}&address2={city}%2C%20{state}%2C%20{zip_code}"

    # Establish a connection to the ATTOM API
    conn = http.client.HTTPSConnection("api.gateway.attomdata.com")

    headers = {
        'accept': "application/json",
        'apikey': api_key
    }

    try:
        # Make the GET request to ATTOM API
        conn.request("GET", url, headers=headers)

        # Get the response from the API
        res = conn.getresponse()
        data = res.read()

        # Convert the response to a string (JSON format)
        response_json = json.loads(data.decode("utf-8"))

        # Print the full response to check its structure
        print("Response from ATTOM API:", response_json)

        # Now safely extract data from the response, ensuring it is the correct type
        if isinstance(response_json, dict) and 'property' in response_json:
            property_data = response_json['property']
            
            # Check if 'property' is a list, then get the first item
            if isinstance(property_data, list) and len(property_data) > 0:
                county = property_data[0].get('county', 'Not Available')
                parcel_number = property_data[0].get('parcelNumber', 'Not Available')
            else:
                county = 'Not Available'
                parcel_number = 'Not Available'
        else:
            print("Unexpected response format:", response_json)
            return None, None

        return county, parcel_number

    except Exception as e:
        print(f"Error fetching data from ATTOM API: {e}")
        return None, None