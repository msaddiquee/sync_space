const express = require('express');
const router = express.Router();
const {
  getWorkspaceDocuments,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/workspace/:workspaceId', getWorkspaceDocuments);
router.post('/', createDocument);

router.route('/:id')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

module.exports = router;

