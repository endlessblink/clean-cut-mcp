# User Guide - Clean-Cut-MCP

## Getting Started

After installation, you have two interfaces:

1. **Claude Desktop** - Create animations with natural language
2. **Remotion Studio** - Visual editor at http://localhost:6970

## Creating Animations with Claude Desktop

### Basic Animation Creation
```
"Create a bouncing ball animation"
"Create sliding text that says 'Welcome'"
"Create a logo animation with spinning effect"
```

### Advanced Requests
```
"Create a data visualization showing sales growth"
"Create a particle explosion effect"
"Create kinetic typography for my company motto"
```

### With Images
1. **Drag image** into Claude Desktop chat
2. **Describe animation**: "Create a logo reveal animation"
3. **Claude generates** React/Remotion code automatically

## Available MCP Tools

- **`create_animation`** - Generate new animations from descriptions
- **`update_composition`** - Modify existing animations
- **`get_studio_url`** - Get Remotion Studio URL
- **`get_export_directory`** - Find exported videos
- **`list_existing_components`** - See all animations
- **`delete_component`** - Remove animations safely

## Using Remotion Studio

### Accessing Studio
- **URL**: http://localhost:6970
- **Auto-opens**: When Claude creates animations
- **Persistent**: Stays running between sessions

### Studio Features
- **Timeline editor** - Adjust timing and duration
- **Real-time preview** - See changes instantly
- **Export options** - MP4, GIF, PNG sequences
- **Props panel** - Customize animation parameters

### Exporting Videos
1. **Open Remotion Studio** (http://localhost:6970)
2. **Select composition** from left panel
3. **Click Render** button
4. **Choose format** (MP4, GIF, etc.)
5. **Videos appear** in `./clean-cut-exports/` folder

## File Structure

```
your-project/
├── clean-cut-exports/          # Exported videos appear here
├── clean-cut-workspace/        # Animation source files
│   └── src/assets/animations/  # Your custom animations
└── install.ps1               # Installer script
```

## Animation Types

### Text Animations
- Kinetic typography
- Text reveals and transitions
- Animated titles and credits

### Logo Animations
- Spinning and scaling effects
- Entrance animations
- Brand reveal sequences

### Data Visualizations
- Animated charts and graphs
- Progress bars and metrics
- Infographic elements

### Custom Animations
- Particle effects
- Morphing shapes
- React component animations

## Tips and Best Practices

### Animation Naming
- Use descriptive names: `CompanyLogoReveal`, `SalesChartAnimation`
- Avoid generic names: `Animation1`, `Test`, `Component`

### Working with Images
- **Supported formats**: PNG, JPG, SVG, WebP
- **Drag into chat**: Claude automatically incorporates images
- **Best quality**: Use high-resolution source images

### Studio Workflow
1. **Create** animation through Claude Desktop conversation
2. **Refine** using Remotion Studio visual editor
3. **Export** video when satisfied with result
4. **Iterate** by asking Claude for modifications

## Common Workflows

### Marketing Video Creation
1. **Drag company logo** into Claude Desktop
2. **Request**: "Create a professional logo animation for social media"
3. **Customize** timing and effects in Remotion Studio
4. **Export** as MP4 for social platforms

### Educational Content
1. **Describe concept**: "Create an animation explaining how APIs work"
2. **Review** generated visualization in Studio
3. **Adjust** timing and add text annotations
4. **Export** for presentations or courses

### Social Media Content
1. **Request**: "Create a quick animated GIF for Instagram stories"
2. **Specify dimensions**: "Make it 1080x1920 for vertical video"
3. **Export** as GIF or MP4 for social platforms

## Troubleshooting

### Studio Not Loading
- Check container: `docker ps | grep clean-cut-mcp`
- Restart container: `docker restart clean-cut-mcp`
- Check port: http://localhost:6970

### Claude Desktop Not Recognizing Tools
- Restart Claude Desktop
- Check config: `%APPDATA%\Claude\claude_desktop_config.json`
- Re-run installer if needed

### Animation Not Appearing
- Check Remotion Studio console for errors
- Verify animation files in `clean-cut-workspace/src/assets/animations/`
- Try refreshing Studio page

For more issues → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)