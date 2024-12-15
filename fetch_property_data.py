import requests
import sqlite3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get ATTOM API Key
ATTOM_API_KEY = os.getenv("ATTOM_API_KEY")
if not ATTOM_API_KEY:
    raise ValueError("ATTOM_API_KEY not found in .env file.")

# ATTOM API Base URL
BASE_URL = "https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail"

# Connect to shared database
DB_PATH = "valuator.db"
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()


# Function to fetch property data using address
def fetch_property_data(address, city, state, zip_code):
    headers = {
        "Accept": "application/json",
        "APIKey": ATTOM_API_KEY
    }
    params = {
        "address1": address,
        "address2": f"{city}, {state} {zip_code}"
    }

    print(f"Fetching property data for: {address}, {city}, {state}, {zip_code}")
    response = requests.get(BASE_URL, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        if data["status"]["code"] == 0 and data["status"]["total"] > 0:
            print("Data fetched successfully!")
            return data["property"][0]  # Return the first property result
        else:
            print(f"No results found for the address: {address}, {city}, {state}, {zip_code}")
            return None
    else:
        print(f"API Error: {response.status_code} - {response.text}")
        return None


# Function to save property data to the database
def save_property_data(file_number, property_data, comp_id=None):
    # Extract data from API response
    address = property_data["address"]["oneLine"]
    city = property_data["address"]["locality"]
    state = property_data["address"]["countrySubd"]
    zip_code = property_data["address"]["postal1"]
    county = property_data["area"].get("countyuse1", "") if not comp_id else None  # Include for subject only
    parcel_number = property_data["identifier"].get("apn", "") if not comp_id else None  # Include for subject only
    lot_size = property_data["lot"].get("lotSize1", None)
    bedrooms = property_data["building"]["rooms"].get("beds", None)
    full_baths = property_data["building"]["rooms"].get("bathsfull", None)  # Full baths
    half_baths = property_data["building"]["rooms"].get("bathshalf", None)  # Half baths
    gla = property_data["building"]["size"].get("livingsize", None)  # GLA
    year_built = property_data["summary"].get("yearbuilt", None)

    # Determine subject or comp fields
    prefix = f"comp{comp_id}_" if comp_id else "subject_"

    # Check if file_number exists
    cursor.execute("SELECT 1 FROM subject_value_table WHERE file_number = ?", (file_number,))
    exists = cursor.fetchone()

    if exists:
        # Update existing row
        query = f"""
            UPDATE subject_value_table
            SET {prefix}address = ?, {prefix}city = ?, {prefix}state = ?, {prefix}zip = ?,
                {prefix}lot_size = ?, {prefix}beds = ?, {prefix}full_baths = ?, {prefix}half_baths = ?,
                {prefix}gla = ?, {prefix}year_built = ?
        """
        values = [
            address, city, state, zip_code,
            lot_size, bedrooms, full_baths, half_baths, gla, year_built
        ]

        # Add parcel_number and county for subject property only
        if not comp_id:
            query += f", {prefix}parcel_number = ?, {prefix}county = ?"
            values.extend([parcel_number, county])

        query += " WHERE file_number = ?"
        values.append(file_number)

        print(f"Executing Update Query:\n{query}\nWith Values:\n{values}")
        cursor.execute(query, tuple(values))
    else:
        # Insert new row
        query = f"""
            INSERT INTO subject_value_table (
                file_number, {prefix}address, {prefix}city, {prefix}state, {prefix}zip,
                {prefix}lot_size, {prefix}beds, {prefix}full_baths, {prefix}half_baths,
                {prefix}gla, {prefix}year_built
        """
        values = [
            file_number, address, city, state, zip_code,
            lot_size, bedrooms, full_baths, half_baths, gla, year_built
        ]

        # Add parcel_number and county for subject property only
        if not comp_id:
            query += f", {prefix}parcel_number, {prefix}county"
            values.extend([parcel_number, county])

        query += ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?"

        # Add placeholders for parcel_number and county if it's the subject property
        if not comp_id:
            query += ", ?, ?"
        query += ")"

        print(f"Executing Insert Query:\n{query}\nWith Values:\n{values}")
        cursor.execute(query, tuple(values))

    conn.commit()
    print(f"Data saved successfully for {'Comparable ' + str(comp_id) if comp_id else 'Subject Property'}.")

# Modular fetch and save functions for subject and comps
def fetch_subject_data(file_number, address, city, state, zip_code):
    subject_data = fetch_property_data(address, city, state, zip_code)
    if subject_data:
        save_property_data(file_number, subject_data, comp_id=None)  # Use comp_id=None for subject


def fetch_comp_data(file_number, address, city, state, zip_code, comp_id):
    comp_data = fetch_property_data(address, city, state, zip_code)
    if comp_data:
        save_property_data(file_number, comp_data, comp_id=comp_id)  # Pass the comp_id

# Main function to handle fetching and saving data
def main():
    file_number = "12345"  # Example file number

    # Subject property details
    subject_address = "4529 Winona Ct"
    subject_city = "Denver"
    subject_state = "CO"
    subject_zip = "80212"

    # Fetch and save subject property
    print("Fetching and saving Subject Property...")
    fetch_subject_data(file_number, subject_address, subject_city, subject_state, subject_zip)

    # Comparable properties
    comparables = [
        {"address": "1042 Highline Ct", "city": "Loveland", "state": "CO", "zip": "80538"},
        {"address": "1024 Highline Ct", "city": "Loveland", "state": "CO", "zip": "80538"},
        {"address": "1043 Highline Ct", "city": "Loveland", "state": "CO", "zip": "80538"}
    ]

    # Fetch and save comparables
    for idx, comp in enumerate(comparables, start=1):
        print(f"Fetching and saving Comparable {idx}...")
        fetch_comp_data(file_number, comp["address"], comp["city"], comp["state"], comp["zip"], comp_id=idx)


if __name__ == "__main__":
    main()

# Close the database connection
conn.close()
