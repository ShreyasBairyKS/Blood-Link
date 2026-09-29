from app.core.geo import to_geography


def test_to_geography_formats_wkt_point_as_lon_lat():
    point = to_geography(latitude=12.9716, longitude=77.5946)

    assert point.desc == "POINT(77.5946 12.9716)"
    assert point.srid == 4326


def test_to_geography_handles_negative_coordinates():
    point = to_geography(latitude=-33.8688, longitude=151.2093)

    assert point.desc == "POINT(151.2093 -33.8688)"
