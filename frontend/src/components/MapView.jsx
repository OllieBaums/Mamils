import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix for default markers in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Delete the default icon to fix the marker issue
delete L.Icon.Default.prototype._getIconUrl;

// Set up the default icon
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MapView = ({ rides }) => {
  // Default center (London coordinates, you can change this)
  const defaultPosition = [51.505, -0.09];

  // If there are rides, center on the first one or calculate a center point
  const getMapCenter = () => {
    if (rides && rides.length > 0) {
      // Use the first ride's location as center
      const firstRide = rides[0];
      return [firstRide.location.lat, firstRide.location.lng];
    }
    return defaultPosition;
  };

  // Calculate appropriate zoom level based on rides
  const getMapZoom = () => {
    if (rides && rides.length > 1) {
      // If multiple rides, zoom out to see them all
      return 6;
    } else if (rides && rides.length === 1) {
      // If one ride, zoom in closer
      return 10;
    }
    // Default zoom for no rides
    return 6;
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={getMapCenter()}
        zoom={getMapZoom()}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {rides && rides.map((ride) => (
          <Marker
            key={ride.id}
            position={[ride.location.lat, ride.location.lng]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{ride.name}</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Date:</strong> {ride.date}</p>
                  <p><strong>Distance:</strong> {ride.distance} km</p>
                  <p><strong>Elevation:</strong> {ride.elevation} m</p>
                  {ride.notes && (
                    <p><strong>Notes:</strong> {ride.notes}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;