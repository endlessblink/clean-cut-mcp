#!/bin/bash
# Backup script before making any changes to animations

echo "🛡️ Creating safety backup before animation changes..."

# Create timestamped backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/backup_$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# Backup critical files (updated for src/ structure)
cp -r clean-cut-workspace/src/assets/animations "$BACKUP_DIR/"
cp clean-cut-workspace/src/Root.tsx "$BACKUP_DIR/"
cp clean-cut-workspace/remotion.config.ts "$BACKUP_DIR/"
cp clean-cut-workspace/src/index.ts "$BACKUP_DIR/"

echo "✅ Backup created in: $BACKUP_DIR"
echo "📋 Files backed up:"
echo "   - All animation components"
echo "   - Root.tsx (composition registry)"
echo "   - remotion.config.ts (entry point config)"
echo "   - index.ts (main entry)"
echo ""
echo "🔄 To restore if needed: ./restore-backup.sh $TIMESTAMP"