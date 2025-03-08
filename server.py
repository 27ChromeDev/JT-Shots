from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import urllib.parse

class PhotoServerHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Remove .html extension from the URL
        if path.endswith('/'):
            path += 'index.html'
        elif not path.endswith('.html'):
            # Check if a .html version of the file exists
            html_path = path + '.html'
            if os.path.exists(os.path.join(self.directory, html_path.lstrip('/'))):
                path = html_path
        
        # Use the parent class method to translate the path
        return super().translate_path(path)

    def send_error(self, code, message=None, explain=None):
        # Custom 404 error page
        if code == 404:
            # Create a 404 HTML page matching the site's theme
            path = urllib.parse.unquote(self.path)
            error_content = f'''
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>" {path} " not found on JT-Shots</title>
                <link rel="stylesheet" href="styles.css">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
                <style>
                    .error-page {{
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #000;
                        color: white;
                        text-align: center;
                    }}
                    .error-content {{
                        max-width: 600px;
                        padding: 2rem;
                    }}
                    .brand-mark {{
                        position: relative;
                        width: 200px;
                        height: 200px;
                        margin: 0 auto 2rem;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }}
                    .logo-circle {{
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        animation: rotateCircle 20s linear infinite;
                    }}
                    .brand-mark h1 {{
                        font-size: 4rem;
                        font-weight: 300;
                        letter-spacing: 8px;
                        z-index: 1;
                    }}
                    .error-text {{
                        font-size: 2rem;
                        margin-bottom: 2rem;
                    }}
                    .return-link {{
                        display: inline-block;
                        text-decoration: none;
                        color: white;
                        border: 2px solid white;
                        padding: 0.75rem 1.5rem;
                        transition: all 0.3s ease;
                    }}
                    .return-link:hover {{
                        background: white;
                        color: #333;
                    }}
                    @keyframes rotateCircle {{
                        from {{ transform: rotate(0deg); }}
                        to {{ transform: rotate(360deg); }}
                    }}
                </style>
            </head>
            <body>
                <nav>
        <div class="logo">JT-Shots</div>
        <ul class="nav-links">
            <li><a href="/" class="active">Home</a></li>
            <li><a href="projects">Projects</a></li>
            <li><a href="blogs">Blog</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
                <div class="error-page">
                    <div class="error-content">
                        <div class="brand-mark">
                            <svg class="logo-circle" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="48" stroke="white" fill="none"/>
                            </svg>
                            <h1>JT</h1>
                        </div>
                        <div class="error-text">
                            <h2>404 - Page Not Found</h2>
                            <p>The page " {path} " could not be found.</p>
                        </div>
                        <a href="/" class="return-link">Return to Home</a>
                    </div>
                </div>
            </body>
            </html>
            '''
            
            # Send the error response
            self.send_response(404)
            self.send_header('Content-type', 'text/html')
            self.send_header('Content-length', len(error_content.encode()))
            self.end_headers()
            self.wfile.write(error_content.encode())
        else:
            # Use default error handling for other error codes
            super().send_error(code, message, explain)

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, PhotoServerHandler)
    print(f"Server running on http://localhost:{port}")
    print(f"Serving files from: {os.path.dirname(os.path.abspath(__file__))}")
    print("URLs can be accessed without .html extension")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()