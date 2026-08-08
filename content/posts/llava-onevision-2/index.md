---
title: "LLaVA-OneVision-2: Towards Next-Generation Perceptual Intelligence"
date: "2026-04-20"
description: "The next generation of fully-open multimodal training — pushing the boundary of recipe transparency, native-resolution understanding, and end-to-end reproducibility."
---
**Authors:** LLaVA-OneVision-2 Contributors

[Code](https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2) · [Models](https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct) · [Training data](https://huggingface.co/datasets/mvp-lab/LLaVA-OneVision-2-Data) · [Online demo](https://huggingface.co/collections/mvp-lab/llava-onevision-2)

## Overview

LLaVA-OneVision-2 is a fully open recipe for training competitive 8B-class
vision-language models. Every stage, dataset, checkpoint, and evaluation path
is released for reproducibility.

The release focuses on three capabilities:

1. **Long-video understanding.** A four-stage curriculum extends video
   comprehension from 30-second clips to 15-minute footage.
2. **Codec-based input.** Dense codec-selected evidence preserves motion-rich
   temporal information that uniform frame sampling can miss.
3. **A fully open pipeline.** Code, training data, evaluation tools, and model
   checkpoints are published without gated artifacts.

<video controls loop muted playsinline preload="metadata" aria-label="Uniform frames and codec-selected evidence on a jump-rope video">
  <source src="https://cdn.jsdelivr.net/gh/anxiangsir/ov2_asset@main/demo/codec/codec-frame-jumprope-sample-01.webm" type="video/webm">
</video>

*The same jump-rope clip rendered with uniform frames and codec-selected temporal evidence.*

## Roadmap

<figure>
<img src="./legacy/posts/llava_onevision_2/roadmap.avif" alt="LLaVA-OneVision-2 roadmap" loading="lazy" decoding="async">
<figcaption>Evolution from frame sampling and token compression to codec-aligned perceptual intelligence.</figcaption>
</figure>

## Video Caption Dataset

The length-stratified video-caption corpus spans 30 seconds to 15 minutes and
contains roughly 8 million captioned clips, 95.1 billion image tokens, and 9.9
billion caption tokens.

| Bucket | Samples | Storage | Image tokens | Caption tokens |
| --- | ---: | ---: | ---: | ---: |
| 30s caption | 4.2M | 29 TB | 24.7B | 3.0B |
| 30–60s caption | 2.7M | 32 TB | 31.8B | 2.3B |
| 60–180s caption | 700K | 13 TB | 12.3B | 0.7B |
| 10–15min caption | 350K | 65 TB | 26.3B | 4.0B |
| **Total** | **~8M** | **~139 TB** | **95.1B** | **9.9B** |

## Training Pipeline

### Stage 1 — Video Bootstrap

Bootstrap from LLaVA-OneVision-1.5 with 85M concept-balanced image-text pairs
and 4.2M short video captions.

### Stage 2 — Instruction Tuning

Combine large-scale multimodal instruction data with captions covering
30-second to 3-minute clips.

### Stage 3 — Long-Video Understanding

Add established video-instruction corpora and 350K captions for 10–15 minute
videos at 384 frames.

### Stage 4 — Codec, Spatial, and Tracking Supervision

Adopt the improved codec, densify long-video sampling to 768 frames, and add
spatial understanding plus video tracking supervision.

## Visual Encoder

<figure>
<img src="./legacy/posts/llava_onevision_2/arch.avif" alt="OneVision-Encoder architecture overview" loading="lazy" decoding="async">
<figcaption>OneVision-Encoder pretraining for high-density documents and frame-rich video.</figcaption>
</figure>

## Open-Source Resources

- [Training code and evaluation harness](https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2)
- [LLaVA-OneVision-2-8B-Instruct checkpoint](https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct)
- [Training dataset collection](https://huggingface.co/datasets/mvp-lab/LLaVA-OneVision-2-Data)
- [Interactive demo collection](https://huggingface.co/collections/mvp-lab/llava-onevision-2)

## Acknowledgements

Lmms-Lab · Glint-Lab · AIM for Health Lab · MVP-Lab. We thank the open-source community and all contributors for their valuable feedback and support.

## BibTeX

```bibtex
@article{llava_onevision_2_2026,
  title   = {LLaVA-OneVision-2: Open Multimodal Training at Scale},
  author  = {LLaVA-OneVision-2 Contributors},
  journal = {arXiv preprint arXiv:TBD},
  year    = {2026}
}
```
