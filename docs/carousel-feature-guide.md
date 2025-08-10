# Article Card Carousel Feature

## Overview

The carousel feature allows article cards on the homepage to cycle through multiple images automatically, creating a more dynamic and engaging visual experience.

## How to Enable

To enable the carousel feature for an article, add the following to your post's frontmatter:

```yaml
---
title: "Your Article Title"
date: 2025-01-24T12:00:00+0000
carousel: true
image: "/images/main-image.jpg" # Main image (also first in carousel)
images:
  - "/images/main-image.jpg" # First image to display
  - "/images/second-image.jpg" # Second image
  - "/images/third-image.jpg" # Third image
  # Add as many images as needed
---
```

## Requirements

1. **carousel: true** - This enables the carousel functionality
2. **images array** - Must contain at least 2 images for carousel to activate
3. **image field** - Should contain the first image from the array as fallback

## Behavior

- **Multiple images (2+)**: Article card will cycle through all images every 1 second
- **Single image**: Displays as a regular static image card
- **No carousel field or carousel: false**: Displays as a regular static image card

## Technical Details

- Images cycle every 1000ms (1 second)
- Smooth fade transition between images (0.3s)
- Works with all article card types (regular, comments, gallery, etc.)
- JavaScript automatically detects carousel-enabled cards on page load
- Compatible with existing image styling and responsive design

## Files Modified

1. **layouts/partials/article-card.html** - Added carousel detection and image rendering
2. **assets/css/article-cards.css** - Added carousel styling and transitions
3. **static/js/article-carousel.js** - JavaScript for image cycling functionality
4. **layouts/partials/scripts.html** - Included carousel script

## Example Usage

```yaml
---
title: "Amazing Gallery of Nature Photos"
date: 2025-01-24T12:00:00+0000
authors: ["photographer"]
carousel: true
image: "/images/nature/forest.jpg"
images:
  - "/images/nature/forest.jpg"
  - "/images/nature/mountain.jpg"
  - "/images/nature/ocean.jpg"
  - "/images/nature/desert.jpg"
description: "A beautiful collection of nature photography."
categories:
  - "Gallery"
tags:
  - "Photography"
  - "Nature"
---
```

This will create an article card that cycles through forest → mountain → ocean → desert images continuously on the homepage.
