---
title: "Multimodal-SAE: Interpreting Features in Large Multimodal Models"
date: "2024-11-15"
description: "Large Multi-modal Models Can Interpret Features in Large Multi-modal Models - First demonstration of SAE feature interpretation in the multimodal domain"
authors:
  - name: "Kaichen Zhang"
    main: true
  - name: "Yifei Shen"
    main: true
  - name: "Bo Li"
    url: "https://brianboli.com/"
  - name: "Ziwei Liu"
    url: "https://liuziwei7.github.io/"
tags:
  - "research"
  - "multimodal"
---
<figure>
<img src="./remote-media/banner-f0d42a01.avif" alt="Multimodal-SAE Banner" loading="lazy" decoding="async">
<figcaption>Multimodal-SAE: First demonstration of SAE-based feature interpretation in Large Multimodal Models</figcaption>
</figure>


## Overview

For the **first time in the multimodal domain**, we demonstrate that features learned by **Sparse Autoencoders (SAEs)** in a smaller Large Multimodal Model (LMM) can be effectively interpreted by a larger LMM. Our work introduces the use of SAEs to analyze the open-semantic features of LMMs, providing a breakthrough solution for feature interpretation across various model scales.

## Inspiration and Motivation

This research is inspired by **Anthropic's remarkable work** on applying SAEs to interpret features in large-scale language models. In multimodal models, we discovered intriguing features that:

- **Correlate with diverse semantics** across visual and textual modalities
- **Can be leveraged to steer model behavior** for precise control
- **Enable deeper understanding** of LMM functionality and decision-making

## Technical Approach

### SAE Training Pipeline

The **Sparse Autoencoder (SAE)** is trained using a targeted approach:

1. **Integration Strategy** - SAE integrated into a specific layer of the model
2. **Frozen Architecture** - All other model components remain frozen during training
3. **Training Data** - Utilizes LLaVA-NeXT dataset for comprehensive multimodal coverage
4. **Feature Learning** - Learns sparse, interpretable representations of multimodal features

### Auto-Explanation Pipeline

Our novel **auto-explanation pipeline** analyzes visual features through:

- **Activation Region Analysis** - Identifies where features activate in visual inputs
- **Semantic Correlation** - Maps features to interpretable semantic concepts
- **Cross-Modal Understanding** - Leverages larger LMMs for feature interpretation
- **Automated Processing** - Scalable interpretation without manual annotation

## Feature Steering and Control


<figure>
<img src="./remote-media/steer-8716ec0a.avif" alt="Feature Steering Demonstration" loading="lazy" decoding="async">
<figcaption>Demonstration of feature steering: These learned features can be used to control model behavior and generate desired outputs</figcaption>
</figure>


### Behavioral Control Capabilities

The learned features enable **precise model steering** by:

- **Selective Feature Activation** - Amplifying specific semantic features
- **Behavioral Modification** - Directing model attention and responses
- **Interpretable Control** - Understanding why specific outputs are generated
- **Fine-Grained Manipulation** - Precise control over model behavior

## Key Contributions

### 🔬 **First Multimodal SAE Implementation**

Pioneering application of SAE methodology to multimodal models, opening new research directions in mechanistic interpretability.

### 🎯 **Cross-Scale Feature Interpretation**

Demonstration that smaller LMMs can learn features interpretable by larger models, enabling scalable analysis approaches.

### 🎮 **Model Steering Capabilities**

Practical application of learned features for controllable model behavior and output generation.

### 🔄 **Auto-Explanation Pipeline**

Automated methodology for interpreting visual features without requiring manual semantic labeling.

## Research Impact

### Mechanistic Interpretability Advancement

This work represents a significant advancement in understanding how multimodal models process and integrate information across modalities.

### Practical Applications

- **Model Debugging** - Understanding failure modes and biases
- **Controllable Generation** - Steering model outputs for specific applications
- **Safety and Alignment** - Better control over model behavior
- **Feature Analysis** - Deep understanding of learned representations

### Future Directions

Our methodology opens new research avenues in:

1. **Cross-Modal Feature Analysis** - Understanding feature interactions across modalities
2. **Scalable Interpretability** - Extending to larger and more complex models
3. **Real-Time Steering** - Dynamic control during inference
4. **Safety Applications** - Preventing harmful or biased outputs

## Technical Details

### Architecture Integration

The SAE is carefully integrated to:

- **Preserve Model Performance** - Minimal impact on original capabilities
- **Capture Rich Features** - Learn meaningful sparse representations
- **Enable Interpretation** - Facilitate analysis by larger models
- **Support Steering** - Allow runtime behavioral modification

### Evaluation Methodology

Our approach is validated through:

- **Feature Interpretability** - Qualitative analysis of learned features
- **Steering Effectiveness** - Quantitative measurement of behavioral control
- **Cross-Model Validation** - Testing interpretation across different model sizes
- **Semantic Consistency** - Verifying feature stability and meaning


<section class="research-resource-card">
  <header class="research-resource-header">
    <p class="research-block-kicker">Open research</p>
    <h3>Open Source Resources</h3>
    <p>Comprehensive resources for the research community to reproduce and extend our multimodal SAE work</p>
  </header>
  <section class="research-resource-links"><a class="research-resource-link" data-resource-type="github" href="https://github.com/EvolvingLMMs-Lab/multimodal-sae" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[Code]</span>
  <span class="research-resource-name">GitHub Repository</span>
  <span class="research-resource-description">Complete implementation and code</span>
</a>
<a class="research-resource-link" data-resource-type="link" href="https://github.com/EvolvingLMMs-Lab/multimodal-sae" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[Link]</span>
  <span class="research-resource-name">Training Scripts</span>
  <span class="research-resource-description">SAE training and integration pipelines</span>
</a>
<a class="research-resource-link" data-resource-type="link" href="https://github.com/EvolvingLMMs-Lab/multimodal-sae" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[Link]</span>
  <span class="research-resource-name">Interpretation Tools</span>
  <span class="research-resource-description">Auto-explanation pipeline implementation</span>
</a>
<a class="research-resource-link" data-resource-type="link" href="https://github.com/EvolvingLMMs-Lab/multimodal-sae" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[Link]</span>
  <span class="research-resource-name">Documentation</span>
  <span class="research-resource-description">Detailed guides for reproduction and extension</span>
</a></section>
</section>


## Conclusion

**Multimodal-SAE** represents a breakthrough in multimodal mechanistic interpretability, providing the first successful demonstration of SAE-based feature interpretation in the multimodal domain. Our work enables:

- **Deeper Understanding** of how LMMs process multimodal information
- **Practical Control** over model behavior through feature steering
- **Scalable Interpretation** methods for increasingly complex models
- **Foundation Research** for future advances in multimodal AI safety and control

This research establishes a new paradigm for understanding and controlling Large Multimodal Models, with significant implications for AI safety, controllability, and interpretability research.

## BibTeX

```bibtex
@misc{zhang2024largemultimodalmodelsinterpret,
      title={Large Multi-modal Models Can Interpret Features in Large Multi-modal Models},
      author={Kaichen Zhang and Yifei Shen and Bo Li and Ziwei Liu},
      year={2024},
      eprint={2411.14982},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2411.14982}
}
```
