"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpload = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const uuid_1 = require("uuid");
// Ensure upload directory exists
const UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads');
fs_extra_1.default.ensureDirSync(UPLOAD_DIR);
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
};
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
        files: 10 // Max 10 files at once
    }
}).single('file');
// Wrapper to handle multer errors
const handleUpload = (req, res, next) => {
    (0, exports.uploadMiddleware)(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            let message = 'Upload error';
            if (err.code === 'LIMIT_FILE_SIZE') {
                message = 'File too large (max 50MB)';
            }
            else if (err.code === 'LIMIT_FILE_COUNT') {
                message = 'Too many files (max 10)';
            }
            return res.status(400).json({
                success: false,
                error: 'UPLOAD_ERROR',
                message
            });
        }
        else if (err) {
            return res.status(400).json({
                success: false,
                error: 'UPLOAD_ERROR',
                message: err.message
            });
        }
        next();
    });
};
exports.handleUpload = handleUpload;
