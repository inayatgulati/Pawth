import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  PlusSquare,
  User,
  MapPin,
  ShieldCheck,
  X,
  Star,
  Clock,
  Navigation,
  Stethoscope,
  Scissors,
  Heart,
  Coffee,
  ShoppingBag,
  Leaf,
  BedDouble,
  Award,
  Calendar,
} from "lucide-react";
import "../App.css";
import "../styles/Petplacespage.css";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const CATEGORIES = [
  {
    key: "veterinary_care",
    label: "Vet Clinics",
    icon: <Stethoscope size={16} />,
    color: "#2980b9",
    bg: "#e8f4fd",
    query: "veterinary clinic animal hospital pet emergency",
    markerColor: "#2980b9",
  },
  {
    key: "pet_grooming",
    label: "Grooming",
    icon: <Scissors size={16} />,
    color: "#8e44ad",
    bg: "#f5eefb",
    query: "pet grooming dog grooming cat grooming",
    markerColor: "#8e44ad",
  },
  {
    key: "animal_shelter",
    label: "Shelters",
    icon: <Heart size={16} />,
    color: "#27ae60",
    bg: "#eafaf1",
    query: "animal shelter pet rescue dog rescue cat rescue",
    markerColor: "#27ae60",
  },
  {
    key: "pet_cafe",
    label: "Pet Cafés",
    icon: <Coffee size={16} />,
    color: "#b5651d",
    bg: "#fdf3e7",
    query: "pet cafe cat cafe dog cafe",
    markerColor: "#b5651d",
  },
  {
    key: "pet_store",
    label: "Pet Stores",
    icon: <ShoppingBag size={16} />,
    color: "#e67e22",
    bg: "#fef5e7",
    query: "pet store pet shop animal supplies",
    markerColor: "#e67e22",
  },
  {
    key: "pet_park",
    label: "Dog Parks",
    icon: <Leaf size={16} />,
    color: "#16a085",
    bg: "#e8f8f5",
    query: "dog park off leash park pet friendly park",
    markerColor: "#16a085",
  },
  {
    key: "pet_hotel",
    label: "Boarding",
    icon: <BedDouble size={16} />,
    color: "#c0392b",
    bg: "#fdedec",
    query: "pet boarding dog hotel cat boarding pet sitting kennel",
    markerColor: "#c0392b",
  },
  {
    key: "pet_training",
    label: "Training",
    icon: <Award size={16} />,
    color: "#d35400",
    bg: "#fdf2e9",
    query: "dog training pet training obedience school",
    markerColor: "#d35400",
  },
];

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve(window.google.maps);
    const existing = document.getElementById("gmap-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google.maps));
      return;
    }
    const script = document.createElement("script");
    script.id = "gmap-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function PetPlacesPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const serviceRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState("veterinary_care");
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [mapError, setMapError] = useState("");
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState(null);

  useEffect(() => {
    loadGoogleMaps(GOOGLE_MAPS_API_KEY)
      .then((maps) => {
        setMapsLoaded(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setUserLocation(coords);
            initMap(maps, coords);
          },
          () => {
            const coords = { lat: 49.2827, lng: -123.1207 };
            setUserLocation(coords);
            initMap(maps, coords);
          },
        );
      })
      .catch(() =>
        setMapError("Failed to load Google Maps. Check your API key."),
      );
  }, []);

  const initMap = (maps, center) => {
    if (!mapRef.current) return;
    const map = new maps.Map(mapRef.current, {
      center,
      zoom: 13,
      styles: mapStyles,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    mapInstanceRef.current = map;
    serviceRef.current = new maps.places.PlacesService(map);
    setLoading(false);
  };

  //Searches for pet-related places. Using Google Places textSearch API.
  //Fetches places within 15km radius based on the selected category.
  //Adds a colored marker on the map for each result.
  const searchPlaces = useCallback(
    (categoryKey) => {
      if (!serviceRef.current || !mapInstanceRef.current || !userLocation)
        return;
      const cat = CATEGORIES.find((c) => c.key === categoryKey);
      if (!cat) return;
      setLoading(true);
      setPlaces([]);
      clearMarkers();
      serviceRef.current.textSearch(
        { query: cat.query, location: userLocation, radius: 15000 },
        (results, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            setPlaces(results);
            results.forEach((place) => addMarker(place, cat));
            if (results.length > 0 && mapInstanceRef.current) {
              const bounds = new window.google.maps.LatLngBounds();
              results.forEach((place) => {
                if (place.geometry) bounds.extend(place.geometry.location);
              });
              mapInstanceRef.current.fitBounds(bounds);
            }
          } else {
            setPlaces([]);
          }
          setLoading(false);
        },
      );
    },
    [userLocation],
  );

  useEffect(() => {
    if (mapsLoaded && userLocation) searchPlaces(activeCategory);
  }, [mapsLoaded, userLocation, activeCategory, searchPlaces]);

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  };

  const addMarker = (place, cat) => {
    if (!place.geometry || !mapInstanceRef.current) return;
    const marker = new window.google.maps.Marker({
      map: mapInstanceRef.current,
      position: place.geometry.location,
      title: place.name,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: cat.markerColor,
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
    });
    marker.addListener("click", () => {
      setSelectedPlace(place);
      mapInstanceRef.current.panTo(place.geometry.location);
      mapInstanceRef.current.setZoom(15);
    });
    marker.addListener("mouseover", (e) => {
      const rect = mapRef.current.getBoundingClientRect();
      const x = e.domEvent.clientX - rect.left;
      const y = e.domEvent.clientY - rect.top;
      const photoUrl = place.photos?.[0]
        ? place.photos[0].getUrl({ maxWidth: 320, maxHeight: 180 })
        : null;
      setHoveredPlace({ place, x, y, photoUrl, cat });
    });
    marker.addListener("mouseout", () => {
      setHoveredPlace(null);
    });
    markersRef.current.push(marker);
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    if (mapInstanceRef.current && place.geometry) {
      mapInstanceRef.current.panTo(place.geometry.location);
      mapInstanceRef.current.setZoom(16);
    }
  };

  const activeCat = CATEGORIES.find((c) => c.key === activeCategory);

  return (
    <div className="places-shell">
      {/* Topbar */}
      <header className="places-topbar">
        <h1>🐾 Pawth </h1>
        <div className="places-topbar-right">
          {user?.role === "admin" && (
            <button
              className="places-admin-btn is-admin"
              onClick={() => navigate("/admin")}
            >
              <ShieldCheck size={13} /> Admin
            </button>
          )}
          {user ? (
            <div onClick={() => navigate("/profile")} className="places-avatar">
              {user.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt="profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="places-avatar-initial">
                  {user.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <button className="badge-btn" onClick={() => navigate("/login")}>
              Log in
            </button>
          )}
        </div>
      </header>

      <div className="places-body">
        {/* Sidebar */}
        <div className="places-sidebar">
          <div className="places-sidebar-top">
            <div className="places-category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className="places-category-btn"
                  onClick={() => setActiveCategory(cat.key)}
                  style={{
                    border:
                      activeCategory === cat.key
                        ? `2px solid ${cat.color}`
                        : "2px solid #eee",
                    background: activeCategory === cat.key ? cat.bg : "#fafafa",
                    color: activeCategory === cat.key ? cat.color : "#666",
                  }}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="places-results">
            {mapError && <div className="places-error">⚠️ {mapError}</div>}
            {loading ? (
              <div className="places-loading">
                <div style={{ color: activeCat?.color }}>{activeCat?.icon}</div>
                <p>Finding nearby {activeCat?.label}...</p>
              </div>
            ) : places.length === 0 ? (
              <div className="places-empty">
                <MapPin size={28} color="#ccc" />
                <p>No places found nearby.</p>
              </div>
            ) : (
              <>
                <p className="places-count">
                  {places.length} {activeCat?.label} nearby
                </p>
                {places.map((place) => (
                  <div
                    key={place.place_id}
                    className="places-list-item"
                    onClick={() => handlePlaceClick(place)}
                    style={{
                      background:
                        selectedPlace?.place_id === place.place_id
                          ? activeCat?.bg
                          : "#fff",
                      borderLeft:
                        selectedPlace?.place_id === place.place_id
                          ? `3px solid ${activeCat?.color}`
                          : "3px solid transparent",
                    }}
                  >
                    <div className="places-item-header">
                      <p className="places-item-name">{place.name}</p>
                      {place.rating && (
                        <span className="places-item-rating">
                          <Star size={11} fill="#f39c12" /> {place.rating}
                        </span>
                      )}
                    </div>
                    <p className="places-item-address">{place.vicinity}</p>
                    <div className="places-item-tags">
                      {place.opening_hours && (
                        <span
                          className={`places-tag ${place.opening_hours.open_now ? "open" : "closed"}`}
                        >
                          {place.opening_hours.open_now ? "Open now" : "Closed"}
                        </span>
                      )}
                      <span
                        className="places-tag"
                        style={{
                          background: activeCat?.bg,
                          color: activeCat?.color,
                        }}
                      >
                        {activeCat?.icon} {activeCat?.label}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="places-map-wrap">
          <div ref={mapRef} className="places-map" />

          {/* Selected place card */}
          {selectedPlace && (
            <div className="places-detail-card" style={{ bottom: "80px" }}>
              <button
                className="places-detail-close"
                onClick={() => setSelectedPlace(null)}
              >
                <X size={16} />
              </button>
              <div className="places-detail-header">
                <span style={{ color: activeCat?.color }}>
                  {activeCat?.icon}
                </span>
                <div>
                  <p className="places-detail-name">{selectedPlace.name}</p>
                  {selectedPlace.rating && (
                    <div className="places-detail-rating">
                      <Star size={11} fill="#f39c12" /> {selectedPlace.rating}
                      {selectedPlace.user_ratings_total && (
                        <span>
                          ({selectedPlace.user_ratings_total} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {selectedPlace.vicinity && (
                <p className="places-detail-address">
                  <MapPin size={13} color={activeCat?.color} />
                  {selectedPlace.vicinity}
                </p>
              )}
              {selectedPlace.opening_hours && (
                <p
                  className={`places-detail-hours ${selectedPlace.opening_hours.open_now ? "open" : "closed"}`}
                >
                  <Clock size={12} color="#888" />
                  {selectedPlace.opening_hours.open_now ? "Open now" : "Closed"}
                </p>
              )}

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name)}&query_place_id=${selectedPlace.place_id}`}
                target="_blank"
                rel="noreferrer"
                className="places-gmaps-btn"
              >
                <Navigation size={13} /> Open in Google Maps
              </a>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="places-loading-overlay">
              <div style={{ textAlign: "center" }}>
                <div style={{ color: activeCat?.color }}>{activeCat?.icon}</div>
                <p>Finding {activeCat?.label}...</p>
              </div>
            </div>
          )}

          {/* Hover tooltip */}
          {hoveredPlace && (
            <div
              className="places-hover-tooltip"
              style={{
                left: hoveredPlace.x + 14,
                top: hoveredPlace.y - 20,
              }}
            >
              {hoveredPlace.photoUrl ? (
                <img
                  src={hoveredPlace.photoUrl}
                  alt={hoveredPlace.place.name}
                  className="places-hover-img"
                />
              ) : (
                <div
                  className="places-hover-img-placeholder"
                  style={{
                    background: hoveredPlace.cat?.bg,
                    color: hoveredPlace.cat?.color,
                  }}
                >
                  {hoveredPlace.cat?.icon}
                </div>
              )}
              <div className="places-hover-body">
                <p className="places-hover-name">{hoveredPlace.place.name}</p>
                {hoveredPlace.place.rating && (
                  <span className="places-hover-rating">
                    <Star size={11} fill="#f39c12" color="#f39c12" />
                    {hoveredPlace.place.rating}
                    {hoveredPlace.place.user_ratings_total && (
                      <span className="places-hover-reviews">
                        ({hoveredPlace.place.user_ratings_total})
                      </span>
                    )}
                  </span>
                )}
                {hoveredPlace.place.vicinity && (
                  <p className="places-hover-address">
                    {hoveredPlace.place.vicinity}
                  </p>
                )}
                {hoveredPlace.place.opening_hours && (
                  <span
                    className={`places-tag ${hoveredPlace.place.opening_hours.open_now ? "open" : "closed"}`}
                    style={{ marginTop: 4, display: "inline-flex" }}
                  >
                    {hoveredPlace.place.opening_hours.open_now
                      ? "Open now"
                      : "Closed"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {[
          { path: "/dashboard", icon: <Home size={22} />, label: "Feed" },
          { path: "/places", icon: <MapPin size={22} />, label: "Places" },
          { path: "/events", icon: <Calendar size={22} />, label: "Events" },
          { path: "/create", icon: <PlusSquare size={22} />, label: "Create" },
          { path: "/profile", icon: <User size={22} />, label: "Profile" },
        ].map(({ path, icon, label }) => (
          <button
            key={path}
            className={location.pathname === path ? "active" : ""}
            onClick={() =>
              navigate(
                token ||
                  path === "/dashboard" ||
                  path === "/places" ||
                  path === "/events"
                  ? path
                  : "/login",
              )
            }
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9e8f5" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f0" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#c9c9c9" }],
  },
];
