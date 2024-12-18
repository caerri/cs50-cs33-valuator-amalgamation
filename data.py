#!/home/dh_kfekwx/bin/python3

import sqlite3

def connect_to_db(db_name):
    """Connect to the SQLite database."""
    try:
        conn = sqlite3.connect(db_name)
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None

def list_tables(conn):
    """List all tables in the database."""
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    return [table[0] for table in tables]

def get_table_schema(conn, table_name):
    """Retrieve the schema of a specific table."""
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name});")
    schema = cursor.fetchall()
    return schema

def display_schema(schema):
    """Display the schema in an organized format."""
    print("\nTable Schema:")
    print("Index | Column Name         | Type       | Nullable | Default")
    print("-" * 60)
    for col in schema:
        index, name, col_type, not_null, default_value, *_ = col
        nullable = "No" if not_null else "Yes"
        print(f"{index:<5}| {name:<35}| {col_type:<10}| {nullable:<9}| {default_value or 'None'}")

def main():
    db_name = "valuator.db"
    conn = connect_to_db(db_name)
    if not conn:
        return

    print("\nFetching tables...")
    tables = list_tables(conn)
    if not tables:
        print("No tables found in the database.")
        return

    print("\nTables in the database:")
    for i, table in enumerate(tables):
        print(f"{i + 1}. {table}")

    table_choice = input("\nEnter the table name or number to inspect its schema: ").strip()
    if table_choice.isdigit() and 1 <= int(table_choice) <= len(tables):
        table_name = tables[int(table_choice) - 1]
    elif table_choice in tables:
        table_name = table_choice
    else:
        print("Invalid choice. Exiting.")
        return

    schema = get_table_schema(conn, table_name)
    if schema:
        display_schema(schema)
    else:
        print(f"No schema found for table '{table_name}'.")

    conn.close()

if __name__ == "__main__":
    main()
