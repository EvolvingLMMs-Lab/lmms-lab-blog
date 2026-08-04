[Models](https://huggingface.co/collections/lmms-lab-encoder/onevision-encoder) ·
[Tech Report](https://arxiv.org/abs/2602.08683) ·
[Model Card](https://github.com/EvolvingLMMs-Lab/OneVision-Encoder/blob/main/docs/model_card.md) ·
[Data Card](https://github.com/EvolvingLMMs-Lab/OneVision-Encoder/blob/main/docs/data_card.md)

*LMMs Lab, Glint Lab, AIM for Health Lab, and MVP Lab*

## Introduction

**Hypothesis.** Artificial general intelligence is, at its core, a compression
problem. Effective compression demands resonance: deep learning scales best
when its architecture aligns with the fundamental structure of the data. These
are the fundamental principles. Yet, modern vision architectures have strayed
from these truths: visual signals are highly redundant, while discriminative
information, the *surprise*, is sparse. Current models process dense pixel grids
uniformly, wasting vast compute on static background rather than focusing on the
predictive residuals that define motion and meaning. We argue that to solve
visual understanding, we must align our architectures with the
information-theoretic principles of video, i.e., codecs.

**Method.** OneVision Encoder encodes video by compressing predictive visual
structure into semantic meaning. By adopting Codec Patchification, OneVision
Encoder abandons uniform computation to focus exclusively on the 3.1%-25% of
regions rich in signal entropy. To unify spatial and temporal reasoning under
irregular token layouts, OneVision Encoder employs a shared 3D RoPE and is
trained with a large-scale cluster discrimination objective over more than one
million semantic concepts, jointly capturing object permanence and motion
dynamics.

**Evidence.** The results validate our core hypothesis: efficiency and accuracy
are not a trade-off; they are positively correlated. By resolving the dichotomy
between dense grids and sparse semantics, OneVision Encoder redefines the
performance frontier. When integrated into large multimodal models, it
consistently outperforms strong vision backbones such as Qwen3-ViT and SigLIP2
across 16 image, video, and document understanding benchmarks, despite using
substantially fewer visual tokens and pretraining data. Notably, on video
understanding tasks, OneVision Encoder achieves an average improvement of 4.1%
over Qwen3-ViT. Under attentive probing, it achieves state-of-the-art
representation quality, with 17.1% and 8.1% Top-1 accuracy improvements over
SigLIP2 and DINOv3, respectively, on Diving48 under identical patch budgets.
These results demonstrate that codec-aligned, patch-level sparsity is not an
optimization trick, but a foundational principle for next-generation visual
generalists, positioning OneVision Encoder as a scalable engine for universal
multimodal intelligence.

![OneVision Encoder method overview.](./method.avif)

## Codec-Style Patch Selection

Traditional video understanding models process frames by uniform temporal
sampling, selecting evenly spaced frames regardless of content. This approach
treats all spatial regions equally, wasting computation on redundant background
pixels that remain static across frames.

Inspired by HEVC video compression, our **codec-style approach** identifies and
processes only the patches that carry meaningful temporal changes. Just as video
codecs encode motion vectors and residuals rather than full frames, we select
patches based on their information density, preserving the dynamic,
semantically rich regions while discarding redundant static content.

![Predictive video structure mapped into OneVision Encoder codec input.](./codec-structure.avif)

### Codec-Style Input

The reference frame contains all patches. Consecutive frames retain only salient
patches at their spatial positions. The result is **75%-98% fewer patches** while
retaining the information that matters.

<html-fragment src="./codec-visualization.html"></html-fragment>

### Traditional Frame Sampling

Traditional sampling selects a small number of frames and processes every patch
from each. Static backgrounds, repeated textures, and unchanging regions are
therefore processed multiple times even though they add no new information.

<html-fragment src="./uniform-visualization.html"></html-fragment>

## Video Processing Pipeline

The visualization below demonstrates four stages:

1. **Original Video:** a continuous 64-frame stream retaining the full temporal
   context.
2. **Uniform Frame Sampling:** the traditional approach selects 4-8 evenly
   spaced frames, which is simple but lossy and misses inter-frame motion.
3. **Temporal Saliency Detection:** all 64 frames are analyzed for motion,
   appearance changes, and semantic events.
4. **Codec-Style Patch Extraction:** salient patches are extracted in zigzag
   order, achieving 75%-98% compression while preserving temporal dynamics.

<video controls autoplay loop muted playsinline preload="metadata" aria-label="OneVision Encoder video processing pipeline">
  <source src="https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/onevision-encoder/images/case1.webm" type="video/webm">
  Your browser does not support WebM video.
</video>

The complete pipeline progresses from the original video to a codec-style
compressed representation, identifying temporally salient patches while
preserving rich motion information. Additional examples are available as
[Case 2](https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/onevision-encoder/images/case2.webm),
[Case 3](https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/onevision-encoder/images/case3.webm),
[Case 4](https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/onevision-encoder/images/case4.webm),
[Case 5](https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/onevision-encoder/images/case5.webm),
[Case 6](https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/onevision-encoder/images/case6.webm),
and [Case 7](https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/onevision-encoder/images/case7.webm).

## Global Contrastive Learning

Standard contrastive learning, such as CLIP, is limited by batch size: negative
samples are drawn only from the current batch, typically 32K-64K examples. This
creates a narrow view of the embedding space and leads to suboptimal
representations. Our approach maintains a **global concept bank of 2M clustered
centers**, enabling each training sample to contrast against a diverse,
representative set of negatives regardless of batch composition. This produces
more discriminative embeddings with better-separated semantic clusters.

<video controls autoplay loop muted playsinline preload="metadata" aria-label="Global contrastive learning comparison">
  <source src="https://wqrxkrduisy4rnf0.public.blob.vercel-storage.com/onevision-encoder/images/global_contrastive_comparison.webm" type="video/webm">
  Your browser does not support WebM video.
</video>

## Experimental Results

### LMM Probe Results

The following table compares vision encoders on multimodal benchmarks. All
models use Qwen3-4B-Instruct-2507 as the language backbone. OV-Encoder-Lang is
the language-aligned variant; Qwen3-ViT is extracted from Qwen3-VL-4B; and
SigLIP2 uses `siglip2-so400m-patch16-naflex`. **Codec** denotes codec-guided
visual encoding using motion vectors and residual signals, while **Frame**
denotes dense spatial patchification. Bold values are the best results under the
same evaluation setting.

| Task | Benchmark | OV-Encoder-Lang (Codec) | Qwen3-ViT (Frame) | OV-Encoder (Codec) | OV-Encoder-Frame (Frame) | SigLIP2 (Frame) |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Video | MVBench | **53.2** | 47.4 | **52.4** | 49.8 | 47.2 |
| Video | MLVU-dev | **47.4** | 47.2 | 46.3 | **49.4** | 48.4 |
| Video | NExT-QA (MC) | **76.1** | 70.1 | **75.6** | 71.9 | 70.6 |
| Video | VideoMME | **54.1** | 47.2 | **53.4** | 49.3 | 46.8 |
| Video | Perception Test | **60.6** | 57.1 | **60.3** | 56.7 | 56.0 |
| Video | TOMATO | 21.8 | **22.2** | 22.2 | 21.8 | **22.3** |
| Video | LongVideoBench-Val-Video | **51.6** | 45.0 | **50.4** | 45.5 | 45.2 |
| Image | AI2D | **80.2** | 77.8 | 75.7 | 76.5 | **78.6** |
| Image | ChartQA | **80.1** | 79.6 | 76.5 | **77.8** | 76.4 |
| Image | DocVQA | 83.2 | **85.1** | 78.4 | **79.5** | 75.0 |
| Image | InfoVQA | **51.6** | 49.0 | 43.1 | **45.5** | 42.0 |
| Image | MMBench-EN | **80.2** | 79.4 | 77.2 | 78.5 | **79.6** |
| Image | OCRBench | 657 | **706** | 605 | **630** | 621 |
| Image | OCRBench v2 | **30.8** | 30.6 | **26.3** | 26.1 | 26.1 |
| Image | MMStar | **56.6** | **56.6** | 52.1 | 54.3 | **55.0** |
| Image | RealWorldQA | **66.1** | 63.3 | 60.8 | 61.2 | **62.1** |

Results in the first pair of model columns use caption supervision; results in
the remaining encoder columns do not.

### Attentive Probe Results

Models are evaluated with a single clip and trained for 10 epochs across eight
action-recognition datasets. OV-Encoder (Codec) replaces traditional frame
sampling with codec-guided patch reorganization without changing the backbone
architecture or training protocol. Under the same token budget, this improves
motion-sensitive datasets such as Diving48 and Perception Test.

#### 8 Frames

| Method | Arch. | Res. | AVG | SSV2 | Diving48 | Perce. Test | CharEgo | Epic Verb | Epic Noun | K400 | HMDB51 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| MetaCLIP2 | ViT-L/14 | 224 | 50.2 | 47.2 | 48.0 | 47.7 | 11.0 | 48.0 | 40.9 | 82.4 | 76.3 |
| AIMv2 | ViT-L/14 | 224 | 53.8 | 55.1 | 43.6 | 55.1 | 12.0 | 56.6 | 45.6 | 81.1 | 81.3 |
| DINOv3 | ViT-L/14 | 224 | 58.0 | 57.4 | 58.6 | 59.3 | **13.2** | **62.5** | 51.7 | 82.9 | 78.6 |
| SigLIP2 | ViT-L/16 | 256 | 53.1 | 52.6 | 50.1 | 52.7 | 11.6 | 54.2 | 43.8 | 80.9 | 79.1 |
| OV-Encoder (Frame) | ViT-L/14 | 224 | 58.4 | 57.7 | 57.6 | 58.3 | 12.1 | 61.4 | 52.5 | 84.3 | 83.1 |
| OV-Encoder (Codec) | ViT-L/14 | 224 | **60.2** | **58.5** | **67.2** | **60.0** | 12.3 | 62.3 | **53.9** | **84.4** | **83.4** |

#### 16 Frames

| Method | Arch. | Res. | AVG | SSV2 | Diving48 | Perce. Test | CharEgo | Epic Verb | Epic Noun | K400 | HMDB51 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| MetaCLIP2 | ViT-L/14 | 224 | 51.0 | 49.3 | 42.1 | 51.1 | 11.2 | 49.2 | 43.2 | 84.0 | 78.2 |
| AIMv2 | ViT-L/14 | 224 | 56.4 | 57.2 | 55.7 | 56.4 | 12.4 | 58.3 | 46.2 | 82.2 | 82.6 |
| DINOv3 | ViT-L/14 | 224 | 59.1 | 58.3 | 61.3 | 60.8 | **14.0** | 63.2 | 51.9 | 83.9 | 79.7 |
| SigLIP2 | ViT-L/16 | 256 | 55.7 | 58.2 | 56.7 | 53.3 | 11.9 | 56.4 | 45.2 | 82.7 | 81.2 |
| OV-Encoder (Frame) | ViT-L/14 | 224 | 59.9 | 58.7 | 63.2 | 60.3 | 12.6 | 62.9 | **54.5** | 85.1 | 81.6 |
| OV-Encoder (Codec) | ViT-L/14 | 224 | **61.5** | **60.1** | **69.4** | **60.9** | 12.9 | **63.3** | 54.4 | **85.4** | **85.3** |

### Patch-Efficient Video Understanding Comparison

This comparison fixes the source video at 64 frames, or 16,384 patches.
SigLIP2 uses traditional frame sampling, where every 256-patch group is a
contiguous RGB frame. OneVision Encoder instead uses codec-native motion vectors
and residuals to distribute a fixed patch budget across the entire temporal
extent without temporal downsampling.

| Dataset | Model | 512 Patches | 1024 Patches | 2048 Patches | 4096 Patches |
| --- | --- | ---: | ---: | ---: | ---: |
| Diving48 | SigLIP2 (ViT-L/16, 256px), traditional frame sampling | 28.1 | 48.7 | 50.1 | 56.7 |
| Diving48 | OV-Encoder (Codec), ViT-L/14, 224px | **46.5**<br>96.9% ↓ | **54.9**<br>93.8% ↓ | **67.2**<br>87.5% ↓ | **69.4**<br>75.0% ↓ |
| Perception Test | SigLIP2 (ViT-L/16, 256px), traditional frame sampling | 38.7 | 50.1 | 52.7 | 53.3 |
| Perception Test | OV-Encoder (Codec), ViT-L/14, 224px | **50.5**<br>96.9% ↓ | **58.6**<br>93.8% ↓ | **60.0**<br>87.5% ↓ | **60.9**<br>75.0% ↓ |

Percentages indicate patch reduction relative to dense processing of all 16,384
patches. Under a fixed token budget, codec-style selection redistributes patches
across time while retaining spatial positions. It outperforms SigLIP2 on
Diving48 and Perception Test while reducing patch processing by 75.0%-96.9%.

## BibTeX

```bibtex
@article{onevision_encoder_2026,
  title={OneVision Encoder},
  author={LMMs Lab, Glint Lab, AIM for Health Lab, MVP Lab},
  journal={arXiv preprint},
  year={2026}
}
```

If you find this work useful, please consider citing the paper.
