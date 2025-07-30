import React, { useState } from "react";

const AddRideModal = ({ onClose, onSave }) => {
  const [rideName, setRideName] = useState("");
  const [date, setDate] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [distance, setDistance] = useState("");
  const [elevation, setElevation] = useState("");
  const [notes, setNotes] = useState("");

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
      name: "Lausanne", // this can be user-input in the future
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
    },
    distance: parseFloat(distance) || 0,
    elevation: parseFloat(elevation) || 0,
    notes,
    photos: [], // future file inputs here
  };

onSave(newRide);

  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg space-y-4"
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

        <div className="flex justify-end space-x-4 mt-4">
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
  );
};

export default AddRideModal;
