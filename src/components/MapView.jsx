import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const MapView = ({ rides }) => {
  // Default center (you can change)
  const defaultPosition = [51.505, -0.09];

  return (
    <div className="relative z-0 w-full h-full">
    <MapContainer
      center={defaultPosition}
      zoom={6}
      scrollWheelZoom={true}
      className="w-full h-full-1"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {rides.map((ride) => (
        <Marker
          key={ride.id}
          position={[ride.location.lat, ride.location.lng]}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{ride.name}</h3>
              <p>Date: {ride.date}</p>
              <p>Distance: {ride.distance} km</p>
              <p>Elevation: {ride.elevation} m</p>
              <p>{ride.notes}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
  );
};

export default MapView;
