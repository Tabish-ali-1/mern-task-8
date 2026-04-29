import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

// @desc    Create new booking/inquiry
// @route   POST /api/bookings
// @access  Private/Tenant
export const createBooking = async (req, res) => {
  try {
    const { propertyId, startDate, endDate, inquiryText } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (!property.availability) {
      return res.status(400).json({ message: 'Property is not available' });
    }

    const booking = new Booking({
      property: propertyId,
      tenant: req.user._id,
      startDate,
      endDate,
      inquiryText,
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tenant's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private/Tenant
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user._id }).populate('property', 'title location rent images');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get owner's property bookings
// @route   GET /api/bookings/owner-bookings
// @access  Private/Owner
export const getOwnerBookings = async (req, res) => {
  try {
    // First find all properties owned by this user
    const properties = await Property.find({ owner: req.user._id });
    const propertyIds = properties.map(p => p._id);

    // Find bookings for these properties
    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property', 'title location rent')
      .populate('tenant', 'name email');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Confirm/Reject)
// @route   PUT /api/bookings/:id/status
// @access  Private/Owner
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id).populate('property');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the property
    if (booking.property.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to update this booking' });
    }

    if (status) {
      booking.status = status;
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
