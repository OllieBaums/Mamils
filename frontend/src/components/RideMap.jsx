import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import rideData from '../rideData';

// Fix marker icon issue in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});


const RideMap = () => {
  return (
    <MapContainer center={[47.3769, 8.5417]} zoom={5} style={{ height: "600px", width: "70%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {rideData.map(ride => (
        <Marker key={ride.id} position={ride.position}>
          <Popup>
            <h3>{ride.title}</h3>
            <img src={ride.image} alt={ride.title} style={{ width: "100%", borderRadius: "8px" }} />
            <p><strong>Date:</strong> {ride.date}</p>
            <p><strong>Distance:</strong> {ride.distance}</p>
            <p><strong>Elevation:</strong> {ride.elevation}</p>
            <p>{ride.notes}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default RideMap;
