// App.jsx (updated)

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
  const { rides, addRide } = useRides();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddRide = (newRide) => {
    addRide(newRide);
    setIsAddModalOpen(false);
  };

  if (!entered) return <IntroScreen onEnter={() => setEntered(true)} />;

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
