"""
TINDERAPP MOBILE - Test Suite Automatizada de Aceptación, Arquitectura y QA
Suite de Pruebas Automatizadas
Estandar: ISO 25010 & Mandato de Verificación Empírica
"""

import os
import sys
import json
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_APP_DIR = os.path.join(BASE_DIR, "src", "app")
PAGES_DIR = os.path.join(SRC_APP_DIR, "pages")
COMPONENTS_DIR = os.path.join(SRC_APP_DIR, "shared", "componets")
SERVICES_DIR = os.path.join(SRC_APP_DIR, "services", "tinder")
ENV_DIR = os.path.join(BASE_DIR, "src", "environments")
PACKAGE_JSON = os.path.join(BASE_DIR, "package.json")
AGENTS_MD = os.path.join(BASE_DIR, "AGENTS.md")
GITIGNORE = os.path.join(BASE_DIR, ".gitignore")
CAPACITOR_CONFIG = os.path.join(BASE_DIR, "capacitor.config.ts")


class TestPackageAndGovernance(unittest.TestCase):
    """Verifica la configuración del proyecto, manifiestos y protección de entornos y manifiestos."""

    def test_package_json_metadata(self):
        self.assertTrue(os.path.isfile(PACKAGE_JSON))
        with open(PACKAGE_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(data["name"], "tinderapp")
        self.assertIn("Mileidys Agamez Ospino", data["author"])
        self.assertEqual(data["version"], "2.0.0")

    def test_critical_dependencies_present(self):
        with open(PACKAGE_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
        deps = data.get("dependencies", {})
        self.assertIn("@ionic/angular", deps)
        self.assertIn("@angular/core", deps)
        self.assertIn("@capacitor/core", deps)
        self.assertIn("@capacitor/android", deps)
        self.assertIn("@supabase/supabase-js", deps)

    def test_agents_md_and_gitignore_protection(self):
        self.assertTrue(os.path.isfile(AGENTS_MD))
        with open(AGENTS_MD, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("urn:factory:project:tinderapp", content)
        self.assertIn("MobileFrontendSpecialist", content)

        self.assertTrue(os.path.isfile(GITIGNORE))
        with open(GITIGNORE, "r", encoding="utf-8") as f:
            gi_content = f.read()
        self.assertIn("AGENTS.md", gi_content)
        self.assertIn(".env", gi_content)


class TestEnvironmentConfig(unittest.TestCase):
    """Verifica plantillas y configuraciones de entornos (RNF-03)."""

    def test_environment_files_exist(self):
        self.assertTrue(os.path.isfile(os.path.join(ENV_DIR, "environment.ts")))
        self.assertTrue(os.path.isfile(os.path.join(ENV_DIR, "environment.prod.ts")))
        self.assertTrue(os.path.isfile(os.path.join(ENV_DIR, "environment.example.ts")))

    def test_environment_example_content(self):
        with open(os.path.join(ENV_DIR, "environment.example.ts"), "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("enableMockMode", content)
        self.assertIn("firebaseConfig", content)
        self.assertIn("SUPABASE", content)


class TestAppPagesArchitecture(unittest.TestCase):
    """Verifica que las 7 páginas principales existan con módulos y estilos (RF-01..RF-06)."""

    def test_all_pages_exist(self):
        expected_pages = [
            "chat",
            "login",
            "matches",
            "matching",
            "profile",
            "register",
            "welcome"
        ]
        for page in expected_pages:
            p_dir = os.path.join(PAGES_DIR, page)
            self.assertTrue(os.path.isdir(p_dir), f"Falta directorio de página: {page}")
            self.assertTrue(os.path.isfile(os.path.join(p_dir, f"{page}.page.html")), f"Falta template HTML en {page}")
            self.assertTrue(os.path.isfile(os.path.join(p_dir, f"{page}.page.ts")), f"Falta controlador TS en {page}")


class TestSharedComponents(unittest.TestCase):
    """Verifica los 8 componentes reutilizables modulares de la interfaz."""

    def test_components_exist(self):
        expected_components = [
            "button",
            "card",
            "floating-button",
            "input",
            "link",
            "match-modal",
            "profile-detail-modal",
            "toggle-translate"
        ]
        for comp in expected_components:
            c_dir = os.path.join(COMPONENTS_DIR, comp)
            self.assertTrue(os.path.isdir(c_dir), f"Falta componente: {comp}")
            self.assertTrue(os.path.isfile(os.path.join(c_dir, f"{comp}.component.ts")), f"Falta {comp}.component.ts")


class TestTinderServicesAndMockEngine(unittest.TestCase):
    """Verifica el servicio central y el motor autónomo de datos Mock (RF-07)."""

    def test_mock_tinder_service_structure(self):
        mock_path = os.path.join(SERVICES_DIR, "mock-tinder-service.ts")
        self.assertTrue(os.path.isfile(mock_path), f"No existe {mock_path}")
        with open(mock_path, "r", encoding="utf-8") as f:
            content = f.read()

        required_methods = [
            "getAvailableProfiles",
            "likeProfile",
            "passProfile",
            "getMatches",
            "sendMessage",
            "getProfileByUid"
        ]
        for m in required_methods:
            self.assertIn(m, content, f"Falta método {m} en MockTinderService")

        # Verificar perfiles enriquecidos
        self.assertIn("Sofía", content)
        self.assertIn("Mateo", content)
        self.assertIn("Valentina", content)
        self.assertIn("Lucas", content)

    def test_tinder_service_wires_mock(self):
        svc_path = os.path.join(SERVICES_DIR, "tinder-service.ts")
        self.assertTrue(os.path.isfile(svc_path))
        with open(svc_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("MockTinderService", content)
        self.assertIn("mockSrv", content)


class TestDualGesturePhysics(unittest.TestCase):
    """Verifica que matching.page soporte tanto gestos táctiles como arrastre de ratón (RF-03, RNF-01)."""

    def test_touch_and_mouse_event_handlers(self):
        matching_ts = os.path.join(PAGES_DIR, "matching", "matching.page.ts")
        with open(matching_ts, "r", encoding="utf-8") as f:
            content = f.read()

        handlers = [
            "onTouchStart",
            "onTouchMove",
            "onTouchEnd",
            "onMouseDown",
            "onMouseMove",
            "onMouseUp",
            "onMouseLeave",
            "updateCardPosition",
            "finishDrag"
        ]
        for h in handlers:
            self.assertIn(h, content, f"Falta manejador de gesto {h} en matching.page.ts")

    def test_matching_html_binds_mouse(self):
        matching_html = os.path.join(PAGES_DIR, "matching", "matching.page.html")
        with open(matching_html, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("(mousedown)=", content)
        self.assertIn("(mousemove)=", content)
        self.assertIn("(mouseup)=", content)


class TestAndroidCapacitorConfiguration(unittest.TestCase):
    """Verifica la configuración móvil de Capacitor para exportación de Android (RNF-02)."""

    def test_capacitor_config(self):
        self.assertTrue(os.path.isfile(CAPACITOR_CONFIG))
        with open(CAPACITOR_CONFIG, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("appId", content)
        self.assertIn("appName", content)

    def test_android_directory_exists(self):
        android_dir = os.path.join(BASE_DIR, "android")
        self.assertTrue(os.path.isdir(android_dir), "No se encontró el directorio nativo android/")


class TestSimulatorRunnerAndEndpoints(unittest.TestCase):
    """Verifica el servidor de demostración web y el simulador interactivo."""

    def test_demo_files_exist(self):
        self.assertTrue(os.path.isfile(os.path.join(BASE_DIR, "demo.html")))
        self.assertTrue(os.path.isfile(os.path.join(BASE_DIR, "serve_demo.py")))

    def test_demo_html_elements(self):
        with open(os.path.join(BASE_DIR, "demo.html"), "r", encoding="utf-8") as f:
            html = f.read()
        self.assertIn("tinder-deck-container", html)
        self.assertIn("match-modal-overlay", html)
        self.assertIn("view-chat-room", html)
        self.assertIn("MOCK_PROFILES", html)


    def test_all_simulator_screens_and_auth_flow(self):
        with open(os.path.join(BASE_DIR, "demo.html"), "r", encoding="utf-8") as f:
            html = f.read()
        self.assertIn("screen-welcome", html)
        self.assertIn("screen-register", html)
        self.assertIn("screen-login", html)
        self.assertIn("screen-deck", html)
        self.assertIn("screen-matches", html)
        self.assertIn("screen-chat", html)
        self.assertIn("screen-profile", html)
        self.assertIn("passions-chips-grid", html)
        self.assertIn("story-progress-bars", html)


if __name__ == "__main__":
    unittest.main(verbosity=2)

