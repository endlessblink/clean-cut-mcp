import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { ApiResponse } from '@clean-cut/shared';

export class AssetController {
  private readonly assetsDir: string;

  constructor() {
    this.assetsDir = path.join(process.cwd(), '../../clean-cut-workspace/public');
    fs.ensureDirSync(this.assetsDir);
  }

  uploadAsset = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'NO_FILE',
          message: 'No file uploaded'
        } as ApiResponse);
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
      } as ApiResponse);

    } catch (error) {
      console.error('Error uploading asset:', error);
      res.status(500).json({
        success: false,
        error: 'UPLOAD_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  listAssets = async (req: Request, res: Response) => {
    try {
      const files = await fs.readdir(this.assetsDir);
      const assets = await Promise.all(
        files
          .filter(file => !file.startsWith('.'))
          .map(async (filename) => {
            const filePath = path.join(this.assetsDir, filename);
            const stats = await fs.stat(filePath);

            return {
              filename,
              size: stats.size,
              type: this.getMimeType(filename),
              url: `/assets/${filename}`,
              uploadedAt: stats.mtime.toISOString()
            };
          })
      );

      res.json({
        success: true,
        data: assets,
        message: `Found ${assets.length} assets`
      } as ApiResponse);

    } catch (error) {
      console.error('Error listing assets:', error);
      res.status(500).json({
        success: false,
        error: 'LIST_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  deleteAsset = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(this.assetsDir, filename);

      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'ASSET_NOT_FOUND',
          message: `Asset '${filename}' not found`
        } as ApiResponse);
      }

      await fs.remove(filePath);

      res.json({
        success: true,
        data: { deleted: filename },
        message: `Asset '${filename}' deleted successfully`
      } as ApiResponse);

    } catch (error) {
      console.error('Error deleting asset:', error);
      res.status(500).json({
        success: false,
        error: 'DELETE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
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