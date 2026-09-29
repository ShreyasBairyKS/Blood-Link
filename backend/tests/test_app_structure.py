from fastapi.testclient import TestClient
from sqlalchemy.orm import configure_mappers

from app.core.config import get_settings
from app.main import app


def test_sqlalchemy_mappers_configure_without_error():
    configure_mappers()


def test_expected_routes_are_registered():
    routes = {(route.path, method) for route in app.routes for method in getattr(route, "methods", set())}

    expected = {
        ("/health", "GET"),
        ("/api/v1/auth/otp/request", "POST"),
        ("/api/v1/auth/otp/verify", "POST"),
        ("/api/v1/auth/refresh", "POST"),
        ("/api/v1/donors/me", "GET"),
        ("/api/v1/donors/me", "PUT"),
        ("/api/v1/donors/me/zones", "POST"),
        ("/api/v1/hospitals/onboard", "POST"),
        ("/api/v1/admin/hospitals", "GET"),
        ("/api/v1/admin/hospitals/{hospital_id}/approve", "POST"),
        ("/api/v1/admin/hospitals/{hospital_id}/reject", "POST"),
    }

    assert expected.issubset(routes)


def test_cors_allows_configured_browser_origins():
    client = TestClient(app)
    origin = get_settings().cors_origins[0]

    response = client.options(
        "/api/v1/auth/otp/request",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin
