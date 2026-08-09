# Legacy post migration audit

This document records the article-by-article comparison between the original
Next.js site and the Angular blog. The reference checkout is
`Luodian/lmms-lab-website@61adff1ec39ca458a8cf84dbc3b501c3b6e9c694`
(`fix(animation): keep the mark behind the glyphs`, 2026-07-07).

The goal is content and interaction fidelity inside one consistent LMMs-Lab
publication system. “Preserved” therefore means that the research text, data,
media, links, hierarchy, and meaningful controls agree with the reference. It
does not mean carrying a second copy of the old React application, navigation,
font loader, or page shell into Angular.

## Migration contract

- Standard MDX and note sources keep their prose, headings, lists, tables,
  citations, links, and media order. The old MDX presentation components are
  compiled into semantic HTML rather than shipped with a React runtime.
- Original author order, profile links, lead-author flags, publication date,
  description, and topic labels live in YAML front matter and feed the shared
  Angular header.
- `ResponsiveImage` becomes a dimensioned local image or WebM animation;
  `ResourceCard` becomes a flat research-resource section; `CodeDemo` becomes a
  titled Shiki block; `Collapsible` becomes `details`; and `RLDonutCharts`
  becomes accessible CSS charts.
- The four bespoke React project pages use `layout: showcase`. Their original
  built HTML and component CSS are captured as post-local assets, while a small
  native controller restores copy, tabs, carousel, language, and expandable
  benchmark behavior.
- The standalone OneVision Encoder document remains an HTML-first post. Its
  duplicate site navigation, document head, Tailwind CDN, Font Awesome CDN, and
  inline scripts are removed; its article content and interactive exhibits run
  in the Angular shell through scoped CSS and local controllers.
- All posts share the brand-blue light presentation, self-hosted typography,
  route behavior, comments, print rules, and four-corner visual language.
- Legacy showcase font names are mapped by role onto the host's bundled Roboto,
  Space Grotesk, and Google Sans Code faces. This keeps text measurable and
  visible even on deployment images that provide no system-font fallback.

## Article-by-article comparison

| Current post | Original source and route | Preserved from the original | Unified or host-safe adaptation |
| --- | --- | --- | --- |
| `aero-audio` | `content/posts/aero_audio.mdx`, `/posts/aero_audio` | Complete evaluation narrative, benchmark tables, six media exhibits, resource links, BibTeX, and all three long transcript disclosures. | The animated figure is WebM; disclosure components are semantic `details`; resources use the shared flat research treatment. |
| `diffusion-language-models` | `content/notes/dllm.md`, `/notes/dllm` | Full note text, mathematical argument, references, and the complete DLM image sequence. | Published in the unified `/blog` collection; math and images use the shared lazy MathJax/lightbox pipeline. The original note supplied no author list. |
| `digital-tide` | `content/notes/wake-up.md`, `/notes/wake-up` | Complete short-form prose and its original illustration. | Published in the unified `/blog` collection with the standard article header. The original note supplied no author list or tags. |
| `highres-visual-reasoning` | `content/posts/highres_visual_reasoning.mdx`, `/posts/highres_visual_reasoning` | Full MGPO explanation, all eleven figures, author ordering, links, acknowledgements, and citation. | The old resource card is a flat linked research section; figures use AVIF and the shared lightbox. |
| `llava-critic-r1` | `content/posts/llava_critic_r1.mdx`, `/posts/llava_critic_r1` | Complete paper summary, method/results sections, figure, authors, resources, acknowledgements, and citation. | Shared author metadata and resource-section styling replace the old MDX card chrome. |
| `llava-next-video` | `content/posts/llava_next_video.mdx`, `/posts/llava_next_video` | Complete LLaVA-Video narrative, both figures, links, author ordering, acknowledgements, and citation. | Local figures are optimized; resources and metadata use the standard flat presentation. |
| `llava-onevision-1-5-rl` | bespoke `llava-ov-1-5-rl.tsx`, `/posts/llava_onevision_1.5_rl` | The complete project hero, author block, results narrative, benchmark presentation, RL data distributions, resources, code/citation content, and media composition from the built reference page. | Captured as a native showcase instead of React. Page CSS is scoped and adapted to the common blue paper; copy behavior is restored by a local controller. |
| `llava-onevision-1-5` | bespoke `llava-ov-1-5.tsx`, `/posts/llava_onevision_1_5` | The complete project page, authors, figures, benchmarks, training recipe, resources, quick-start code, evaluation command, acknowledgements, and citation from the built reference page. | Native showcase capture with local AVIF/WebM assets and controller-based copy behavior; no nested React or duplicate site shell. |
| `llava-onevision-2` | bespoke `llava-ov-2.tsx`, `/posts/llava_onevision_2` | Full bilingual project page, built-in contents navigation, hero/resources, method diagrams, roadmap, four benchmark tables, training/data sections, code examples, task demos, citation, and references. All 48 benchmark disclosures include their original summaries, badges, examples, and available chart data. | Native showcase capture. The controller restores EN/中文 persistence, GitHub star refresh, two code tabs, copy actions, four demo carousels, and single-open benchmark details. The obsolete theme switch is hidden because the host is light-only. |
| `llava-onevision` | `content/posts/llava_onevision.mdx`, `/posts/llava_onevision` | Full project narrative, model/resource links, author order, figure, benchmark tables, acknowledgements, and citation. | Optimized local media, shared resource section, and standard metadata frame. |
| `lmms-eval` | `content/posts/lmms_eval.mdx`, `/posts/lmms_eval` | Complete evaluation argument, supported-model/task material, figure, installation and evaluation examples, resources, authors, acknowledgements, and citation. | `CodeDemo` titles are preserved as code-header labels; code, resources, and author information use the shared styles. |
| `longva` | `content/posts/longva.mdx`, `/posts/longva` | Complete long-context transfer explanation, model details, evaluation results, figure, authors, resources, acknowledgement, and BibTeX. | Optimized figure and shared flat metadata/resource presentation. |
| `longvt` | bespoke `longvt.tsx`, `/posts/longvt` | Full custom hero, author list, method story, five figures, benchmarks, resource links, and citation from the built reference page. | Native showcase capture. The former white project-page palette is mapped to the shared blue/cream light palette while layout and content remain intact. |
| `mmsearch-r1-improved` | `content/posts/mmsearch_r1_improved.mdx`, `/posts/mmsearch_r1_improved` | Complete improved-search narrative, all five figures, all four result tables, ablations, and three prompt templates. | Prompt-template titles are native code headers; the source did not provide structured author metadata, so none is invented. Legacy MDX table wrappers are unwrapped and dedented so the tables remain tables under CommonMark. |
| `mmsearch-r1` | `content/posts/mmsearch_r1.mdx`, `/posts/mmsearch_r1` | Complete method/reward discussion, seven figures, result tables, resources, author order, acknowledgements, and citation. | The display-only reward block has no copy control; other code/media/resources use shared renderers. |
| `multimodal-sae` | `content/posts/multimodal_sae.mdx`, `/posts/multimodal_sae` | Complete interpretability narrative, both figures, experiments, author order, resources, acknowledgements, and citation. | Local AVIF figures and shared author/resource styling. |
| `onevision-encoder` | `public/onevision-encoder/index.html`, `/onevision-encoder` | Exact hypothesis/method/evidence and exhibit copy, codec and uniform patch visualizations, the persistent pipeline caption and all seven cases, global-contrastive video, grouped LMM and 8/16-frame attentive tables, patch-efficiency explanation and footnotes, resource links, lab authorship, and BibTeX. | Kept as `index.html`, but only article body content enters Angular. Shared metadata removes duplicate author copy; resources use the flat research treatment. Patch grids and pipeline controls are scoped local components; remote document dependencies, duplicate navigation, and inline scripts are not retained. Source table groups are preserved with accessible shared markup and unchanged values. |
| `openmmreasoner` | `content/posts/openmmreasoner.mdx`, `/posts/openmmreasoner` | Complete recipe/data narrative, eleven figures, authors, resources, acknowledgement, and citation. | Optimized local figures and shared flat metadata/resource treatment. |
| `sae-made-easy` | `content/posts/sae_made_easy.mdx`, `/posts/sae_made_easy` | Complete API/tutorial content, both diagrams, four code examples, authors, resources, acknowledgements, and citation. | Code examples use the shared Shiki/copy frame; media and resources use standard presentation. |
| `videommmu` | `content/posts/videommmu.mdx`, `/posts/videommmu` | Complete benchmark motivation, construction, evaluation protocol, equations, all six research figures, the original Website/Paper/Dataset badge row, authors, resources, acknowledgements, and citation. | Display-only formulas remain copy-free code blocks; figures, tables, badges, and metadata use shared styles. |
| `sample-blog` | No legacy counterpart | Current authoring smoke test for Markdown, math, code, tables, local images, video/audio, and comments. | Intentionally retained as a system example rather than represented as a migrated legacy article. |

## Intentional cross-site differences

These differences are requirements of the consolidated Angular site and should
not be treated as lost article content:

1. Legacy underscore URLs remain compatibility routes, while canonical article
   URLs use `/blog/<kebab-case-slug>`.
2. The Angular top bar, footer, comments, scroll restoration, search, and print
   rules replace the old Next.js shell consistently.
3. Google Fonts, Tailwind CDN, Font Awesome CDN, inline scripts, iframe embeds,
   and the React runtime are not copied into post content.
4. Committed raster figures are served as AVIF where practical; animated GIFs
   become WebM. External research videos remain at their original HTTPS source.
5. Standard articles use one author/resource/card language. Showcase pages keep
   bespoke composition only where it carries project-specific meaning.

## Reproduction and review

The standard-content importer is `scripts/import-legacy-site.mjs`; the bespoke
project-page capture is `scripts/import-showcase-posts.mjs`. Run both against a
built checkout of the reference repository, then run:

```bash
pnpm generate:data
pnpm test
pnpm biome:check
pnpm build
```

Visual review covers desktop and mobile widths, long contents trees, media and
table overflow, code controls, all showcase interactions, comments, and print
output. Re-run that review whenever either importer or a shared post stylesheet
changes.

The completed migration was checked across all 20 legacy articles. Original
section labels are present in the Angular output; the only level change is the
OneVision 2 codec spotlight, which remains visible but is deliberately an `h4`
instead of a second page section. The OneVision Encoder keeps all 256 uniform
and 256 codec patch files while reusing sparse image nodes during animation. Its
unused 12,216-pixel source illustration is intentionally omitted because the
reference document never renders it; the displayed method figure remains local
and optimized.
Automated browser review covers 42 desktop/mobile route states with no document
overflow, verifies every attached local asset, and exercises all 48 OneVision 2
benchmark disclosures, code tabs, language switching, all three multi-slide
carousels (plus the single-slide demo group), the seven-case Encoder pipeline,
and migrated WebM autoplay.
