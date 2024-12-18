#!/home/dh_kfekwx/bin/python3

import sys
import sys
from flup.server.fcgi import WSGIServer

# Add the path to your local packages
sys.path.insert(0, "/home/dh_kfekwx/python_packages")
sys.path.insert(0, "/home/dh_kfekwx/valuator.carriesnow.io")

from app import app  # Import your Flask app

if __name__ == '__main__':
    WSGIServer(app).run()
