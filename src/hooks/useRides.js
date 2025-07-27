import { useEffect, useState } from "react";

// Key for localStorage
const STORAGE_KEY = "bikeAppRides";

const useRides = () => {
  const [rides, setRides] = useState([]);

  // Load rides from localStorage on first load
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRides(JSON.parse(stored));
    }
  }, []);

  // Save rides to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));
  }, [rides]);

  const addRide = (newRide) => {
    setRides((prev) => [...prev, { id: Date.now(), ...newRide }]);
  };

  const updateRide = (updatedRide) => {
    setRides((prev) =>
      prev.map((r) => (r.id === updatedRide.id ? updatedRide : r))
    );
  };

  const deleteRide = (id) => {
    setRides((prev) => prev.filter((r) => r.id !== id));
  };

  return { rides, addRide, updateRide, deleteRide };
};

export default useRides;
