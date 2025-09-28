# Public Assets Directory

This directory contains user-uploaded assets for use in Remotion animations.

## Directory Structure

- **`images/`** - Photos, graphics, illustrations, backgrounds
- **`logos/`** - Brand logos, icons, company marks
- **`fonts/`** - Custom fonts for text animations (TTF, OTF, WOFF)
- **`audio/`** - Music, sound effects, voiceovers (MP3, WAV)

## Usage in Animations

### Images & Logos
```typescript
import logo from '/public/logos/company-logo.png';

<img src={logo} style={{width: 300, height: 'auto'}} />
```

### Fonts
```typescript
// In animation CSS:
@font-face {
  font-family: 'CustomFont';
  src: url('/public/fonts/custom-font.ttf');
}

<div style={{fontFamily: 'CustomFont'}}>Your Text</div>
```

### Audio
```typescript
import { Audio } from 'remotion';

<Audio src="/public/audio/background-music.mp3" />
```

## File Requirements

- **Images**: PNG, JPG, SVG, WebP (max 10MB)
- **Fonts**: TTF, OTF, WOFF, WOFF2 (max 5MB)
- **Audio**: MP3, WAV, OGG (max 50MB)
- **Total storage**: Recommended to keep under 500MB

## Asset Management

Use Claude Desktop MCP tools:
- `upload_asset` - Upload files to public directory
- `list_assets` - Browse available assets
- `delete_asset` - Remove unused assets
- `get_asset_info` - Get asset details and dimensions

---

**Note**: Assets are automatically synced between container and Windows host filesystem for easy access and persistence.