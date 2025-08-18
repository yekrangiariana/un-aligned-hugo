# Shortcode Usage Guide for Authors and Editors

## Overview

Shortcodes are powerful tools that allow you to embed rich content and functionality within your articles without writing HTML. This guide covers all available shortcodes and their proper usage.

## Quick Reference

| Shortcode | Usage | Purpose |
|-----------|-------|---------|
| `sim` | `{{< sim "article-slug" >}}` | Ultra-short similar article card |
| `similar-articles` | `{{< similar-articles "article-slug" >}}` | Similar article card (alternative syntax) |
| `photo-normal` | `{{< photo-normal src="/images/photo.jpg" >}}` | Standard size photo |
| `photo-large` | `{{< photo-large src="/images/photo.jpg" >}}` | Large photo layout |
| `photo-xlarge` | `{{< photo-xlarge src="/images/photo.jpg" >}}` | Extra large photo layout |
| `photo-custom` | `{{< photo-custom src="/images/photo.jpg" width="75" >}}` | Custom width photo |
| `category-list` | `{{< category-list >}}` | Display all categories |
| `tag-list` | `{{< tag-list >}}` | Display all tags |

---

## 1. Similar Article Cards

### Purpose
Display a related article card within your content, styled to match the site's design with category-specific colors.

### Syntax Options

**Ultra-short (Recommended):**
```markdown
{{< sim "article-slug" >}}
```

**Full syntax:**
```markdown
{{< similar-articles "article-slug" >}}
```

### Parameters
- **article-slug**: The slug of the article you want to reference (found in the article's URL or frontmatter)

### Example Usage
```markdown
In our previous coverage of this topic, we explored the broader implications.

{{< sim "inside-israels-war-on-truth-journalists-and-the-free-media" >}}

The situation continues to evolve as more journalists face threats.
```

### Features
- Automatically displays article image, title, and "Read more" link
- Category-specific color coding for titles
- Responsive design (sidebar on desktop, inline on mobile)
- Hover effects for better user experience
- Dark mode support

### Finding Article Slugs
The article slug is:
1. The filename without `.md` extension (e.g., `my-article.md` → `my-article`)
2. The `slug:` field in the article's frontmatter
3. The last part of the article's URL

---

## 2. Photo Shortcodes

### Purpose
Display images with automatic caption management, copyright information, and responsive sizing.

### Image Data Integration
All photo shortcodes automatically pull metadata from `data/images.json` including:
- Captions
- Alt text
- Copyright information
- Copyright links

### photo-normal

**Standard size photo for regular content**

```markdown
{{< photo-normal src="/images/example.jpg" >}}
```

**With manual caption:**
```markdown
{{< photo-normal src="/images/example.jpg" caption="Your custom caption" >}}
```

### photo-large

**Large photo that extends beyond normal content width**

```markdown
{{< photo-large src="/images/example.jpg" >}}
```

### photo-xlarge

**Extra large photo for dramatic effect**

```markdown
{{< photo-xlarge src="/images/example.jpg" >}}
```

### photo-custom

**Custom width photo (specify percentage)**

```markdown
{{< photo-custom src="/images/example.jpg" width="75" >}}
```

**Parameters:**
- `src`: Image path (required)
- `caption`: Manual caption (optional - overridden by JSON data)
- `width`: Percentage width for custom photos (default: 50%)

### Best Practices for Photos

1. **Use appropriate sizes:**
   - `photo-normal`: Regular article images
   - `photo-large`: Featured images, important visuals
   - `photo-xlarge`: Hero images, dramatic effect
   - `photo-custom`: Specific sizing needs

2. **Image paths:** Always start with `/images/`

3. **Caption priority:**
   - JSON data takes precedence over manual captions
   - Update `data/images.json` for permanent captions

---

## 3. Taxonomy Lists

### category-list

**Display all categories with post counts**

```markdown
{{< category-list >}}
```

Output example:
- Politics (45)
- Culture (32)
- Science (28)

### tag-list

**Display all tags with post counts**

```markdown
{{< tag-list >}}
```

Output example:
- Climate Change (15)
- Human Rights (23)
- Technology (18)

---

## Best Practices

### 1. Shortcode Placement

**DO:**
- Place shortcodes on their own lines
- Add blank lines before and after shortcodes
- Use consistent spacing

```markdown
Here's some text about the topic.

{{< sim "related-article" >}}

And here we continue with more content.
```

**DON'T:**
- Embed shortcodes inline with text
- Forget spacing around shortcodes

### 2. Similar Articles

**Best timing for similar articles:**
- After introducing a topic that has been covered before
- When referencing previous coverage
- To provide additional context
- Near the end of articles for further reading

**Avoid:**
- Using too many similar article cards in one piece
- Placing them too early in the article
- Using unrelated articles

### 3. Photo Selection

**Choose the right photo size:**
- **Normal**: Most photos, portraits, diagrams
- **Large**: Landscapes, group photos, important visuals
- **XLarge**: Hero shots, dramatic scenes
- **Custom**: When you need specific proportions

### 4. Error Prevention

**Common mistakes:**
- Incorrect article slugs (check the actual slug)
- Missing quotes around parameters
- Wrong image paths
- Inconsistent spacing

**Testing:**
- Always preview your article before publishing
- Check that similar article cards link correctly
- Verify images display properly
- Test on mobile devices

---

## Advanced Usage

### Conditional Shortcodes

You can combine shortcodes strategically:

```markdown
For more background on this issue:

{{< sim "background-article" >}}

The visual evidence is compelling:

{{< photo-large src="/images/evidence.jpg" >}}

Related topics include:

{{< category-list >}}
```

### Responsive Considerations

All shortcodes are responsive, but consider:
- Similar article cards stack on mobile
- Large photos may become smaller on mobile
- Test your content on different screen sizes

---

## Troubleshooting

### Similar Article Not Found
**Error:** "Article not found: article-slug"

**Solutions:**
1. Check the article slug is correct
2. Ensure the referenced article is published
3. Verify the article exists in the content directory

### Image Not Displaying
**Solutions:**
1. Check image path starts with `/images/`
2. Verify image file exists in `static/images/`
3. Check file name case sensitivity

### Styling Issues
**Solutions:**
1. Ensure proper spacing around shortcodes
2. Check for HTML conflicts
3. Verify CSS is loading properly

---

## Development Notes

### Adding New Shortcodes
New shortcodes should be added to `layouts/shortcodes/` and documented here.

### Modifying Existing Shortcodes
When modifying shortcodes:
1. Test with existing content
2. Update this documentation
3. Consider backward compatibility

### Image Data Management
The `data/images.json` file contains metadata for all images. When adding new images:
1. Add entry to JSON file
2. Include caption, alt text, and copyright info
3. Use lowercase filenames for JSON keys

---

## Support

For technical issues or questions about shortcodes:
1. Check this documentation first
2. Test with simple examples
3. Verify file paths and parameters
4. Contact the development team for assistance

Remember: Shortcodes make your content more engaging and easier to manage. Use them strategically to enhance your articles without overwhelming readers.
