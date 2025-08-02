import React, { useState } from 'react';
import { FiUpload, FiImage, FiX, FiCalendar, FiTag } from 'react-icons/fi';

const PhotoUpload = ({ onUpload, loading = false }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dateTaken, setDateTaken] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== fileArray.length) {
      alert('Only image files are allowed!');
    }
    
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one photo to upload.');
      return;
    }

    const metadata = {
      dateTaken: dateTaken || new Date().toISOString(),
      description,
      tags
    };

    try {
      await onUpload(selectedFiles, metadata);
      
      // Reset form on success
      setSelectedFiles([]);
      setDateTaken('');
      setDescription('');
      setTags('');
      
      alert(`Successfully uploaded ${selectedFiles.length} photo(s)!`);
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      
      {/* File Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-pink-400 bg-pink-50' 
            : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag} 
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={loading}
        />
        
        <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          Drop photos here or click to select
        </p>
        <p className="text-xs text-gray-500">
          Supports: JPG, PNG, GIF (max 10MB each)
        </p>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center">
            <FiImage className="mr-1" />
            Selected Photos ({selectedFiles.length})
          </h4>
          
          <div className="max-h-32 overflow-y-auto space-y-1">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2 text-xs">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FiImage className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-500 flex-shrink-0">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                  disabled={loading}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata Form */}
      <div className="space-y-3">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FiCalendar className="mr-1" />
            Date Taken (optional)
          </label>
          <input
            type="date"
            value={dateTaken}
            onChange={(e) => setDateTaken(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FiImage className="mr-1" />
            Description (optional)
          </label>
          <input
            type="text"
            placeholder="Brief description of the photos..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FiTag className="mr-1" />
            Tags (optional)
          </label>
          <input
            type="text"
            placeholder="mountains, sunset, family (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            disabled={loading}
          />
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || loading}
        className={`w-full py-2 px-4 rounded-md font-medium text-sm transition-colors ${
          selectedFiles.length === 0 || loading
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-pink-600 hover:bg-pink-700 text-white'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Uploading...
          </span>
        ) : (
          `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`
        )}
      </button>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        Photos will be available to add to your bike rides after uploading
      </p>
    </div>
  );
};

export default PhotoUpload;