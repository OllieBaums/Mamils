import { useState } from 'react';

const useLocationSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Using Nominatim (OpenStreetMap) geocoding service - free and no API key required
  const searchLocation = async (query) => {
    if (!query.trim()) {
      throw new Error('Please enter a location name');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query.trim())}&` +
        `format=json&` +
        `limit=5&` +
        `addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Failed to search location');
      }

      const results = await response.json();
      
      if (results.length === 0) {
        throw new Error('No locations found. Try a different search term.');
      }

      // Format results for easier use
      const formattedResults = results.map(result => ({
        id: result.place_id,
        name: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: {
          city: result.address?.city || result.address?.town || result.address?.village,
          state: result.address?.state,
          country: result.address?.country,
          postcode: result.address?.postcode
        },
        type: result.type,
        importance: result.importance
      }));

      return formattedResults;
    } catch (err) {
      const errorMessage = err.message || 'Failed to search location';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get current user location (if browser supports it)
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocode to get place name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?` +
              `lat=${latitude}&` +
              `lon=${longitude}&` +
              `format=json&` +
              `addressdetails=1`
            );

            if (!response.ok) {
              throw new Error('Failed to get location name');
            }

            const result = await response.json();
            
            resolve({
              id: result.place_id,
              name: result.display_name,
              lat: latitude,
              lng: longitude,
              address: {
                city: result.address?.city || result.address?.town || result.address?.village,
                state: result.address?.state,
                country: result.address?.country,
                postcode: result.address?.postcode
              },
              type: 'current_location',
              importance: 1
            });
          } catch (err) {
            // If reverse geocoding fails, still return coordinates
            resolve({
              id: 'current',
              name: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              lat: latitude,
              lng: longitude,
              address: {},
              type: 'current_location',
              importance: 1
            });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setLoading(false);
          let errorMessage = 'Failed to get current location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Unknown location error';
              break;
          }
          
          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  return {
    searchLocation,
    getCurrentLocation,
    loading,
    error,
    clearError: () => setError(null)
  };
};

export default useLocationSearch;