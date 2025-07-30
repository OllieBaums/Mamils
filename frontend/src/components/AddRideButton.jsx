const AddRideButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
  >
    + Add New Ride
  </button>
);

export default AddRideButton;
