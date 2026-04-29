import express from 'express';
import {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { protect, tenant, owner } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, tenant, createBooking);
router.get('/my-bookings', protect, tenant, getMyBookings);
router.get('/owner-bookings', protect, owner, getOwnerBookings);
router.put('/:id/status', protect, owner, updateBookingStatus);

export default router;
