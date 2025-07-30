// App.jsx (fixed for backend integration)

import React, { useState } from "react";
import IntroScreen from "./components/IntroScreen";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import RideList from "./components/RideList";
import AddRideButton from "./components/AddRideButton";
import AddRideModal from "./components/AddRideModal";
import useRides from "./hooks/useRides";

const App = () => {
  const [entered, setEntered] = useState(false);
  const { rides, loading, error, addRide } = useRides();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddRide = async (newRide) => {
    try {
      await addRide(newRide);
      setIsAddModalOpen(false);
    } catch (err) {
      // Error is already handled by the hook
      console.error('Failed to add ride:', err);
    }
  };

  if (!entered) return <IntroScreen onEnter={() => setEntered(true)} />;

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your rides...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <h2 className="text-lg font-semibold mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Make sure your backend server is running on http://localhost:5000
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-auto bg-gray-50 relative">
      {/* Main content: sidebar + map */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-gray-200 bg-white shadow-md overflow-y-auto">
          <Sidebar />
        </aside>

        <main className="flex-1 bg-white overflow-hidden">
          <MapView rides={rides} />
        </main>
      </div>

      {/* Bottom section: ride list and add button */}
      <section className="p-4 bg-white border-t border-gray-200 overflow-y-auto max-h-[40vh] flex flex-col">
        <RideList rides={rides} />
        <div className="mt-4 self-end">
          <AddRideButton onClick={() => setIsAddModalOpen(true)} />
        </div>
      </section>

      {/* Add Ride Modal */}
      {isAddModalOpen && (
        <AddRideModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddRide}
        />
      )}
    </div>
  );
};

export default App;