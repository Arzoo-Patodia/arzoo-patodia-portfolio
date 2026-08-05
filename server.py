import http.server
import socketserver
import os

PORT = 8000

# Clean URL routes -> file mappings
ROUTES = {
    '':                          '/index.html',           # root redirects to home
    'index':                     '/index.html',
    'arzoo_patodia':             '/arzoo_patodia.html',   # vanity URL (shareable link)
    'career_counselling':        '/arzoo_patodia.html',   # legacy home route
    'resume_overview':           '/resume_overview.html',
    'mock_interview':            '/mock_interview.html',
    'career_counselling_service':'/career_counselling_service.html',
    'project_guidance':          '/project_guidance.html',
    'ats_score_checker':         '/ats_score_checker.html',
}

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Route clean paths to appropriate files, ignoring query parameters
        clean_path = self.path.split('?')[0].strip('/')
        if clean_path in ROUTES:
            self.path = ROUTES[clean_path]
        return super().do_GET()

# Ensure we are serving from the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

# Allow port reuse to avoid 'Address already in use' errors
socketserver.TCPServer.allow_reuse_address = True

try:
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print("\n=======================================================")
        print(f"  Local Development Server Started successfully!")
        print(f"")
        print(f"  Shareable Link (like topmate.io/arzoo_patodia):")
        print(f"    -> http://localhost:{PORT}/arzoo_patodia")
        print(f"")
        print(f"  All Routes:")
        for route in ROUTES:
            label = f"/{route}" if route else "/"
            print(f"    {label:<32} -> {ROUTES[route]}")
        print("=======================================================\n")
        print("Press Ctrl+C to stop the server.")
        httpd.serve_forever()
except PermissionError:
    print("Error: Permission denied. Please try a different port or run as Administrator.")
except Exception as e:
    print(f"Error starting server: {e}")
