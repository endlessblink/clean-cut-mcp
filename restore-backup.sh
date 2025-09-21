#!/bin/bash
# Restore script to recover from backup

if [ -z "$1" ]; then
    echo "❌ Usage: ./restore-backup.sh TIMESTAMP"
    echo "Available backups:"
    ls -la backups/ 2>/dev/null || echo "No backups found"
    exit 1
fi

TIMESTAMP=$1
BACKUP_DIR="./backups/backup_$TIMESTAMP"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup not found: $BACKUP_DIR"
    exit 1
fi

echo "🔄 Restoring from backup: $TIMESTAMP"

# Restore files (updated for src/ structure)
cp -r "$BACKUP_DIR/animations" clean-cut-workspace/src/assets/
cp "$BACKUP_DIR/Root.tsx" clean-cut-workspace/src/
cp "$BACKUP_DIR/remotion.config.ts" clean-cut-workspace/
cp "$BACKUP_DIR/index.ts" clean-cut-workspace/src/

echo "✅ Restored successfully!"
echo "🔄 Restarting container to apply changes..."

# Restart container to pick up changes
docker restart clean-cut-mcp

echo "✅ System restored to working state"