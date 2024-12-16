import sqlite3
from flask import Flask, request, redirect, url_for, render_template, session, jsonify
from auth import register_user, validate_user  # from auth.py
import requests  # Intended to support ATTOM API integration on future deployment.
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env

GOOGLE_GEOCODING_API_KEY = os.getenv('GOOGLE_GEOCODING_API_KEY')
print("Loaded API Key: ", GOOGLE_GEOCODING_API_KEY)  # Debugging statement
ATTOM_API_KEY = os.getenv('ATTOM_API_KEY')
print("Loaded ATTOM API Key: ", ATTOM_API_KEY)  # Debugging statement
BASE_URL = "https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail"
print(f"BASE_URL: {BASE_URL}")


app = Flask(__name__)
app.secret_key = 'test'  # Change this to a more secure key in production

def init_users_db():
    try:
        conn = sqlite3.connect('users.db')  # Connect to users.db
        cursor = conn.cursor()
        # Users table for login authentication, separated in order not to have to clear users when valuator data is cleared.
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        print("Users table created (or already exists).")  
        conn.commit()
    except Exception as e:
        print(f"Error occurred while initializing the users database: {e}") 
    finally:
        conn.close()  

def init_db():
    try:
        print("Initializing the database...")

        conn = sqlite3.connect('valuator.db')
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")

        # Create consolidated table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS valuator_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_number TEXT UNIQUE NOT NULL,
                address TEXT,
                unit TEXT,
                city TEXT,
                state TEXT,
                zip TEXT,
                latitude REAL,
                longitude REAL,
                property_type TEXT,
                borrower_name TEXT,
                county TEXT,
                parcel_number TEXT,
                subject_data_source TEXT,
                subject_mls TEXT,
                subject_original_list_price REAL,
                subject_original_list_date TEXT,
                subject_sale_price REAL,
                subject_sale_date TEXT,
                subject_cdom INTEGER,
                subject_site_size REAL,
                subject_location TEXT,
                subject_view TEXT,
                subject_year_built INTEGER DEFAULT NULL,
                subject_des_style TEXT,
                subject_condition TEXT,
                subject_beds INTEGER,
                subject_full_baths INTEGER,
                subject_half_baths INTEGER,
                subject_gla REAL,
                subject_basement TEXT,
                subject_garage TEXT,
                additional_comments TEXT,
                comp1_address TEXT,
                comp1_unit TEXT,
                comp1_city TEXT,
                comp1_state TEXT,
                comp1_zip TEXT,
                comp1_data_source TEXT,
                comp1_mls TEXT,
                comp1_original_list_price REAL,
                comp1_original_list_date TEXT,
                comp1_sale_price REAL,
                comp1_sale_date TEXT,
                comp1_cdom INTEGER,
                comp1_site_size REAL,
                comp1_location TEXT,
                comp1_view TEXT,
                comp1_year_built INTEGER DEFAULT NULL,
                comp1_des_style TEXT,
                comp1_condition TEXT,
                comp1_beds INTEGER,
                comp1_full_baths INTEGER,
                comp1_half_baths INTEGER,
                comp1_gla REAL,
                comp1_basement TEXT,
                comp1_garage TEXT,
                comp2_address TEXT,
                comp2_unit TEXT,
                comp2_city TEXT,
                comp2_state TEXT,
                comp2_zip TEXT,
                comp2_data_source TEXT,
                comp2_mls TEXT,
                comp2_original_list_price REAL,
                comp2_original_list_date TEXT,
                comp2_sale_price REAL,
                comp2_sale_date TEXT,
                comp2_cdom INTEGER,
                comp2_site_size REAL,
                comp2_location TEXT,
                comp2_view TEXT,
                comp2_year_built INTEGER DEFAULT NULL,
                comp2_des_style TEXT,
                comp2_condition TEXT,
                comp2_beds INTEGER,
                comp2_full_baths INTEGER,
                comp2_half_baths INTEGER,
                comp2_gla REAL,
                comp2_basement TEXT,
                comp2_garage TEXT,
                comp3_address TEXT,
                comp3_unit TEXT,
                comp3_city TEXT,
                comp3_state TEXT,
                comp3_zip TEXT,
                comp3_data_source TEXT,
                comp3_mls TEXT,
                comp3_original_list_price REAL,
                comp3_original_list_date TEXT,
                comp3_sale_price REAL,
                comp3_sale_date TEXT,
                comp3_cdom INTEGER,
                comp3_site_size REAL,
                comp3_location TEXT,
                comp3_view TEXT,
                comp3_year_built INTEGER DEFAULT NULL,
                comp3_des_style TEXT,
                comp3_condition TEXT,
                comp3_beds INTEGER,
                comp3_full_baths INTEGER,
                comp3_half_baths INTEGER,
                comp3_gla REAL,
                comp3_basement TEXT,
                comp3_garage TEXT
            )
        ''')
        print("valuator_data table created successfully!")  # Debugging statement

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error occurred while initializing the database: {e}")  # Detailed error message

# Validate user session with error handling.
@app.route('/', methods=['GET', 'POST'])
def index():
    # Redirect logged-in users to avoid redundant login attempts.
    if session.get('user_id'):
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user_id = validate_user(username, password)
        
        if user_id:
            session['user_id'] = user_id
            return redirect(url_for('form_step1'))
        else:
            return "Invalid username or password", 401

    return render_template('index.html')  # Login form page

# Register new user with error handling.
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        print(f"Username entered: {username}")
        print(f"Password entered: {password}")

        error = register_user(username, password)
        if (error):
            return error
        return redirect(url_for('index'))
    return render_template('register.html')

@app.context_processor
def inject_api_key():
    return {'GOOGLE_GEOCODING_API_KEY': os.getenv('GOOGLE_GEOCODING_API_KEY')} 

# Dashboard is intended as a landing page for future application features.
@app.route('/dashboard')
def dashboard():
    if not session.get('user_id'):
        return redirect(url_for('index'))
    username = session.get('username')  # Retrieve the username from the session
    return render_template('dashboard.html', username=username)

# Logout function to clear session and redirect to login page.
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# Check if file number already exists in the database.
@app.route('/check_file_number', methods=['POST'])
def check_file_number():
    data = request.get_json()  # Get JSON data from the request
    file_number = data.get('file_number')

    conn = sqlite3.connect('valuator.db')
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM valuator_data WHERE file_number = ?', (file_number,))
    existing_entry = cursor.fetchone()
    conn.close()

    return jsonify({'exists': bool(existing_entry)})

@app.route('/get-lat-lng', methods=['POST'])
def get_lat_lng():
    try:
        data = request.get_json()
        address = data.get('address', '')

        if not address:
            print("Error: Address missing from request.")
            return jsonify({'error': 'Address is required'}), 400

        print(f"Fetching coordinates for: {address}")

        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_GEOCODING_API_KEY}"
        response = requests.get(url)
        geocode_data = response.json()

        print("Geocoding API Response:", geocode_data)

        if (geocode_data['status'] == 'OK'):
            location = geocode_data['results'][0]['geometry']['location']
            return jsonify({'latitude': location['lat'], 'longitude': location['lng']})
        else:
            print(f"Error from Google API: {geocode_data.get('status', 'Unknown error')}")
            return jsonify({'error': geocode_data.get('status', 'Unknown error')}), 500
    except Exception as e:
        print(f"Server Error in /get-lat-lng: {e}")
        print(f"Address received for geocoding: {address}")
        return jsonify({'error': 'Internal Server Error'}), 500

# Form Step 1 is intended to collect data for the first step of the form. Functioning as intended. 
# TODO: Future functionality could include API integration to populate certain data from employer internal source. 
@app.route('/form-step1', methods=['GET', 'POST'])
def form_step1():
    if not session.get('user_id'):
        return redirect(url_for('index'))

    if request.method == 'POST':
        # Debugging: Print all received form data
        print("Form Data Received:", request.form.to_dict())

        address = request.form.get('address')
        unit = request.form.get('unit')
        city = request.form.get('city')
        state = request.form.get('state')
        zip_code = request.form.get('zip')
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')
        property_type = request.form.get('property_type')
        borrower_name = request.form.get('borrower_name')
        file_number = request.form.get('file_number')

        # Debugging: Check if latitude and longitude are received
        print(f"Latitude: {latitude}, Longitude: {longitude}")

        # Check if file number already exists
        conn = sqlite3.connect('valuator.db')
        cursor = conn.cursor()
        cursor.execute('SELECT file_number FROM valuator_data WHERE file_number = ?', (file_number,))
        existing_entry = cursor.fetchone()

        if existing_entry:
            error_message = f"File number {file_number} already exists. Please enter a unique file number."
            return render_template('form_step1.html', error_message=error_message)

        # Debugging: Confirm data being inserted into the DB
        print("Inserting into DB:", address, unit, city, state, zip_code, latitude, longitude, property_type, borrower_name, file_number)

        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON;")

        # Insert into consolidated table
        cursor.execute('''
            INSERT INTO valuator_data (file_number, address, unit, city, state, zip, latitude, longitude, property_type, borrower_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (file_number, address, unit, city, state, zip_code, latitude, longitude, property_type, borrower_name))
        conn.commit()

        # Fetch subject data from ATTOM API
        headers = {
            "Accept": "application/json",
            "APIKey": ATTOM_API_KEY
        }
        params = {
            "address1": address,
            "address2": f"{city}, {state} {zip_code}"
        }

        response = requests.get(BASE_URL, headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            if data["status"]["code"] == 0 and data["status"]["total"] > 0:
                property_data = data["property"][0]

                # Extract all needed data
                county = property_data["area"].get("countrysecsubd", "")
                parcel_number = property_data["identifier"].get("apn", "")
                gla = property_data["building"]["size"].get("livingsize", None)
                year_built = property_data["summary"].get("yearbuilt", None)
                beds = property_data["building"]["rooms"].get("beds", None)
                full_baths = property_data["building"]["rooms"].get("bathsfull", None)
                half_baths = property_data["building"]["rooms"].get("bathstotal", 0) - full_baths if full_baths else 0
                condition = property_data["building"]["construction"].get("condition", "")
                view = property_data["building"]["summary"].get("view", "")
                site_size = property_data["lot"].get("lotsize2", None)
                garage = property_data["building"]["parking"].get("garagetype", "")
                basement = property_data["building"]["interior"].get("bsmtsize", None)

                # Update database
                cursor.execute('''
                    UPDATE valuator_data
                    SET 
                        county = ?, parcel_number = ?, subject_gla = ?, subject_year_built = ?, 
                        subject_beds = ?, subject_full_baths = ?, subject_half_baths = ?, subject_condition = ?, 
                        subject_view = ?, subject_site_size = ?, subject_garage = ?, subject_basement = ?
                    WHERE file_number = ?
                ''', (
                    county, parcel_number, gla, year_built, beds, full_baths, half_baths, 
                    condition, view, site_size, garage, basement, file_number
                ))
                conn.commit()
                print("Subject data fetched and saved successfully.")
            else:
                print("No data found from ATTOM API.")
        else:
            print(f"Error fetching data from ATTOM API: {response.status_code} - {response.text}")

        conn.close()

        return redirect(url_for('form_step2', file_number=file_number))

    return render_template('form_step1.html', api_key=os.getenv('GOOGLE_GEOCODING_API_KEY'))

# Form Step 2: Functional but lacking additional features to enhance UX. 
# TODO:
# - (Enhancement) Google API autocomplete does not always load properly.
# - (Enhancement) OpenStreetMap markers are inconsistent (possibly due to listener conflicts or load timing).
# - (Enhancement) Additional features could include a map view of the property and comparables. Ideally, MAP would zoom in to the property and comparables.
# - (Enhancement) ATTOM API integration. Approximately 30% of the data should be populated from the ATTOM API.
@app.route('/form-step2/<file_number>', methods=['GET', 'POST'])
def form_step2(file_number):
    if not session.get('user_id'):
        return redirect(url_for('index'))

    # Fetch the data from valuator_data using the file_number
    conn = sqlite3.connect('valuator.db')
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    cursor.execute('SELECT * FROM valuator_data WHERE file_number = ?', (file_number,))
    existing_entry = cursor.fetchone()

    # If no entry exists for the provided file number, redirect back to Step 1
    if not existing_entry:
        conn.close()
        return redirect(url_for('form_step1'))

    # Pre-populate form with the existing data from valuator_data
    prepopulated_data = {
        'file_number': existing_entry[1],
        'address': existing_entry[2],
        'unit': existing_entry[3],
        'city': existing_entry[4],
        'state': existing_entry[5],
        'zip': existing_entry[6],
        'latitude': existing_entry[7],
        'longitude': existing_entry[8],
        'borrower_name': existing_entry[10],
        'property_type': existing_entry[9],
        'county': existing_entry[11],
        'parcel_number': existing_entry[12],
        'subject_gla': existing_entry[29],
        'subject_year_built': existing_entry[23],
        'subject_beds': existing_entry[26],
        'subject_full_baths': existing_entry[27],
        'subject_half_baths': existing_entry[28],
        'subject_condition': existing_entry[25],
        'subject_view': existing_entry[22],
        'subject_site_size': existing_entry[20],
        'subject_garage': existing_entry[31],
        'subject_basement': existing_entry[30],
        'comp1_full_baths': existing_entry[52],
        'comp2_full_baths': existing_entry[76],
        'comp3_full_baths': existing_entry[100]
    }

    if request.method == 'POST':
        # Collect subject data with defaults for optional fields
        subject_data = {
            'subject_address': request.form.get('subject_address', ""),
            'subject_unit': request.form.get('subject_unit', ""),
            'subject_city': request.form.get('subject_city', ""),
            'subject_state': request.form.get('subject_state', ""),
            'subject_zip': request.form.get('subject_zip', ""),
            'subject_county': request.form.get('subject_county', ""),
            'subject_parcel_number': request.form.get('parcel_number', ""),
            'subject_data_source': request.form.get('subject_data_source', ""),
            'subject_mls': request.form.get('subject_mls', ""),
            'subject_original_list_price': request.form.get('subject_original_list_price', None),
            'subject_original_list_date': request.form.get('subject_original_list_date', ""),
            'subject_sale_price': request.form.get('subject_sale_price', None),
            'subject_sale_date': request.form.get('subject_sale_date', ""),
            'subject_cdom': request.form.get('subject_cdom', None),
            'subject_site_size': request.form.get('subject_site_size', None),
            'subject_location': request.form.get('subject_location', ""),
            'subject_view': request.form.get('subject_view', ""),
            'subject_des_style': request.form.get('subject_des_style', ""),
            'subject_condition': request.form.get('subject_condition', ""),
            'subject_beds': request.form.get('subject_beds', None),
            'subject_full_baths': request.form.get('subject_full_baths', None),
            'subject_half_baths': request.form.get('subject_half_baths', None),
            'subject_gla': request.form.get('subject_gla', None),
            'subject_basement': request.form.get('subject_basement', ""),
            'subject_garage': request.form.get('subject_garage', ""),
            'additional_comments': request.form.get('additional_comments', "")
        }

        # Collect Comparable 1 data with defaults for optional fields
        comp1_data = {
            'comp1_address': request.form.get('comp1_address', ""),
            'comp1_unit': request.form.get('comp1_unit', ""),
            'comp1_city': request.form.get('comp1_city', ""),
            'comp1_state': request.form.get('comp1_state', ""),
            'comp1_zip': request.form.get('comp1_zip', ""),
            'comp1_data_source': request.form.get('comp1_data_source', ""),
            'comp1_mls': request.form.get('comp1_mls', ""),
            'comp1_original_list_price': request.form.get('comp1_orig_list_price', None),
            'comp1_original_list_date': request.form.get('comp1_orig_list_date', ""),
            'comp1_sale_price': request.form.get('comp1_sale_price', None),
            'comp1_sale_date': request.form.get('comp1_sale_date', ""),
            'comp1_cdom': request.form.get('comp1_cdom', None),
            'comp1_site_size': request.form.get('comp1_site_size', None),
            'comp1_location': request.form.get('comp1_location', ""),
            'comp1_view': request.form.get('comp1_view', ""),
            'comp1_des_style': request.form.get('comp1_des_style', ""),
            'comp1_condition': request.form.get('comp1_condition', ""),
            'comp1_beds': request.form.get('comp1_beds', None),
            'comp1_full_baths': request.form.get('comp1_full_baths', None),
            'comp1_half_baths': request.form.get('comp1_half_baths', None),
            'comp1_gla': request.form.get('comp1_gla', None),
            'comp1_basement': request.form.get('comp1_basement', ""),
            'comp1_garage': request.form.get('comp1_garage', "")
        }

        # Collect Comparable 2 data with defaults for optional fields
        comp2_data = {
            'comp2_address': request.form.get('comp2_address', ""),
            'comp2_unit': request.form.get('comp2_unit', ""),
            'comp2_city': request.form.get('comp2_city', ""),
            'comp2_state': request.form.get('comp2_state', ""),
            'comp2_zip': request.form.get('comp2_zip', ""),
            'comp2_data_source': request.form.get('comp2_data_source', ""),
            'comp2_mls': request.form.get('comp2_mls', ""),
            'comp2_original_list_price': request.form.get('comp2_orig_list_price', None),
            'comp2_original_list_date': request.form.get('comp2_orig_list_date', ""),
            'comp2_sale_price': request.form.get('comp2_sale_price', None),
            'comp2_sale_date': request.form.get('comp2_sale_date', ""),
            'comp2_cdom': request.form.get('comp2_cdom', None),
            'comp2_site_size': request.form.get('comp2_site_size', None),
            'comp2_location': request.form.get('comp2_location', ""),
            'comp2_view': request.form.get('comp2_view', ""),
            'comp2_des_style': request.form.get('comp2_des_style', ""),
            'comp2_condition': request.form.get('comp2_condition', ""),
            'comp2_beds': request.form.get('comp2_beds', None),
            'comp2_full_baths': request.form.get('comp2_full_baths', None),
            'comp2_half_baths': request.form.get('comp2_half_baths', None),
            'comp2_gla': request.form.get('comp2_gla', None),
            'comp2_basement': request.form.get('comp2_basement', ""),
            'comp2_garage': request.form.get('comp2_garage', "")
        }

        # Collect Comparable 3 data with defaults for optional fields
        comp3_data = {
            'comp3_address': request.form.get('comp3_address', ""),
            'comp3_unit': request.form.get('comp3_unit', ""),
            'comp3_city': request.form.get('comp3_city', ""),
            'comp3_state': request.form.get('comp3_state', ""),
            'comp3_zip': request.form.get('comp3_zip', ""),
            'comp3_data_source': request.form.get('comp3_data_source', ""),
            'comp3_mls': request.form.get('comp3_mls', ""),
            'comp3_original_list_price': request.form.get('comp3_orig_list_price', None),
            'comp3_original_list_date': request.form.get('comp3_orig_list_date', ""),
            'comp3_sale_price': request.form.get('comp3_sale_price', None),
            'comp3_sale_date': request.form.get('comp3_sale_date', ""),
            'comp3_cdom': request.form.get('comp3_cdom', None),
            'comp3_site_size': request.form.get('comp3_site_size', None),
            'comp3_location': request.form.get('comp3_location', ""),
            'comp3_view': request.form.get('comp3_view', ""),
            'comp3_des_style': request.form.get('comp3_des_style', ""),
            'comp3_condition': request.form.get('comp3_condition', ""),
            'comp3_beds': request.form.get('comp3_beds', None),
            'comp3_full_baths': request.form.get('comp3_full_baths', None),
            'comp3_half_baths': request.form.get('comp3_half_baths', None),
            'comp3_gla': request.form.get('comp3_gla', None),
            'comp3_basement': request.form.get('comp3_basement', ""),
            'comp3_garage': request.form.get('comp3_garage', "")
        }

        # Combine all data for insertion
        combined_data = {**subject_data, **comp1_data, **comp2_data, **comp3_data}

        # Fetch database columns
        cursor.execute("PRAGMA table_info(valuator_data);")
        db_columns_info = cursor.fetchall()
        db_columns = [info[1] for info in db_columns_info if info[1] != 'id']  # Exclude 'id'

        # Adjust combined_data to include only DB fields
        valid_data = {key: combined_data.get(key) for key in db_columns}

        # Prepare the INSERT statement
        placeholders = ', '.join(['?'] * len(valid_data))
        columns = ', '.join(valid_data.keys())

        try:
            cursor.execute(f'''
                INSERT INTO valuator_data ({columns}) VALUES ({placeholders})
            ''', tuple(valid_data.values()))
            conn.commit()
            print("Data inserted successfully.")
        except Exception as e:
            print(f"Error inserting data: {e}")
            return "An error occurred while saving the data.", 500
        finally:
            conn.close()

        # Redirect after successful submission
        return redirect(url_for('dashboard'))  # Example redirection

    return render_template('form_step2.html', **prepopulated_data)  # Render Form Step 2 for GET requests

@app.route('/api/subject-data', methods=['GET'])
def api_subject_data():
    file_number = request.args.get('file_number')

    if not file_number:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        conn = sqlite3.connect('valuator.db')
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")

        cursor.execute('SELECT * FROM valuator_data WHERE file_number = ?', (file_number,))
        existing_entry = cursor.fetchone()
        conn.close()

        if not existing_entry:
            return jsonify({"error": "No data found"}), 404

        # Extract subject data from the database
        subject_data = {
            "address": existing_entry[2],
            "unit": existing_entry[3],
            "city": existing_entry[4],
            "state": existing_entry[5],
            "zip": existing_entry[6],
            "county": existing_entry[11],
            "parcel_number": existing_entry[12],
            "gla": existing_entry[29],
            "year_built": existing_entry[23],
            "beds": existing_entry[26],
            "full_baths": existing_entry[27],
            "half_baths": existing_entry[28],
            "condition": existing_entry[25],
            "view": existing_entry[22],
            "site_size": existing_entry[20],
            "garage": existing_entry[31],
            "basement": existing_entry[30]
        }

        return jsonify(subject_data)
    except Exception as e:
        print(f"Error in api_subject_data: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/comp-data', methods=['GET'])
def api_comp_data():
    file_number = request.args.get('file_number')
    comp_number = request.args.get('comp_number')  # comp1, comp2, or comp3
    address = request.args.get('address')
    city = request.args.get('city')
    zip_code = request.args.get('zip')

    # Ensure required parameters are provided
    if not all([file_number, comp_number, address, city, zip_code]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        comp_number = int(comp_number)  # Ensure comp_number is an integer

        conn = sqlite3.connect('valuator.db')
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")

        # Query the database for the matching file number and other parameters
        cursor.execute('''
            SELECT * FROM valuator_data 
            WHERE file_number = ? AND
                  comp{0}_address = ? AND
                  comp{0}_city = ? AND
                  comp{0}_zip = ?
        '''.format(comp_number), (file_number, address, city, zip_code))
        existing_entry = cursor.fetchone()
        conn.close()

        if not existing_entry:
            return jsonify({"error": "No data found"}), 404

        # Extract comp data from the database
        comp_data = {
            "address": existing_entry[33 + (comp_number - 1) * 24],
            "unit": existing_entry[34 + (comp_number - 1) * 24],
            "city": existing_entry[35 + (comp_number - 1) * 24],
            "state": existing_entry[36 + (comp_number - 1) * 24],
            "zip": existing_entry[37 + (comp_number - 1) * 24],
            "data_source": existing_entry[38 + (comp_number - 1) * 24],
            "mls": existing_entry[39 + (comp_number - 1) * 24],
            "original_list_price": existing_entry[40 + (comp_number - 1) * 24],
            "original_list_date": existing_entry[41 + (comp_number - 1) * 24],
            "sale_price": existing_entry[42 + (comp_number - 1) * 24],
            "sale_date": existing_entry[43 + (comp_number - 1) * 24],
            "cdom": existing_entry[44 + (comp_number - 1) * 24],
            "site_size": existing_entry[45 + (comp_number - 1) * 24],
            "location": existing_entry[46 + (comp_number - 1) * 24],
            "view": existing_entry[47 + (comp_number - 1) * 24],
            "year_built": existing_entry[48 + (comp_number - 1) * 24],
            "des_style": existing_entry[49 + (comp_number - 1) * 24],
            "condition": existing_entry[50 + (comp_number - 1) * 24],
            "beds": existing_entry[51 + (comp_number - 1) * 24],
            "full_baths": existing_entry[52 + (comp_number - 1) * 24],
            "half_baths": existing_entry[53 + (comp_number - 1) * 24],
            "gla": existing_entry[54 + (comp_number - 1) * 24],
            "basement": existing_entry[55 + (comp_number - 1) * 24],
            "garage": existing_entry[56 + (comp_number - 1) * 24]
        }

        return jsonify(comp_data)
    except ValueError:
        return jsonify({"error": "Invalid comp_number"}), 400
    except Exception as e:
        print(f"Error in api_comp_data: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Initialize the DB before running the server
    with app.app_context():
        init_db()
        init_users_db()
    app.run(debug=True)
