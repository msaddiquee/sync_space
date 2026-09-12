const express = require('express');
const router = express.Router();
const {
  getMyWorkspaces,
  createWorkspace,
  joinWorkspace,
  getWorkspaceById
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getMyWorkspaces)
  .post(createWorkspace);

router.post('/join', joinWorkspace);
router.get('/:id', getWorkspaceById);

module.exports = router;

