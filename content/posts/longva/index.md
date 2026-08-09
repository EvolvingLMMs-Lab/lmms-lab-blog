---
title: "LongVA: Long Context Transfer from Language to Vision"
date: "2024-06-24"
description: "Long Context Transfer from Language to Vision - An innovative solution towards long video LMM, leveraging long context capabilities of language models"
authors:
  - name: "Peiyuan Zhang"
    main: true
  - name: "Kaichen Zhang"
    main: true
  - name: "Bo Li"
    url: "https://brianboli.com/"
  - name: "Guangtao Zeng"
  - name: "Jingkang Yang"
  - name: "Yuanhan Zhang"
  - name: "Ziyue Wang"
  - name: "Haoran Tan"
  - name: "Chunyuan Li"
  - name: "Ziwei Liu"
    url: "https://liuziwei7.github.io/"
tags:
  - "models"
  - "multimodal"
---
<figure>
<img src="./remote-media/heatmap-00d6ad28.avif" alt="LongVA Visual Needle-in-a-Haystack Heatmap" loading="lazy" decoding="async">
<figcaption>LongVA</figcaption>
</figure>


## Overview

**Gemini** has amazed the world with its capability to understand hour-long videos. However, we still lack an open-source alternative with similar capabilities. Our latest research presents an innovative solution towards long video LMM, shifting the focus from reducing visual tokens per frame to leveraging the long context capabilities of language models.

Here, we present our **state-of-the-art video model, Long Video Assistant (LongVA)**, and our novel benchmark, **Visual Needle-In-A-Haystack (V-NIAH)**.

## Key Innovations

### 🔄 Long Context Transfer

We discovered and verified that the **long context capability of language models can be directly transferred to the video domain** in modality-aligned multi-modal models. On V-NIAH, LongVA is the **only open-source model** capable of accurately retrieving visual information from inputs with:

- **2000+ frames**
- **200K+ visual tokens**

### 🎯 UniRes: Unified Visual Encoding

We proposed **UniRes**, a unified visual encoding scheme that encodes both images and videos. In UniRes, a video is encoded the same as multiple image crops in a sequence.

**Key Benefits:**

- Leverages the Long Context Transfer property
- Enables superior zero-shot performance in video tasks
- **No video-specific training data required**

## Performance Highlights

### 🏆 State-of-the-Art Results

LongVA achieves **state-of-the-art performance** on the comprehensive **Video-MME benchmarks** among 7B models.

**Key Performance Features:**

- Performance increases with denser sampling of video frames
- Superior zero-shot capabilities on video understanding tasks
- Comprehensive ablation studies validating improvement sources

### 📊 V-NIAH Benchmark

Our novel **Visual Needle-In-A-Haystack (V-NIAH)** benchmark provides:

- Rigorous evaluation of long-context visual understanding
- Testing retrieval accuracy across extended video sequences
- Open-source evaluation framework for the community

## Technical Architecture

### Multi-Modal Alignment

LongVA demonstrates that language models' inherent long-context capabilities can be effectively transferred to visual domains through proper modality alignment.

### Scalable Design

The architecture scales efficiently with:

- Increased frame sampling rates
- Extended sequence lengths
- Larger visual token counts

## Research Impact

### Open-Source Alternative

LongVA provides the first viable open-source alternative to proprietary long-video understanding systems, enabling:

- Academic research advancement
- Commercial application development
- Community-driven improvements

### Methodology Innovation

The long context transfer approach opens new research directions in:

- Cross-modal capability transfer
- Efficient video processing
- Unified multi-modal architectures

## Future Directions

LongVA establishes a foundation for:

1. **Extended Context Models** - Pushing beyond current frame limits
2. **Multi-Modal Transfer Learning** - Applying insights to other modalities
3. **Efficient Video Processing** - Optimizing computational requirements
4. **Benchmark Development** - Creating more comprehensive evaluation metrics


<section class="research-resource-card">
  <header class="research-resource-header">
    <p class="research-block-kicker">Open research</p>
    <h3>LongVA Resources</h3>
    <p>Complete resources for LongVA including source code, evaluation benchmark, and pre-trained models</p>
  </header>
  <section class="research-resource-links"><a class="research-resource-link" data-resource-type="github" href="https://github.com/EvolvingLMMs-Lab/LongVA" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[Code]</span>
  <span class="research-resource-name">GitHub Repository</span>
  <span class="research-resource-description">Source code and implementation</span>
</a>
<a class="research-resource-link" data-resource-type="link" href="https://github.com/EvolvingLMMs-Lab/LongVA" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[Link]</span>
  <span class="research-resource-name">V-NIAH Benchmark</span>
  <span class="research-resource-description">Evaluation framework</span>
</a>
<a class="research-resource-link" data-resource-type="model" href="https://github.com/EvolvingLMMs-Lab/LongVA" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[Model]</span>
  <span class="research-resource-name">Model Checkpoints</span>
  <span class="research-resource-description">Pre-trained models for research and development</span>
</a></section>
</section>

## Acknowledgements

This work presents an innovative approach to long video understanding by leveraging language model capabilities, developed by the Evolving LMMs Lab and collaborating institutions.

## BibTeX

```bibtex
@article{zhang2024longva,
  title={LongVA: Long Context Transfer from Language to Vision},
  author={Zhang, Peiyuan and Zhang, Kaichen and Li, Bo and Zeng, Guangtao and Yang, Jingkang and Zhang, Yuanhan and Wang, Ziyue and Tan, Haoran and Li, Chunyuan and Liu, Ziwei},
  journal={arXiv preprint arXiv:2406.16852},
  year={2024}
}
```
