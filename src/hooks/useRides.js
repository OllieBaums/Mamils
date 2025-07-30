import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/rides";

const useRides = () => {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await axios.get(API_URL);
      setRides(res.data);
    } catch (err) {
      console.error("Error fetching rides:", err);
    }
  };

  const addRide = async (rideData) => {
    try {
      const formData = new FormData();

      formData.append("name", rideData.name);
      formData.append("date", rideData.date);
      formData.append("locationName", rideData.location.name);
      formData.append("lat", rideData.location.lat);
      formData.append("lng", rideData.location.lng);
      formData.append("distance", rideData.distance);
      formData.append("elevation", rideData.elevation);
      formData.append("notes", rideData.notes);

      // If you're supporting photo uploads later
      if (rideData.photos?.length) {
        for (let photo of rideData.photos) {
          formData.append("photos", photo);
        }
      }

      const res = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setRides((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Error adding ride:", err);
    }
  };

  return { rides, addRide };
};

export default useRides;
