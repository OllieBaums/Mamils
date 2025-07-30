import { useEffect, useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STORAGE_KEY = "bikeAppRides";

const useRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // Try to fetch from backend, fallback to localStorage
  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try backend first
      const response = await fetch(`${API_BASE_URL}/rides`);
      
      if (!response.ok) {
        throw new Error(`Backend not available (${response.status})`);
      }
      
      const data = await response.json();
      setRides(data);
      setUseLocalStorage(false);
    } catch (err) {
      console.warn('Backend not available, using localStorage:', err.message);
      
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const localRides = stored ? JSON.parse(stored) : [];
        setRides(localRides);
        setUseLocalStorage(true);
        setError("Using offline mode - start backend for full features");
      } catch (storageErr) {
        console.error('Error reading from localStorage:', storageErr);
        setRides([]);
        setError("Unable to load rides");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load rides when component mounts
  useEffect(() => {
    fetchRides();
  }, []);

  // Save to localStorage when using offline mode
  useEffect(() => {
    if (useLocalStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));
    }
  }, [rides, useLocalStorage]);

  // Add a new ride
  const addRide = async (newRide) => {
    try {
      setError(null);
      
      const rideWithId = {
        ...newRide,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };

      if (useLocalStorage) {
        // Add to localStorage
        setRides(prev => [...prev, rideWithId]);
        return rideWithId;
      } else {
        // Try backend
        const response = await fetch(`${API_BASE_URL}/rides`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newRide),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add ride');
        }

        const createdRide = await response.json();
        setRides(prev => [...prev, createdRide]);
        return createdRide;
      }
    } catch (err) {
      console.error('Error adding ride:', err);
      
      // If backend fails, fallback to localStorage
      if (!useLocalStorage) {
        console.warn('Backend failed, switching to localStorage');
        setUseLocalStorage(true);
        const rideWithId = {
          ...newRide,
          id: Date.now(),
          createdAt: new Date().toISOString()
        };
        setRides(prev => [...prev, rideWithId]);
        setError("Added ride offline - start backend to sync");
        return rideWithId;
      }
      
      setError(err.message);
      throw err;
    }
  };

  // Update an existing ride
  const updateRide = async (updatedRide) => {
    try {
      setError(null);
      
      if (useLocalStorage) {
        // Update in localStorage
        setRides(prev => prev.map(ride => 
          ride.id === updatedRide.id ? { ...updatedRide, updatedAt: new Date().toISOString() } : ride
        ));
        return updatedRide;
      } else {
        // Try backend
        const response = await fetch(`${API_BASE_URL}/rides/${updatedRide.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedRide),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update ride');
        }

        const updated = await response.json();
        setRides(prev => prev.map(ride => 
          ride.id === updated.id ? updated : ride
        ));
        return updated;
      }
    } catch (err) {
      console.error('Error updating ride:', err);
      setError(err.message);
      throw err;
    }
  };

  // Delete a ride
  const deleteRide = async (id) => {
    try {
      setError(null);
      
      if (useLocalStorage) {
        // Delete from localStorage
        setRides(prev => prev.filter(ride => ride.id !== id));
        return;
      } else {
        // Try backend
        const response = await fetch(`${API_BASE_URL}/rides/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete ride');
        }

        setRides(prev => prev.filter(ride => ride.id !== id));
      }
    } catch (err) {
      console.error('Error deleting ride:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    rides,
    loading,
    error,
    addRide,
    updateRide,
    deleteRide,
    refetch: fetchRides,
    isOffline: useLocalStorage
  };
};

export default useRides;