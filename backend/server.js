const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'rides.json');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Helper function to read rides from file
const readRides = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
};

// Helper function to write rides to file
const writeRides = async (rides) => {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(rides, null, 2));
};

// Routes

// GET /api/rides - Get all rides
app.get('/api/rides', async (req, res) => {
  try {
    const rides = await readRides();
    res.json(rides);
  } catch (error) {
    console.error('Error reading rides:', error);
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
});

// POST /api/rides - Add a new ride
app.post('/api/rides', async (req, res) => {
  try {
    const { name, date, location, distance, elevation, notes } = req.body;
    
    // Validate required fields
    if (!name || !date || !location || !location.lat || !location.lng) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, date, location (lat, lng)' 
      });
    }

    const rides = await readRides();
    
    const newRide = {
      id: Date.now(), // Simple ID generation
      name,
      date,
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      },
      distance: parseFloat(distance) || 0,
      elevation: parseFloat(elevation) || 0,
      notes: notes || '',
      photos: [],
      createdAt: new Date().toISOString()
    };

    rides.push(newRide);
    await writeRides(rides);
    
    res.status(201).json(newRide);
  } catch (error) {
    console.error('Error adding ride:', error);
    res.status(500).json({ error: 'Failed to add ride' });
  }
});

// PUT /api/rides/:id - Update a ride
app.put('/api/rides/:id', async (req, res) => {
  try {
    const rideId = parseInt(req.params.id);
    const updates = req.body;
    
    const rides = await readRides();
    const rideIndex = rides.findIndex(ride => ride.id === rideId);
    
    if (rideIndex === -1) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    // Update the ride
    rides[rideIndex] = {
      ...rides[rideIndex],
      ...updates,
      id: rideId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    await writeRides(rides);
    res.json(rides[rideIndex]);
  } catch (error) {
    console.error('Error updating ride:', error);
    res.status(500).json({ error: 'Failed to update ride' });
  }
});

// DELETE /api/rides/:id - Delete a ride
app.delete('/api/rides/:id', async (req, res) => {
  try {
    const rideId = parseInt(req.params.id);
    
    const rides = await readRides();
    const filteredRides = rides.filter(ride => ride.id !== rideId);
    
    if (rides.length === filteredRides.length) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    await writeRides(filteredRides);
    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error('Error deleting ride:', error);
    res.status(500).json({ error: 'Failed to delete ride' });
  }
});

// GET /api/rides/:id - Get a specific ride
app.get('/api/rides/:id', async (req, res) => {
  try {
    const rideId = parseInt(req.params.id);
    const rides = await readRides();
    const ride = rides.find(ride => ride.id === rideId);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    res.json(ride);
  } catch (error) {
    console.error('Error fetching ride:', error);
    res.status(500).json({ error: 'Failed to fetch ride' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;