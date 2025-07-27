const RideList = ({ rides }) => (
  <div className="space-y-3">
    {rides.length === 0 && <p>No rides added yet.</p>}
    {rides.map((ride) => (
      <div key={ride.id} className="border p-3 rounded shadow">
        <h4 className="font-semibold">{ride.name}</h4>
        <p>Date: {ride.date}</p>
        <p>Distance: {ride.distance} km</p>
      </div>
    ))}
  </div>
);

export default RideList;
