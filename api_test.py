import requests
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API Key from .env file
API_KEY = os.getenv("ATTOM_API_KEY")

if not API_KEY:
    raise ValueError("API key not found in .env file. Please set ATTOM_API_KEY.")

# Define the address, city, and state
address = "4529 Winona Court"
city = "Denver"
state = "CO"

# URL-encode the address components
address_encoded = address.replace(" ", "%20")
city_encoded = city.replace(" ", "%20")

# Construct the API URL
url = f"https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?address1={address_encoded}&address2={city_encoded}%2C%20{state}"

# Headers
headers = {
    "Accept": "application/json",
    "APIKey": API_KEY
}

# Make the API call
response = requests.get(url, headers=headers)

if response.status_code == 200:
    print("API Call Successful!")
    data = response.json()  # Parse JSON response

    # Save response to output.json
    with open("output.json", "w") as outfile:
        json.dump(data, outfile, ensure_ascii=False, indent=4)
    print("Response saved to output.json")
else:
    print(f"Error: {response.status_code}")
    print(response.text)