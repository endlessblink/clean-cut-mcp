import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@clean-cut/shared';
import { Request, Response } from 'express';

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
fs.ensureDirSync(UPLOAD_DIR);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 10 // Max 10 files at once
  }
}).single('file');

// Wrapper to handle multer errors
export const handleUpload = (req: Request, res: Response, next: Function) => {
  uploadMiddleware(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      let message = 'Upload error';
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File too large (max 50MB)';
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        message = 'Too many files (max 10)';
      }

      return res.status(400).json({
        success: false,
        error: 'UPLOAD_ERROR',
        message
      } as ApiResponse);
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: 'UPLOAD_ERROR',
        message: err.message
      } as ApiResponse);
    }

    next();
  });
};