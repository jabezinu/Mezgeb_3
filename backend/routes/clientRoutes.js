import { Router } from 'express';
import { getClients, getClient, createClient, updateClient, deleteClient, getClientStats, getClientsByPeriod, getClientsByDate } from '../controllers/clientController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// All routes are protected and require authentication
router.use(protect);

router.get('/', getClients);
router.get('/stats/addition', getClientStats);
router.get('/by-period', getClientsByPeriod);
router.get('/by-date', getClientsByDate);
router.get('/:id', getClient);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;