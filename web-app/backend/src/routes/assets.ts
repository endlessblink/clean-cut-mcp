import { Router } from 'express';
import { AssetController } from '../controllers/assetController';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();
const controller = new AssetController();

// POST /api/assets/upload - Upload asset (MCP: upload_asset)
router.post('/upload', uploadMiddleware, controller.uploadAsset);

// GET /api/assets - List available assets (MCP: list_assets)
router.get('/', controller.listAssets);

// DELETE /api/assets/:filename - Delete asset (MCP: delete_asset)
router.delete('/:filename', controller.deleteAsset);

export { router as assetRoutes };