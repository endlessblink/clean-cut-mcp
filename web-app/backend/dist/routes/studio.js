"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studioRoutes = void 0;
const express_1 = require("express");
const studioController_1 = require("../controllers/studioController");
const router = (0, express_1.Router)();
exports.studioRoutes = router;
const controller = new studioController_1.StudioController();
// GET /api/studio/url - Get Remotion Studio URL (MCP: get_studio_url)
router.get('/url', controller.getStudioUrl);
// GET /api/studio/exports - Get export directory (MCP: get_export_directory)
router.get('/exports', controller.getExportDirectory);
// POST /api/studio/exports/open - Open export directory (MCP: open_export_directory)
router.post('/exports/open', controller.openExportDirectory);
// POST /api/studio/root-sync - Sync Root.tsx (MCP: auto_sync)
router.post('/root-sync', controller.syncRoot);
// POST /api/studio/rebuild - Rebuild compositions (MCP: rebuild_compositions)
router.post('/rebuild', controller.rebuildCompositions);
// POST /api/studio/cleanup - Cleanup broken imports (MCP: cleanup_broken_imports)
router.post('/cleanup', controller.cleanupBrokenImports);
