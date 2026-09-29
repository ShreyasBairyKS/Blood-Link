from geoalchemy2.elements import WKTElement


def to_geography(latitude: float, longitude: float) -> WKTElement:
    return WKTElement(f"POINT({longitude} {latitude})", srid=4326)
