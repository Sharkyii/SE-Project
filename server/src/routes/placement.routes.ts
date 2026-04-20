import express from 'express';
import { protect } from '../middlewares/auth';
import { authorize } from '../middlewares/roleGuard';
import { addCompany, getCompanies, addSelection, getSelections, getMySelections } from '../controllers/placementController';

const router = express.Router();

router.use(protect);

// Admin routes
router.post('/companies', authorize('admin'), addCompany);
router.post('/selections', authorize('admin'), addSelection);

// Shared routes
router.get('/companies', getCompanies);
router.get('/selections/:company_id', getSelections);

// Student specific
router.get('/my-selections', authorize('student'), getMySelections);

export default router;
