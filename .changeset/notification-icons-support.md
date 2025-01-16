---
'@capacitor/assets': minor
---

Added support for Android notification icons:
- Enhanced existing notification icon support with proper template handling
- Added notification icon templates for all Android densities (mdpi through xxxhdpi)
- Generates notification icons in drawable-{density} folders
- Copies highest resolution icon to main drawable folder
- Uses existing asset generation pipeline and OutputAsset system
- Maintains consistent file naming (ic_stat_notification.png) 