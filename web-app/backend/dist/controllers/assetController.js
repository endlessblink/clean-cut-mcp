"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class AssetController {
    constructor() {
        this.uploadAsset = async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        error: 'NO_FILE',
                        message: 'No file uploaded'
                    });
                }
                const { filename, mimetype, size } = req.file;
                const url = `/assets/${filename}`;
                res.json({
                    success: true,
                    data: {
                        filename,
                        url,
                        size,
                        type: mimetype
                    },
                    message: 'Asset uploaded successfully'
                });
            }
            catch (error) {
                console.error('Error uploading asset:', error);
                res.status(500).json({
                    success: false,
                    error: 'UPLOAD_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.listAssets = async (req, res) => {
            try {
                const files = await fs_extra_1.default.readdir(this.assetsDir);
                const assets = await Promise.all(files
                    .filter(file => !file.startsWith('.'))
                    .map(async (filename) => {
                    const filePath = path_1.default.join(this.assetsDir, filename);
                    const stats = await fs_extra_1.default.stat(filePath);
                    return {
                        filename,
                        size: stats.size,
                        type: this.getMimeType(filename),
                        url: `/assets/${filename}`,
                        uploadedAt: stats.mtime.toISOString()
                    };
                }));
                res.json({
                    success: true,
                    data: assets,
                    message: `Found ${assets.length} assets`
                });
            }
            catch (error) {
                console.error('Error listing assets:', error);
                res.status(500).json({
                    success: false,
                    error: 'LIST_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.deleteAsset = async (req, res) => {
            try {
                const { filename } = req.params;
                const filePath = path_1.default.join(this.assetsDir, filename);
                if (!await fs_extra_1.default.pathExists(filePath)) {
                    return res.status(404).json({
                        success: false,
                        error: 'ASSET_NOT_FOUND',
                        message: `Asset '${filename}' not found`
                    });
                }
                await fs_extra_1.default.remove(filePath);
                res.json({
                    success: true,
                    data: { deleted: filename },
                    message: `Asset '${filename}' deleted successfully`
                });
            }
            catch (error) {
                console.error('Error deleting asset:', error);
                res.status(500).json({
                    success: false,
                    error: 'DELETE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.assetsDir = path_1.default.join(process.cwd(), '../../clean-cut-workspace/public');
        fs_extra_1.default.ensureDirSync(this.assetsDir);
    }
    getMimeType(filename) {
        const ext = path_1.default.extname(filename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
}
exports.AssetController = AssetController;
