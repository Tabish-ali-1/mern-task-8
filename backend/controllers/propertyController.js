import Property from '../models/Property.js';

// @desc    Get all properties (with optional filtering)
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, search } = req.query;
    
    let query = {};
    
    // Only show available properties for regular browsing
    query.availability = true;

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.rent = {};
      if (minPrice) query.rent.$gte = Number(minPrice);
      if (maxPrice) query.rent.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query).populate('owner', 'name email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email');
    
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a property
// @route   POST /api/properties
// @access  Private/Owner
export const createProperty = async (req, res) => {
  try {
    const { title, description, rent, location, availability } = req.body;
    
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const property = new Property({
      owner: req.user._id,
      title,
      description,
      rent,
      location,
      images: imageUrls,
      availability: availability !== undefined ? availability : true,
    });

    const createdProperty = await property.save();
    res.status(201).json(createdProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private/Owner
export const updateProperty = async (req, res) => {
  try {
    const { title, description, rent, location, availability } = req.body;
    
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if the user is the owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this property' });
    }

    property.title = title || property.title;
    property.description = description || property.description;
    property.rent = rent || property.rent;
    property.location = location || property.location;
    if (availability !== undefined) {
        property.availability = availability;
    }

    // If new images are uploaded, append or replace (here we append for simplicity)
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      property.images = [...property.images, ...newImages];
    }

    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private/Owner
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this property' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get owner's properties
// @route   GET /api/properties/owner/my-properties
// @access  Private/Owner
export const getMyProperties = async (req, res) => {
    try {
      const properties = await Property.find({ owner: req.user._id });
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
