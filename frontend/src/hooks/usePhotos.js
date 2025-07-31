import { useEffect, useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const usePhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all photos or photos filtered by year
  const fetchPhotos = async (year = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = year 
        ? `${API_BASE_URL}/photos?year=${year}`
        : `${API_BASE_URL}/photos`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }
      
      const data = await response.json();
      setPhotos(data);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available years
  const fetchAvailableYears = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/years`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch years: ${response.status}`);
      }
      
      const years = await response.json();
      setAvailableYears(years);
    } catch (err) {
      console.error('Error fetching years:', err);
      setError(err.message);
    }
  };

  // Upload new photos
  const uploadPhotos = async (files, metadata = {}) => {
    try {
      setError(null);
      
      const formData = new FormData();
      
      // Add files to form data
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }
      
      // Add metadata
      if (metadata.dateTaken) {
        formData.append('dateTaken', metadata.dateTaken);
      }
      if (metadata.description) {
        formData.append('description', metadata.description);
      }
      if (metadata.tags) {
        formData.append('tags', metadata.tags);
      }
      
      const response = await fetch(`${API_BASE_URL}/photos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload photos');
      }

      const newPhotos = await response.json();
      
      // Add new photos to the current list
      setPhotos(prev => [...prev, ...newPhotos]);
      
      // Refresh available years
      await fetchAvailableYears();
      
      return newPhotos;
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError(err.message);
      throw err;
    }
  };

  // Update photo metadata
  const updatePhoto = async (photoId, updates) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update photo');
      }

      const updatedPhoto = await response.json();
      
      // Update photo in current list
      setPhotos(prev => prev.map(photo => 
        photo.id === photoId ? updatedPhoto : photo
      ));
      
      return updatedPhoto;
    } catch (err) {
      console.error('Error updating photo:', err);
      setError(err.message);
      throw err;
    }
  };

  // Delete a photo
  const deletePhoto = async (photoId) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete photo');
      }

      // Remove photo from current list
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      
      // Refresh available years
      await fetchAvailableYears();
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(err.message);
      throw err;
    }
  };

  // Get photos by IDs (for displaying selected photos in rides)
  const getPhotosByIds = (photoIds) => {
    return photos.filter(photo => photoIds.includes(photo.id));
  };

  // Load photos and years when component mounts
  useEffect(() => {
    fetchPhotos();
    fetchAvailableYears();
  }, []);

  return {
    photos,
    availableYears,
    loading,
    error,
    fetchPhotos,
    fetchAvailableYears,
    uploadPhotos,
    updatePhoto,
    deletePhoto,
    getPhotosByIds,
    refetch: () => {
      fetchPhotos();
      fetchAvailableYears();
    }
  };
};

export default usePhotos;