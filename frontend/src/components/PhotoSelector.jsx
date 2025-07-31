import React, { useState, useEffect } from 'react';
import { FiImage, FiFilter, FiCheck } from 'react-icons/fi';

const PhotoSelector = ({ photos, availableYears, selectedPhotoIds = [], onSelectionChange, onClose }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [filteredPhotos, setFilteredPhotos] = useState(photos);
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedPhotoIds);

  // Filter photos by year
  useEffect(() => {
    if (selectedYear) {
      const filtered = photos.filter(photo => {
        const photoYear = new Date(photo.dateTaken || photo.uploadedAt).getFullYear();
        return photoYear === parseInt(selectedYear);
      });
      setFilteredPhotos(filtered);
    } else {
      setFilteredPhotos(photos);
    }
  }, [photos, selectedYear]);

  const togglePhotoSelection = (photoId) => {
    setLocalSelectedIds(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      } else {
        return [...prev, photoId];
      }
    });
  };

  const handleSave = () => {
    onSelectionChange(localSelectedIds);
    onClose();
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FiImage className="mr-2 text-blue-500" />
              Select Photos for Your Ride
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Year Filter */}
          <div className="flex items-center space-x-4">
            <FiFilter className="text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              Showing {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <FiImage className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {selectedYear ? `No photos found for ${selectedYear}` : 'No photos available'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Upload some photos first to select them for your rides
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => {
                const isSelected = localSelectedIds.includes(photo.id);
                return (
                  <div
                    key={photo.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => togglePhotoSelection(photo.id)}
                  >
                    <img
                      src={`${API_BASE_URL.replace('/api', '')}${photo.url}`}
                      alt={photo.description || photo.originalName}
                      className="w-full h-32 object-cover"
                    />
                    
                    {/* Selection Indicator */}
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white bg-opacity-70 text-gray-400'
                    }`}>
                      {isSelected ? <FiCheck className="w-4 h-4" /> : <span className="text-xs">+</span>}
                    </div>

                    {/* Photo Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                      <p className="text-xs truncate">
                        {photo.description || photo.originalName}
                      </p>
                      <p className="text-xs text-gray-300">
                        {new Date(photo.dateTaken || photo.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {localSelectedIds.length} photo{localSelectedIds.length !== 1 ? 's' : ''} selected
          </div>
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoSelector;