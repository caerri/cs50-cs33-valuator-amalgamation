=====================================================
Valuator Tool: A Real Estate Appraisal Application
=====================================================

Valuator Tool is an interactive web application designed to simplify the
real estate appraisal process. With built-in mapping, database storage,
and user-friendly forms, this tool demonstrates practical applications
of database integration, API use, and intuitive design as part of CS50.

-----------------------------------------------------
Features
-----------------------------------------------------
1. Dynamic Input Forms:
   - Multi-step forms for property and comparables data entry.
   - Auto-filled fields using Google Maps API (manual overrides included).

2. Interactive Mapping:
   - OpenStreetMap integration for real-time property visualization.
   - Automatic geocoding with live updates as data is entered.

3. Database Integration:
   - Persistent data storage in SQLite for user accounts and property data.

4. Advanced Navigation:
   - Spreadsheet-like keyboard navigation for grid-based inputs.

5. User Customization:
   - Editable dropdowns, narrative fields, and manual input flexibility.

6. Future Feature - PDF Export:
   - Planned implementation for professional-grade report generation.

-----------------------------------------------------
Why This Project Stands Out
-----------------------------------------------------
1. Real-World Utility:
   - Designed with feedback from real estate professionals.
   - Addresses repetitive tasks, reduces errors, and saves time.

2. Interactive Features:
   - Google Maps API and OpenStreetMap integration.
   - AI-prepopulated narratives for appraisal reports.

3. Built to Scale:
   - Room for future integrations (e.g., PDF export and additional APIs).

-----------------------------------------------------
Technologies Used
-----------------------------------------------------
Frontend:  HTML, CSS, JavaScript (Leaflet.js, Google Maps API)
Backend:   Python (Flask Framework)
Database:  SQLite
Planned:   WeasyPrint for PDF report generation.

-----------------------------------------------------
Installation Instructions
-----------------------------------------------------
**Prerequisites**
- Python 3.12 or higher.
- SQLite installed on your system.

**Steps**
1. Install Python Dependencies:
   `$ pip install -r requirements.txt`

2. Initialize the Database:
   `$ python app.py`

3. Run the Application:
   `$ flask run`

4. Access the App:
   Open `http://127.0.0.1:5000` in your browser.

-----------------------------------------------------
How to Use
-----------------------------------------------------
1. Login or Register:
   - Admin and user roles supported (admin interface planned).

2. Form Step 1:
   - Enter basic property details, such as address and property type.

3. Form Step 2:
   - Add subject and comparable properties for analysis.

4. Save and Continue:
   - Save data to the database and prepare reports (future versions).

-----------------------------------------------------
Video Demonstration
-----------------------------------------------------
Watch the demonstration video here: https://youtu.be/O2Wjtj4JM28

-----------------------------------------------------
Acknowledgments
-----------------------------------------------------
This project was developed as part of CS50, combining theoretical
concepts with practical applications. Special thanks to real estate
professionals who provided feedback during development.

CS50 Final Project © 2024 Carrie Snow