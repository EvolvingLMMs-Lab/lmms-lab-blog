# LMMS-Lab Website

A modern research blog built with Next.js 14, featuring a brutalist/sci-fi design system with auto-generated thumbnails and randoma11y-compliant color palette.

## Design System

### Color Palette (randoma11y)

| Role | Color | Hex |
|------|-------|-----|
| Background | Deep Teal | `#03639a` |
| Foreground | Warm Cream | `#fed7aa` |

APCA Contrast: passes Lc 60 for body text

### Visual Style

- Brutalist/sci-fi aesthetic
- Procedurally generated thumbnails
- Halftone and circuit patterns
- Animated SVG elements

## Getting Started

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build
```

## Adding a New Blog Post

### 1. Create the MDX File

Create a new `.mdx` file in `content/posts/`:

```bash
content/posts/your-post-slug.mdx
```

The filename becomes the URL slug: `/posts/your-post-slug`

### 2. Add Frontmatter

```yaml
---
title: "Your Post Title"
description: "Brief description for SEO (50-160 characters)"
publishDate: "2025-02-01"
mainTags: ["research", "llm"]
tags: ["research", "llm", "multimodal"]
authors:
  - name: "Author Name"
    url: "https://www.lmms-lab.com/about/"
    main: true
  - name: "Co-Author Name"
bibtex: |
  @article{yourpaper2025,
    title={Your Paper Title},
    author={Author, Name},
    journal={arXiv preprint},
    year={2025}
  }
---

Your markdown content here...
```

### 3. Frontmatter Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Post title (max 60 chars recommended) |
| `description` | string | Yes | SEO description (50-160 chars) |
| `publishDate` | string | Yes | ISO date format (YYYY-MM-DD) |
| `mainTags` | string[] | Yes | Primary categories (1-2 tags) |
| `tags` | string[] | No | All tags including mainTags |
| `authors` | object[] | No | List of authors with name, url, main |
| `bibtex` | string | No | BibTeX citation block |
| `thumbnail` | string | No | Custom thumbnail URL (overrides auto-generation) |

## Auto-Generated Thumbnails

When no `thumbnail` is specified in frontmatter, the system automatically generates a sci-fi themed thumbnail based on the post title.

### How It Works

The `PostThumbnail` component (`components/blog/PostThumbnail.tsx`) generates SVG patterns procedurally:

1. **Hash Generation**: Title is hashed to a deterministic number
2. **Pattern Selection**: Hash selects one of 5 pattern variants
3. **Element Generation**: Pattern elements are generated with seeded randomness
4. **Animation**: CSS animations with staggered delays

### Pattern Variants

| Variant | Description | Visual Style |
|---------|-------------|--------------|
| `HalftonePortrait` | Dithered figure silhouette | Dot matrix portrait |
| `CircuitGrid` | Grid nodes with circuit traces | Tech/hardware aesthetic |
| `DataBlocks` | Rectangular data visualization | Dashboard/analytics |
| `WaveformDisplay` | Audio waveforms + spectrum bars | Signal processing |
| `AbstractFigure` | Radial rings with particles | Cosmic/abstract |

### Customizing Thumbnail Generation

To force a specific pattern variant, modify the component usage:

```tsx
// In your page component
<PostThumbnail 
  title={post.title} 
  seed={post.slug}  // Change seed to get different pattern
/>
```

The pattern is determined by: `hash(seed || title) % 5`

To get a specific pattern for a post, you can:
1. Adjust the post slug
2. Or modify the seed parameter

### Pattern-to-Hash Mapping

| Hash % 5 | Pattern |
|----------|---------|
| 0 | HalftonePortrait |
| 1 | CircuitGrid |
| 2 | DataBlocks |
| 3 | WaveformDisplay |
| 4 | AbstractFigure |

### Using Custom Thumbnails

To use a custom image instead of auto-generation:

```yaml
---
title: "Your Post"
thumbnail: "/images/custom-thumbnail.jpg"
---
```

### Generating Midjourney Thumbnails (Retro-Futurism Style)

For custom thumbnails with a consistent visual identity, use the following meta-prompt with Midjourney (or any image generation model). Feed it the paper title + abstract and it will output a ready-to-use prompt.

#### Visual Style Constraints

| Constraint | Specification |
|------------|---------------|
| Aesthetic | 1-bit Pixel Art + Dithering |
| Color | Strictly black and white monochrome. No greyscale - use dithering for shading |
| Vibe | Retro Macintosh 1984, Glitch Art, High-Tech but Lo-Fi, Cold, Rational |
| Composition | Minimalist but textured. Heavy negative space or dense noise patterns |
| Aspect Ratio | `--ar 16:9` |

#### Meta-Prompt

Copy the following system prompt into ChatGPT / Claude, then feed it your paper's title and abstract:

````text
# Role: Technical Visual Director (Retro-Futurism Specialist)

## Goal
Read a provided title and abstract of a technical AI paper (especially related to
LLMs, RL, or Computer Vision) and generate a specific Midjourney Prompt to create
a cover image for it.

## Visual Style Constraints (MUST FOLLOW)
1. **Aesthetic:** "1-bit Pixel Art" & "Dithering".
2. **Color:** Strictly Black and White (Monochrome). No greyscale, use dithering for shading.
3. **Vibe:** Retro Macintosh 1984, Glitch Art, High-Tech but Lo-Fi, Cold, Rational.
4. **Composition:** Minimalist but textured. Heavy use of negative space or dense noise patterns.

## Workflow
1. **Analyze the Input:** Identify 2-3 core technical concepts
   (e.g., "Optimization," "Fusion," "Speed," "Reasoning").
2. **Translate to Metaphors:**
   - *Reinforcement Learning* -> Mazes, Feedback loops, Climbing mountains, Paths emerging from chaos.
   - *Multimodal* -> Eyes made of text, Hands touching digital interfaces, Fusion of geometry and organic shapes.
   - *Lightweight/Efficiency* -> Thin lines, Floating geometric crystals, Feathers made of wireframe.
   - *Hallucination/Noise* -> Static fog, Glitch, Broken pixels.
   - *Video/Temporal* -> Film strips, Timelines, Mechanical arms extracting frames.
   - *Audio/Speech* -> Waveforms, Prisms refracting sound, Frequency spectra.
   - *High-Resolution/Grounding* -> Recursive zoom boxes, Crosshairs, Fractal clarity.
   - *Open-Source/Democratization* -> Open gates, Exposed blueprints, Visible architecture.
   - *Data Diversity* -> Multiple converging streams, Mosaic textures, Assembled crystals.
3. **Construct the Prompt:**
   - [Subject Description with Metaphor]
   - [Environment/Background]
   - [Style Tags: 1-bit pixel art, dithered, grainy, stark black and white, etc.]

## Output Format
**Analysis:** [Briefly explain the metaphor you chose]
**Midjourney Prompt:** `/imagine prompt: [Your generated prompt] --ar 16:9 --v 6.0`
````

#### Example

**Input:**
> Paper Title: DeepSeek-V3: Optimizing Latent Attention for Faster Inference

**Output:**

> **Analysis:** Focus on "Faster Inference" and "Attention". Metaphor: a laser beam cutting through a fog of latency.
>
> **Midjourney Prompt:**
> `/imagine prompt: A sharp, focused beam of white light piercing through a dense cloud of dark, dithering static noise. The beam creates a tunnel of clarity. Concept: "Optimized Attention cutting through latency". Style: 1-bit pixel art, heavy dithering texture, retro-futurism, stark contrast, clean geometric lines against chaotic background. --ar 16:9 --v 6.0`

#### Metaphor Reference Table

Use this as a quick lookup when writing prompts manually:

| Technical Concept | Visual Metaphor |
|-------------------|-----------------|
| Reinforcement Learning | Mazes, feedback loops, mountains, paths from chaos |
| Multimodal | Eyes made of text, geometry-organic fusion |
| Lightweight / Efficiency | Thin lines, wireframe crystals, floating feathers |
| Hallucination / Noise | Static fog, glitch, broken pixels |
| Video / Temporal | Film strips, timelines, mechanical frame extraction |
| Audio / Speech | Waveforms, prisms refracting sound, frequency bars |
| High-Resolution / Grounding | Recursive zoom boxes, crosshairs, fractal clarity |
| Open-Source / Democratization | Open gates, exposed blueprints, visible internals |
| Data Diversity / Curation | Converging streams, mosaic textures, assembled crystals |
| Reasoning / Chain-of-Thought | Spiral staircases, branching paths, ascending steps |
| Speed / Inference | Laser beams, tunnels of clarity, motion blur |
| Scaling | Fractal repetition, nested structures, horizon vanishing points |

### Animation Details

All thumbnails include subtle CSS animations:

| Element | Animation | Duration |
|---------|-----------|----------|
| Circles | Pulse opacity | 3s |
| Rectangles | Float up/down | 4s |
| Lines | Pulse opacity | 2.5s |
| Polylines | Wave side-to-side | 6s |
| Paths | Draw effect | 3s |

Animations respect `prefers-reduced-motion` for accessibility.

## Project Structure

```
├── app/                    # Next.js app router
│   ├── page.tsx           # Homepage
│   ├── posts/
│   │   └── [slug]/        # Dynamic blog post pages
│   └── layout.tsx         # Root layout
├── components/
│   ├── blog/
│   │   ├── PostThumbnail.tsx   # Auto-generated thumbnails
│   │   ├── TableOfContents.tsx # Sticky TOC
│   │   └── ReadingProgress.tsx # Reading progress bar
│   └── decorative/
│       ├── DitherPattern.tsx   # Background textures
│       ├── ConcentricOverlay.tsx
│       └── GrainOverlay.tsx
├── content/
│   └── posts/             # MDX blog posts
├── lib/
│   ├── posts.ts           # Post loading utilities
│   └── toc.ts             # Table of contents extraction
└── styles/
    └── globals.css        # Design system + animations
```

## Styling Guide

### CSS Variables

```css
:root {
  --background: #03639a;
  --foreground: #fed7aa;
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;
}
```

### Utility Classes

| Class | Effect |
|-------|--------|
| `.card-lift` | Hover lift with shadow |
| `.link-underline` | Animated underline on hover |
| `.fade-in-up` | Fade in from below |
| `.interactive` | Brightness on hover |

## Development

```bash
# Run development server
npm run dev

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run start
```

## Adding New Thumbnail Patterns

To add a new pattern variant:

1. Create the pattern function in `components/blog/PostThumbnail.tsx`:

```tsx
function NewPattern({ hash }: { hash: number }) {
  const elements = useMemo(() => {
    const items: JSX.Element[] = [];
    // Generate SVG elements using seededRandom(hash + offset)
    return items;
  }, [hash]);

  return (
    <svg className="post-thumbnail-v2-svg" viewBox="0 0 100 100">
      {elements}
    </svg>
  );
}
```

2. Add to the variant list and switch statement:

```tsx
const variants = ["concentric", "scanlines", ..., "newpattern"];

// In renderPattern switch:
case "newpattern":
  return <NewPattern hash={hash} />;
```

3. Update the total variant count for hash distribution.

## License

MIT
