// Component for detailed ride popup
const RidePopup = ({ rides }) => {
  const { getPhotosByIds, getPhotoUrl } = usePhotos();
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (rides.length === 1) {
    const ride = rides[0];
    const ridePhotos = getPhotosByIds(ride.photos || []);
    
    return (
      <div className="p-3 max-w-sm">
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{ride.name}</h3>
          {ride.locationName && (
            <p className="text-sm text-gray-600 flex items-center mb-2">
              <FiMapPin className="mr-1 text-gray-400" />
              {ride.locationName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div className="flex items-center">
            <FiCalendar className="mr-2 text-blue-500" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-gray-600">{formatDate(ride.date)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <FiRoute className="mr-2 text-green-500" />
            <div>
              <p className="font-medium">Distance</p>
              <p className="text-gray-600">{ride.distance} km</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <FiMountain className="mr-2 text-orange-500" />
            <div>
              <p className="font-medium">Elevation</p>
              <p className="text-gray-600">{ride.elevation} m</p>
            </div>
          </div>

          {ridePhotos.length > 0 && (
            <div className="flex items-center">
              <FiImage className="mr-2 text-purple-500" />
              <div>
                <p className="font-medium">Photos</p>
                <p className="text-gray-600">{ridePhotos.length} photo{ridePhotos.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
        </div>

        {ride.notes && (
          <div className="mb-3">
            <p className="font-medium text-sm mb-1">Notes</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{ride.notes}</p>
          </div>
        )}

        {/* Photos Grid */}
        {ridePhotos.length > 0 && (
          <div className="mb-2">
            <p className="font-medium text-sm mb-2 flex items-center">
              <FiImage className="mr-1" />
              Photos
            </p>
            <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto photo-grid-scroll">
              {ridePhotos.slice(0, 9).map((photo, index) => (
                <div key={photo.id} className="relative aspect-square">
                  <img
                    src={getPhotoUrl(photo.id)}
                    alt={photo.description || `Ride photo ${index + 1}`}
                    className="w-full h-full object-cover rounded border hover:opacity-90 transition-opacity cursor-pointer"
                    onError={(e) => {
                      // Hide broken images
                      e.target.style.display = 'none';
                    }}
                    title={photo.description || photo.originalName}
                  />
                  {index === 8 && ridePhotos.length > 9 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded">
                      <span className="text-white text-xs font-semibold">
                        +{ridePhotos.length - 9}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
          Click and drag to explore the map
        </div>
      </div>
    );
  }

  // Multiple rides at same location
  return (
    <div className="p-3 max-w-sm">
      <h3 className="font-bold text-lg text-gray-900 mb-2">
        {rides.length} Rides at this Location
      </h3>
      
      {rides[0].locationName && (
        <p className="text-sm text-gray-600 flex items-center mb-3">
          <FiMapPin className="mr-1 text-gray-400" />
          {rides[0].locationName}
        </p>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto photo-grid-scroll">
        {rides.map((ride, index) => {
          const ridePhotos = getPhotosByIds(ride.photos || []);
          
          return (
            <div key={ride.id} className="border-l-4 border-blue-500 pl-3 bg-gray-50 p-2 rounded-r">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-sm text-gray-900">{ride.name}</h4>
                <span className="text-xs text-gray-500">{formatDate(ride.date)}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-600 mb-1">
                <span className="flex items-center">
                  <FiRoute className="mr-1" />
                  {ride.distance} km
                </span>import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { FiCalendar, FiMapPin, FiMountain, FiRoute, FiImage } from "react-icons/fi";
import usePhotos from "../hooks/usePhotos";

// Fix for default markers in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Delete the default icon to fix the marker issue
delete L.Icon.Default.prototype._getIconUrl;

// Create custom bike icon SVG
const createBikeIcon = (count = 1, isCluster = false) => {
  const size = isCluster ? 50 : 40;
  const color = isCluster ? '#2563eb' : '#059669'; // Blue for clusters, green for single
  const textColor = 'white';
  
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        font-weight: bold;
        color: ${textColor};
        font-size: ${isCluster ? '14px' : '12px'};
        position: relative;
      ">
        ${isCluster ? count : '🚴'}
        ${isCluster ? '' : `
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${color};
          "></div>
        `}
      </div>
    `,
    className: 'custom-bike-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, isCluster ? size / 2 : size + 8],
    popupAnchor: [0, isCluster ? -size / 2 : -size - 8]
  });
};

// Component for detailed ride popup
const RidePopup = ({ rides, onClose }) => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (rides.length === 1) {
    const ride = rides[0];
    return (
      <div className="p-3 max-w-sm">
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{ride.name}</h3>
          {ride.locationName && (
            <p className="text-sm text-gray-600 flex items-center mb-2">
              <FiMapPin className="mr-1 text-gray-400" />
              {ride.locationName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div className="flex items-center">
            <FiCalendar className="mr-2 text-blue-500" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-gray-600">{formatDate(ride.date)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <FiRoute className="mr-2 text-green-500" />
            <div>
              <p className="font-medium">Distance</p>
              <p className="text-gray-600">{ride.distance} km</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <FiMountain className="mr-2 text-orange-500" />
            <div>
              <p className="font-medium">Elevation</p>
              <p className="text-gray-600">{ride.elevation} m</p>
            </div>
          </div>

          {ride.photos && ride.photos.length > 0 && (
            <div className="flex items-center">
              <FiImage className="mr-2 text-purple-500" />
              <div>
                <p className="font-medium">Photos</p>
                <p className="text-gray-600">{ride.photos.length} photo{ride.photos.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
        </div>

        {ride.notes && (
          <div className="mb-3">
            <p className="font-medium text-sm mb-1">Notes</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{ride.notes}</p>
          </div>
        )}

        {/* Photos Grid */}
        {ride.photos && ride.photos.length > 0 && (
          <div className="mb-2">
            <p className="font-medium text-sm mb-2 flex items-center">
              <FiImage className="mr-1" />
              Photos
            </p>
            <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
              {ride.photos.slice(0, 9).map((photoId, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={`${API_BASE_URL.replace('/api', '')}/uploads/photo-${photoId}.jpg`}
                    alt={`Ride photo ${index + 1}`}
                    className="w-full h-full object-cover rounded border"
                    onError={(e) => {
                      // Hide broken images
                      e.target.style.display = 'none';
                    }}
                  />
                  {index === 8 && ride.photos.length > 9 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded">
                      <span className="text-white text-xs font-semibold">
                        +{ride.photos.length - 9}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
          Click and drag to explore the map
        </div>
      </div>
    );
  }

  // Multiple rides at same location
  return (
    <div className="p-3 max-w-sm">
      <h3 className="font-bold text-lg text-gray-900 mb-2">
        {rides.length} Rides at this Location
      </h3>
      
      {rides[0].locationName && (
        <p className="text-sm text-gray-600 flex items-center mb-3">
          <FiMapPin className="mr-1 text-gray-400" />
          {rides[0].locationName}
        </p>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {rides.map((ride, index) => (
          <div key={ride.id} className="border-l-4 border-blue-500 pl-3 bg-gray-50 p-2 rounded-r">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-semibold text-sm text-gray-900">{ride.name}</h4>
              <span className="text-xs text-gray-500">{formatDate(ride.date)}</span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-600 mb-1">
              <span className="flex items-center">
                <FiRoute className="mr-1" />
                {ride.distance} km
              </span>
              <span className="flex items-center">
                <FiMountain className="mr-1" />
                {ride.elevation} m
              </span>
              {ride.photos && ride.photos.length > 0 && (
                <span className="flex items-center">
                  <FiImage className="mr-1" />
                  {ride.photos.length}
                </span>
              )}
            </div>

            {ride.notes && (
              <p className="text-xs text-gray-600 truncate">{ride.notes}</p>
            )}

            {/* Mini photo preview for clustered rides */}
            {ride.photos && ride.photos.length > 0 && (
              <div className="flex space-x-1 mt-2">
                {ride.photos.slice(0, 3).map((photoId, photoIndex) => (
                  <img
                    key={photoIndex}
                    src={`${API_BASE_URL.replace('/api', '')}/uploads/photo-${photoId}.jpg`}
                    alt={`${ride.name} photo ${photoIndex + 1}`}
                    className="w-8 h-8 object-cover rounded border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
                {ride.photos.length > 3 && (
                  <div className="w-8 h-8 bg-gray-300 rounded border flex items-center justify-center">
                    <span className="text-xs text-gray-600">+{ride.photos.length - 3}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
        {rides.length} rides found at this location
      </div>
    </div>
  );
};

const MapView = ({ rides }) => {
  // Default center (London coordinates, you can change this)
  const defaultPosition = [51.505, -0.09];

  // Group rides by location (with some tolerance for nearby locations)
  const groupedRides = useMemo(() => {
    if (!rides || rides.length === 0) return [];

    const groups = [];
    const tolerance = 0.001; // About 100 meters

    rides.forEach(ride => {
      // Find existing group within tolerance
      const existingGroup = groups.find(group => {
        const distance = Math.sqrt(
          Math.pow(group.lat - ride.location.lat, 2) + 
          Math.pow(group.lng - ride.location.lng, 2)
        );
        return distance < tolerance;
      });

      if (existingGroup) {
        existingGroup.rides.push(ride);
      } else {
        groups.push({
          lat: ride.location.lat,
          lng: ride.location.lng,
          rides: [ride]
        });
      }
    });

    return groups;
  }, [rides]);

  // Calculate map center and zoom
  const getMapCenter = () => {
    if (rides && rides.length > 0) {
      if (rides.length === 1) {
        return [rides[0].location.lat, rides[0].location.lng];
      }
      
      // Calculate center of all rides
      const avgLat = rides.reduce((sum, ride) => sum + ride.location.lat, 0) / rides.length;
      const avgLng = rides.reduce((sum, ride) => sum + ride.location.lng, 0) / rides.length;
      return [avgLat, avgLng];
    }
    return defaultPosition;
  };

  const getMapZoom = () => {
    if (rides && rides.length > 1) {
      return 6;
    } else if (rides && rides.length === 1) {
      return 10;
    }
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

        {groupedRides.map((group, index) => (
          <Marker
            key={`group-${group.lat}-${group.lng}-${index}`}
            position={[group.lat, group.lng]}
            icon={createBikeIcon(group.rides.length, group.rides.length > 1)}
          >
            <Popup 
              maxWidth={400}
              className="custom-popup"
            >
              <RidePopup rides={group.rides} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10 text-xs">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-600 rounded-full mr-2 flex items-center justify-center text-white text-xs">🚴</div>
            <span>Single ride</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-blue-600 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold">3</div>
            <span>Multiple rides</span>
          </div>
        </div>
      </div>

      {/* Ride Summary */}
      {rides && rides.length > 0 && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10">
          <div className="text-sm">
            <h4 className="font-semibold text-gray-900 mb-1">Your Rides</h4>
            <p className="text-gray-600">
              {rides.length} ride{rides.length !== 1 ? 's' : ''} • {groupedRides.length} location{groupedRides.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;