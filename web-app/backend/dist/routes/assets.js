"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetRoutes = void 0;
const express_1 = require("express");
const assetController_1 = require("../controllers/assetController");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
exports.assetRoutes = router;
const controller = new assetController_1.AssetController();
// POST /api/assets/upload - Upload asset (MCP: upload_asset)
router.post('/upload', upload_1.uploadMiddleware, controller.uploadAsset);
// GET /api/assets - List available assets (MCP: list_assets)
router.get('/', controller.listAssets);
// DELETE /api/assets/:filename - Delete asset (MCP: delete_asset)
router.delete('/:filename', controller.deleteAsset);
