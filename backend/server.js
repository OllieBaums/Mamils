const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'rides.json');
const PHOTOS_FILE = path.join(__dirname, 'data', 'photos.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded photos statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

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
    return [];
  }
};

// Helper function to write rides to file
const writeRides = async (rides) => {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(rides, null, 2));
};

// Helper function to read photos from file
const readPhotos = async () => {
  try {
    const data = await fs.readFile(PHOTOS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to write photos to file
const writePhotos = async (photos) => {
  await ensureDataDir();
  await fs.writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2));
};

// RIDES ROUTES (existing)

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
    const { name, date, location, distance, elevation, notes, photos } = req.body;
    
    if (!name || !date || !location || !location.lat || !location.lng) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, date, location (lat, lng)' 
      });
    }

    const rides = await readRides();
    
    const newRide = {
      id: Date.now(),
      name,
      date,
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      },
      distance: parseFloat(distance) || 0,
      elevation: parseFloat(elevation) || 0,
      notes: notes || '',
      photos: photos || [], // Array of photo IDs
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
    
    rides[rideIndex] = {
      ...rides[rideIndex],
      ...updates,
      id: rideId,
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

// PHOTO ROUTES (new)

// GET /api/photos - Get all photos with optional year filter
app.get('/api/photos', async (req, res) => {
  try {
    const photos = await readPhotos();
    const { year } = req.query;
    
    if (year) {
      const filteredPhotos = photos.filter(photo => {
        const photoYear = new Date(photo.dateTaken || photo.uploadedAt).getFullYear();
        return photoYear === parseInt(year);
      });
      return res.json(filteredPhotos);
    }
    
    res.json(photos);
  } catch (error) {
    console.error('Error reading photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// POST /api/photos/upload - Upload photos
app.post('/api/photos/upload', upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }

    const photos = await readPhotos();
    const newPhotos = [];

    for (const file of req.files) {
      const photoData = {
        id: Date.now() + Math.random(), // Unique ID
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString(),
        dateTaken: req.body.dateTaken || new Date().toISOString(), // Can be set by client
        description: req.body.description || '',
        tags: req.body.tags ? req.body.tags.split(',') : []
      };
      
      photos.push(photoData);
      newPhotos.push(photoData);
    }

    await writePhotos(photos);
    res.status(201).json(newPhotos);
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// PUT /api/photos/:id - Update photo metadata
app.put('/api/photos/:id', async (req, res) => {
  try {
    const photoId = parseFloat(req.params.id);
    const updates = req.body;
    
    const photos = await readPhotos();
    const photoIndex = photos.findIndex(photo => photo.id === photoId);
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    photos[photoIndex] = {
      ...photos[photoIndex],
      ...updates,
      id: photoId,
      updatedAt: new Date().toISOString()
    };
    
    await writePhotos(photos);
    res.json(photos[photoIndex]);
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// DELETE /api/photos/:id - Delete a photo
app.delete('/api/photos/:id', async (req, res) => {
  try {
    const photoId = parseFloat(req.params.id);
    
    const photos = await readPhotos();
    const photo = photos.find(p => p.id === photoId);
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // Delete the actual file
    try {
      await fs.unlink(path.join(UPLOADS_DIR, photo.filename));
    } catch (fileError) {
      console.warn('Could not delete photo file:', fileError.message);
    }
    
    // Remove from photos array
    const filteredPhotos = photos.filter(p => p.id !== photoId);
    await writePhotos(filteredPhotos);
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// GET /api/photos/years - Get available years
app.get('/api/photos/years', async (req, res) => {
  try {
    const photos = await readPhotos();
    const years = [...new Set(photos.map(photo => {
      const date = new Date(photo.dateTaken || photo.uploadedAt);
      return date.getFullYear();
    }))].sort((a, b) => b - a); // Sort descending
    
    res.json(years);
  } catch (error) {
    console.error('Error getting photo years:', error);
    res.status(500).json({ error: 'Failed to get photo years' });
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