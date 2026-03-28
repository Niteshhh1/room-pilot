import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.status(200).json({
    message: 'File Uploaded',
    filePath: `/${req.file.path.replace(/\\/g, '/')}`,
  });
});

export default router;
