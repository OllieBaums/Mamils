import React, { useState } from "react";
import { FiImage } from "react-icons/fi";
import PhotoSelector from "./PhotoSelector";
import usePhotos from "../hooks/usePhotos";

const AddRideModal = ({ onClose, onSave }) => {
  const [rideName, setRideName] = useState("");
  const [date, setDate] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [distance, setDistance] = useState("");
  const [elevation, setElevation] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);

  const { photos, availableYears, getPhotosByIds } = usePhotos();
  const selectedPhotos = getPhotosByIds(selectedPhotoIds);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rideName || !date || !latitude || !longitude) {
      alert("Please fill in all required fields.");
      return;
    }

    const newRide = {
      name: rideName,
      date,
      location: {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
      },
      distance: parseFloat(distance) || 0,
      elevation: parseFloat(elevation) || 0,
      notes,
      photos: selectedPhotoIds, // Array of photo IDs
    };

    onSave(newRide);
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg space-y-4 max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-xl font-bold mb-4">Add New Ride</h2>

          <input
            type="text"
            placeholder="Ride Name *"
            value={rideName}
            onChange={(e) => setRideName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="date"
            placeholder="Date *"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Latitude *"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="w-full border p-2 rounded"
            step="0.0001"
            required
          />
          <input
            type="number"
            placeholder="Longitude *"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="w-full border p-2 rounded"
            step="0.0001"
            required
          />
          <input
            type="number"
            placeholder="Distance (km)"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full border p-2 rounded"
            step="0.1"
          />
          <input
            type="number"
            placeholder="Elevation (m)"
            value={elevation}
            onChange={(e) => setElevation(e.target.value)}
            className="w-full border p-2 rounded"
            step="1"
          />
          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
          />

          {/* Photo Selection Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold flex items-center">
                <FiImage className="mr-2 text-blue-500" />
                Photos ({selectedPhotos.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowPhotoSelector(true)}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors"
              >
                Select Photos
              </button>
            </div>

            {/* Selected Photos Preview */}
            {selectedPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {selectedPhotos.slice(0, 6).map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={`${API_BASE_URL.replace('/api', '')}${photo.url}`}
                      alt={photo.description || photo.originalName}
                      className="w-full h-16 object-cover rounded border"
                    />
                    {selectedPhotos.length > 6 && selectedPhotos.indexOf(photo) === 5 && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded">
                        <span className="text-white text-sm font-semibold">
                          +{selectedPhotos.length - 6}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-2">No photos selected</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Ride
            </button>
          </div>
        </form>
      </div>

      {/* Photo Selector Modal */}
      {showPhotoSelector && (
        <PhotoSelector
          photos={photos}
          availableYears={availableYears}
          selectedPhotoIds={selectedPhotoIds}
          onSelectionChange={setSelectedPhotoIds}
          onClose={() => setShowPhotoSelector(false)}
        />
      )}
    </>
  );
};

export default AddRideModal;