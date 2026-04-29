import express from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties
} from '../controllers/propertyController.js';
import { protect, owner } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(getProperties)
  .post(protect, owner, upload.array('images', 5), createProperty);

router.get('/owner/my-properties', protect, owner, getMyProperties);

router.route('/:id')
  .get(getPropertyById)
  .put(protect, owner, upload.array('images', 5), updateProperty)
  .delete(protect, owner, deleteProperty);

export default router;
