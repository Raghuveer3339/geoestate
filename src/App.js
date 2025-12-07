import React from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
  useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const initialProperties = [
  {
    id: 1,
    lat: 28.6139,
    lng: 77.209,
    title: "Room near college",
    price: "₹6,000/mo",
    area: "1 Room",
    type: "rent"
  },
  {
    id: 2,
    lat: 28.7041,
    lng: 77.1025,
    title: "3 BHK Family Flat",
    price: "₹20,000/mo",
    area: "1350 sqft",
    type: "rent"
  },
  {
    id: 3,
    lat: 28.5355,
    lng: 77.391,
    title: "Residential Plot 200 sqyd",
    price: "₹45 Lakh",
    area: "200 sqyd",
    type: "sale"
  }
];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function App() {
  const [center, setCenter] = React.useState([28.6139, 77.209]); // Delhi

  const [filters, setFilters] = React.useState({ type: "all", text: "" });
  


  const [newProp, setNewProp] = React.useState({
    title: "",
    price: "",
    area: "",
    type: "rent",
    lat: "",
    lng: ""
  });

  const [clickLocation, setClickLocation] = React.useState(null);
  const [clickForm, setClickForm] = React.useState({
    title: "",
    price: "",
    area: "",
    type: "rent"
  });

  const [searchText, setSearchText] = React.useState("");
  const [searchResult, setSearchResult] = React.useState(null); // {type:"polygon"/"point", ...}

  const [showInfo, setShowInfo] = React.useState(false);
  const [isSatellite, setIsSatellite] = React.useState(false);

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await axios.get("http://localhost:5000/api/properties");
        setList(res.data);
      } catch (err) {
        console.error("Failed to load properties", err);
      }
    }
    fetchProperties();
  }, []);
  

  React.useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await axios.get("http://localhost:5000/api/properties");
        setList(res.data);
      } catch (err) {
        console.error("Failed to load properties", err);
      }
    }
    fetchProperties();
  }, []);
  


  const inputStyle = {
    width: "100%",
    marginBottom: "6px",
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.7)",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "rgba(15,23,42,0.6)",
    color: "white"
  };

  function FlyToCenter({ center }) {
    const map = useMap();
    React.useEffect(() => {
      map.flyTo(center, 14, { duration: 1.2 });
    }, [center, map]);
    return null;
  }

  function ClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setClickLocation({ lat, lng });
        setClickForm({
          title: "",
          price: "",
          area: "",
          type: "rent"
        });
      }
    });
    return null;
  }

  // SEARCH using Nominatim, India focused
  async function handleSearch() {
    if (!searchText.trim()) return;

    try {
      const url = "https://nominatim.openstreetmap.org/search";
      const params = {
        q: searchText,
        format: "jsonv2",
        addressdetails: 1,
        polygon_geojson: 1,
        limit: 1,
        countrycodes: "in"
      };

      const response = await axios.get(url, {
        params,
        headers: {
          "Accept-Language": "en-IN",
          "User-Agent": "GeoEstate-Demo"
        }
      });

      if (response.data && response.data.length > 0) {
        const place = response.data[0];
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);

        setCenter([lat, lng]);

        if (
          place.geojson &&
          (place.geojson.type === "Polygon" ||
            place.geojson.type === "MultiPolygon")
        ) {
          let coords = [];
          if (place.geojson.type === "Polygon") {
            coords = place.geojson.coordinates[0].map(([lng2, lat2]) => [
              lat2,
              lng2
            ]);
          } else {
            coords = place.geojson.coordinates[0][0].map(([lng2, lat2]) => [
              lat2,
              lng2
            ]);
          }
          setSearchResult({
            type: "polygon",
            name: place.display_name,
            lat,
            lng,
            polygonCoords: coords
          });
        } else {
          setSearchResult({
            type: "point",
            name: place.display_name,
            lat,
            lng
          });
        }
      } else {
        alert("No results found for that place.");
        setSearchResult(null);
      }
    } catch (err) {
      console.error("Search error", err);
      alert("Unable to search right now. Try again later.");
    }
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* Header with search bar */}
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "56px",
          background: "#2563eb",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 1200,
          gap: "12px"
        }}
      >
        <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
          DevEstate
        </span>

        <div
          style={{
            flex: 1,
            maxWidth: "520px",
            margin: "0 12px",
            display: "flex",
            gap: "8px"
          }}
        >
          <input
            style={{
              flex: 1,
              padding: "7px 10px",
              borderRadius: "999px",
              border: "none",
              outline: "none",
              fontSize: "13px",
              boxSizing: "border-box",
              color: "#0f172a"
            }}
            placeholder="Search area or landmark (e.g. Indira Nagar Gorakhpur)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button
            onClick={async () => {
              if (!newProp.title || !newProp.lat || !newProp.lng) return;
              try {
                const res = await axios.post("http://localhost:5000/api/properties", {
                  ...newProp,
                  lat: parseFloat(newProp.lat),
                  lng: parseFloat(newProp.lng)
                });
                setList((prev) => [res.data, ...prev]);
                setNewProp({
                  title: "",
                  price: "",
                  area: "",
                  type: "rent",
                  lat: "",
                  lng: ""
                });
              } catch (err) {
                console.error("Failed to save property", err);
              }
            }}
            
          >
            Search
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
  <button
    onClick={() => setIsSatellite(!isSatellite)}
    style={{
      padding: "6px 10px",
      borderRadius: "999px",
      border: "none",
      background: "rgba(15,23,42,0.2)",
      color: "white",
      fontSize: "12px",
      cursor: "pointer",
      whiteSpace: "nowrap"
    }}
  >
    {isSatellite ? "Street View" : "Satellite"}
  </button>

  <button
    onClick={() => setShowInfo(true)}
    style={{
      padding: "6px 10px",
      borderRadius: "999px",
      border: "none",
      background: "rgba(15,23,42,0.2)",
      color: "white",
      fontSize: "12px",
      cursor: "pointer",
      whiteSpace: "nowrap"
    }}
  >
    About & Contact
  </button>
</div>

      </header>

      {/* Side panel */}
      <div
  style={{
    position: "absolute",
    zIndex: 1000,
    background: "rgba(15,23,42,0.95)",
    padding: "12px",
    borderRadius: "14px",
    boxShadow: "0 16px 40px rgba(15,23,42,0.55)",
    width: "260px",
    maxHeight: "75vh",
    overflowY: "auto",
    border: "1px solid rgba(148,163,184,0.6)",
    backdropFilter: "blur(10px)",
    color: "white",
    right: 16,
    top: 76
  }}
>


                {isMobile && (
          <div
            style={{
              width: "40px",
              height: "4px",
              borderRadius: "999px",
              background: "rgba(148,163,184,0.9)",
              margin: "0 auto 10px"
            }}
          />
        )}

        <p
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            margin: "0 0 8px",
            color: "#a5b4fc"
          }}
        >
          Dashboard
        </p>

        {/* Add property form */}
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "12px",
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(148,163,184,0.5)",
            marginBottom: "10px"
          }}
        >
          <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>
            Add property (manual)
          </h4>
          <input
            style={inputStyle}
            placeholder="Title"
            value={newProp.title}
            onChange={(e) => setNewProp({ ...newProp, title: e.target.value })}
          />
          <input
            style={inputStyle}
            placeholder="Price"
            value={newProp.price}
            onChange={(e) => setNewProp({ ...newProp, price: e.target.value })}
          />
          <input
            style={inputStyle}
            placeholder="Area"
            value={newProp.area}
            onChange={(e) => setNewProp({ ...newProp, area: e.target.value })}
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              style={{ ...inputStyle, marginBottom: "6px" }}
              placeholder="Lat"
              value={newProp.lat}
              onChange={(e) => setNewProp({ ...newProp, lat: e.target.value })}
            />
            <input
              style={{ ...inputStyle, marginBottom: "6px" }}
              placeholder="Lng"
              value={newProp.lng}
              onChange={(e) => setNewProp({ ...newProp, lng: e.target.value })}
            />
          </div>
          <select
            style={inputStyle}
            value={newProp.type}
            onChange={(e) => setNewProp({ ...newProp, type: e.target.value })}
          >
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
          </select>
          <button
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "8px",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(to right,#22c55e,#16a34a)",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={async () => {
              if (!newProp.title || !newProp.lat || !newProp.lng) return;
              try {
                const res = await axios.post("http://localhost:5000/api/properties", {
                  title: newProp.title,
                  price: newProp.price,
                  area: newProp.area,
                  type: newProp.type,
                  lat: parseFloat(newProp.lat),
                  lng: parseFloat(newProp.lng)
                });
                setList((prev) => [res.data, ...prev]);
                setNewProp({
                  title: "",
                  price: "",
                  area: "",
                  type: "rent",
                  lat: "",
                  lng: ""
                });
              } catch (err) {
                console.error("Failed to save property", err);
              }
            }}
          
          >
            Add listing
          </button>
        </div>

        {/* Search filters */}
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "12px",
            background: "rgba(15,23,42,0.75)",
            border: "1px solid rgba(148,163,184,0.5)"
          }}
        >
          <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>
            Search properties
          </h4>

          <label style={{ fontSize: "12px" }}>Type</label>
          <select
            style={inputStyle}
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="all">All</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
          </select>

          <label style={{ fontSize: "12px" }}>Search text</label>
          <input
            style={inputStyle}
            placeholder="Area / title..."
            value={filters.text}
            onChange={(e) => setFilters({ ...filters, text: e.target.value })}
          />
        </div>
      </div>

      {/* Map */}
      <MapContainer center={center} zoom={11} style={{ width: "100%", height: "100%" }}>
      {isSatellite ? (
  <>
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution="Tiles © Esri"
    />
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      opacity={0.4}
      attribution="© OpenStreetMap contributors"
    />
  </>
) : (
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="© OpenStreetMap contributors"
  />
)}


  <FlyToCenter center={center} />
  <ClickHandler />
  {/* rest of your map content stays the same */}


        {/* Highlighted search area / landmark */}
        {searchResult && searchResult.type === "polygon" && (
          <Polygon
            positions={searchResult.polygonCoords}
            pathOptions={{
              color: "#1e293b",
              weight: 3,
              fillColor: "#1e293b",
              fillOpacity: 0.15
            }}
          />
        )}

        {searchResult && (
          <Marker position={[searchResult.lat, searchResult.lng]}>
            <Popup>
              <div style={{ minWidth: "180px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "15px" }}>
                  Search result
                </h3>
                <p style={{ margin: 0, fontSize: "12px" }}>{searchResult.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Property markers */}
        {list
          .filter((p) => {
            if (filters.type !== "all" && p.type !== filters.type) return false;
            if (
              filters.text &&
              !(
                p.title.toLowerCase().includes(filters.text.toLowerCase()) ||
                p.area.toLowerCase().includes(filters.text.toLowerCase())
              )
            ) {
              return false;
            }
            return true;
          })
          .map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <div style={{ minWidth: "180px" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "16px" }}>
                    {p.title}
                  </h3>
                  <p style={{ margin: "0 0 2px" }}>
                    <b>Area:</b> {p.area}
                  </p>
                  <p style={{ margin: "0 0 2px" }}>
                    <b>Price:</b> {p.price}
                  </p>
                  <p style={{ margin: "0 0 2px" }}>
                    <b>Type:</b>{" "}
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "999px",
                        background: p.type === "rent" ? "#e0f2fe" : "#dcfce7",
                        color: p.type === "rent" ? "#0369a1" : "#15803d",
                        fontSize: "11px",
                        fontWeight: 600
                      }}
                    >
                      {p.type.toUpperCase()}
                    </span>
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>
                    Lat: {p.lat.toFixed(5)}, Lng: {p.lng.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Temporary marker for click-to-add */}
        {clickLocation && (
          <Marker position={[clickLocation.lat, clickLocation.lng]}>
            <Popup
              onClose={() => {
                setClickLocation(null);
              }}
            >
              <div style={{ minWidth: "200px" }}>
                <h4 style={{ margin: "0 0 4px" }}>New listing here?</h4>
                <p style={{ margin: "0 0 4px", fontSize: "12px" }}>
                  Lat: {clickLocation.lat.toFixed(5)}, Lng:{" "}
                  {clickLocation.lng.toFixed(5)}
                </p>
                <input
                  style={{ width: "100%", marginBottom: "4px" }}
                  placeholder="Title"
                  value={clickForm.title}
                  onChange={(e) =>
                    setClickForm({ ...clickForm, title: e.target.value })
                  }
                />
                <input
                  style={{ width: "100%", marginBottom: "4px" }}
                  placeholder="Price"
                  value={clickForm.price}
                  onChange={(e) =>
                    setClickForm({ ...clickForm, price: e.target.value })
                  }
                />
                <input
                  style={{ width: "100%", marginBottom: "4px" }}
                  placeholder="Area"
                  value={clickForm.area}
                  onChange={(e) =>
                    setClickForm({ ...clickForm, area: e.target.value })
                  }
                />
                <select
                  style={{ width: "100%", marginBottom: "4px" }}
                  value={clickForm.type}
                  onChange={(e) =>
                    setClickForm({ ...clickForm, type: e.target.value })
                  }
                >
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                </select>
                <button
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    if (!clickForm.title) return;
                    const id = list.length + 1;
                    setList([
                      ...list,
                      {
                        id,
                        title: clickForm.title,
                        price: clickForm.price,
                        area: clickForm.area,
                        type: clickForm.type,
                        lat: clickLocation.lat,
                        lng: clickLocation.lng
                      }
                    ]);
                    setClickLocation(null);
                  }}
                >
                  Add marker here
                </button>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* About & Contact overlay */}
      {showInfo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15,23,42,0.55)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "480px",
              background: "white",
              borderRadius: "16px",
              padding: "20px 22px",
              boxShadow: "0 20px 50px rgba(15,23,42,0.35)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <h2 style={{ margin: 0, fontSize: "20px" }}>About JioEstate</h2>
              <button
                onClick={() => setShowInfo(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "18px",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              JioEstate helps people find land, houses and rooms to buy, sell
              or rent using an interactive map.
            </p>
            <p style={{ fontSize: "14px", marginBottom: "12px" }}>
              Zoom the map, click anywhere to add a new listing, or search for
              a specific area using the top search bar.
            </p>

            <h3 style={{ fontSize: "16px", margin: "10px 0 6px" }}>Contact</h3>
            <p style={{ fontSize: "14px", margin: 0 }}>
              Owner: Raghuveer Singh
              <br />
              Email: raghuofficial3339@gmail.com
              <br />
              Phone / WhatsApp: +91-8887674866
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

