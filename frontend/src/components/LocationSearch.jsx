import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMapPin, FiNavigation, FiX, FiLoader } from 'react-icons/fi';
import useLocationSearch from '../hooks/useLocationSearch';

const LocationSearch = ({ onLocationSelect, selectedLocation, placeholder = "Search for a location..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocationSelected, setIsLocationSelected] = useState(false);
  const searchTimeoutRef = useRef();
  const resultsRef = useRef();

  const { searchLocation, getCurrentLocation, loading, error, clearError } = useLocationSearch();

  // Update query when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      setQuery(selectedLocation.name || '');
      setShowResults(false);
      setIsLocationSelected(true);
    } else {
      setIsLocationSelected(false);
    }
  }, [selectedLocation]);

  // Handle search input with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if a location was just selected
    if (isLocationSelected) {
      return;
    }

    if (query.trim().length > 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const searchResults = await searchLocation(query);
          setResults(searchResults);
          setShowResults(true);
        } catch (err) {
          setResults([]);
          setShowResults(false);
        } finally {
          setIsSearching(false);
        }
      }, 500); // 500ms debounce
    } else {
      setResults([]);
      setShowResults(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, searchLocation, isLocationSelected]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location) => {
    setQuery(location.name);
    setShowResults(false);
    setIsLocationSelected(true);
    onLocationSelect(location);
    clearError();
  };

  const handleCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      handleLocationSelect(location);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const clearSelection = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setIsLocationSelected(false);
    onLocationSelect(null);
    clearError();
  };

  const formatLocationName = (location) => {
    const parts = [];
    
    if (location.address.city) parts.push(location.address.city);
    if (location.address.state) parts.push(location.address.state);
    if (location.address.country) parts.push(location.address.country);
    
    return parts.length > 0 ? parts.join(', ') : location.name;
  };

  return (
    <div className="relative" ref={resultsRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching || loading ? (
            <FiLoader className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <FiSearch className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsLocationSelected(false); // Reset when user starts typing
          }}
          onFocus={() => {
            if (results.length > 0 && !isLocationSelected) setShowResults(true);
          }}
          className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
          {/* Current Location Button */}
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            title="Use current location"
          >
            <FiNavigation className="h-4 w-4" />
          </button>
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Clear location"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <FiX className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && !isLocationSelected && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((location) => (
            <div
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start">
                <FiMapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {formatLocationName(location)}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {location.name}
                  </p>
                  <div className="flex items-center mt-1 space-x-3 text-xs text-gray-400">
                    <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                    {location.type && (
                      <span className="capitalize">{location.type.replace('_', ' ')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showResults && results.length === 0 && query.trim().length > 2 && !isSearching && !isLocationSelected && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No locations found for "{query}"
          </div>
        </div>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center text-sm">
            <FiMapPin className="h-4 w-4 text-green-600 mr-2" />
            <div className="flex-1">
              <p className="font-medium text-green-900">
                {formatLocationName(selectedLocation)}
              </p>
              <p className="text-green-700 text-xs">
                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;