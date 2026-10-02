"""
TINDERAPP MOBILE - Servidor HTTP Local para Demostración y Simulador Web
Puerto por defecto: 3002
Arquitectura: Servidor Local de Demostracion
"""

import http.server
import socketserver
import os
import sys

# Asegurar codificación UTF-8 para compatibilidad en consolas Windows (cp1252)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 3002
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class TinderAppHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/' or self.path == '':
            self.path = '/demo.html'
        return super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), TinderAppHandler) as httpd:
        print("=" * 64)
        print("[*] TINDERAPP MOBILE - Simulador Interactivo Local")
        print(f"[*] URL Local: http://localhost:{PORT}")
        print(f"[*] Directorio Raiz: {DIRECTORY}")
        print("[*] Presiona Ctrl+C para detener el servidor.")
        print("=" * 64)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido con exito.")
            httpd.server_close()

if __name__ == "__main__":
    run_server()
