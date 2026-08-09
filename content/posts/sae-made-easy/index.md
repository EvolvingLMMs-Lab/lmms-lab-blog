---
title: "SAE Made Easy: Simplified Sparse Autoencoder Integration"
date: "2025-07-12"
description: "A framework that allows you to apply Sparse AutoEncoder on any models - inspired by PEFT design for seamless integration"
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
  - "tools"
  - "multimodal"
---
<figure>
<img src="./remote-media/59bf4ef7-e14c-4464-be3a-ba6fbf16ae48-884313e3.avif" alt="SAE Made Easy Framework Overview" loading="lazy" decoding="async">
<figcaption>SAE Made Easy: A comprehensive framework for integrating Sparse Autoencoders into any neural network model</figcaption>
</figure>


## Overview

**SAE Made Easy** is inspired by a wealth of **Sparse Autoencoder (SAE)** work from Anthropic, OpenAI, Google, and the open-source community. SAE has become a **powerful and widely-used tool** in the field of explainable AI.

This project aims to provide a **simple and flexible interface** that allows users to inject SAE modules into their models at any layer with minimal effort. We adopt the elegant design of Hugging Face's **`peft`** and regard SAE training as a kind of parameter efficient tuning - as long as the target is an `nn.Module`, SAE can be easily integrated and trained with only a few lines of code.

## 🎯 Design Philosophy

The code design takes inspiration from **PEFT**, as we believe SAE shares many structural similarities with PEFT-based methods. By inheriting from a `BaseTuner` class, we enable **seamless SAE integration** into existing models.

### Simple Integration Example

With this design, injecting an SAE module is as simple as:


```python
import torch
import torch.nn as nn
from peft import inject_adapter_in_model

from sae import TopKSaeConfig, get_peft_sae_model, PeftSaeModel

class DummyModel(nn.Module):
    def __init__(self):
        super(DummyModel, self).__init__()
        self.linear = nn.Linear(10, 10)

    def forward(self, x):
        return self.linear(x)

model = DummyModel()
config = TopKSaeConfig(k=1, num_latents=5, target_modules=["linear"])

# Inject the adapter into the model
model = inject_adapter_in_model(config, model)

# Check if the adapter was injected correctly
result = model(torch.randn(1, 512, 10))
```


### PEFT-Style Workflow

You can also obtain a PEFT-wrapped model using the magic function from the PEFT library. **The rest of your workflow remains the same:**


```python
# Get the PEFT model
peft_model = get_peft_sae_model(model, config)

result = peft_model(torch.randn(1, 512, 10))
```


### Model Persistence

Loading and saving is similar to `PeftModel`:


```python
peft_model.save_pretrained("test_save_peft_model")

model = DummyModel()
peft_model = PeftSaeModel.from_pretrained(
    model,
    "test_save_peft_model",
    adapter_name="default",
    low_cpu_mem_usage=True,
)
```


## 📊 Data Processing

To ensure consistency in data formatting, we recommend first processing your data and storing it in **Parquet format**. This standardization simplifies interface development and data preparation.

### Preprocessing Pipeline

You are free to customize the preprocessing logic and define keys for different modalities. However, the final output should be compatible with:

- **Chat templates**
- **Our preprocessing pipeline**

#### Example Usage

An example preprocessing script is available at `examples/data_process/llava_ov_clevr.py`:


```bash
python examples/data_process/llava_ov_clevr.py \
    --push_to_hub \
    --hf_repo_path lmms-lab/LLaVA-OneVision-Data \
    --subset "CLEVR-Math(MathV360K)" \
    --split train \
    --target_hf_repo_path lmms-lab/LLaVA-OneVision-Data-SAE
```


## 🚀 Training

Our trainer implementation builds on top of existing frameworks and supports the following **enterprise-grade features:**

- **ZeRO-1/2/3 training** - Efficient memory usage for large models
- **Weights & Biases (WandB) logging** - Comprehensive experiment tracking

### Scalability

With **ZeRO optimizations**, you can train SAEs on **72B models** using just **8×A800 GPUs** - making large-scale SAE research accessible to more teams.

### Quick Start Examples

We provide simple training recipes to help you get started quickly:

#### Large-Scale Training

- **ZeRO-3, 72B training**: `examples/train/zero/run_qwen25_vl_72b_zero3.sh`

#### Medium-Scale Training

- **ZeRO-2, 7B training**: `examples/train/zero/run_qwen25_vl_7b_zero2.sh`

#### Standard Training

- **DDP, 7B training**: `examples/train/ddp/run_qwen25_vl_7b_ddp.sh`

### Training Monitoring


<figure>
<img src="./remote-media/2e092402-fcfb-4002-badb-55e135cd56b1-83c479c8.avif" alt="Training Logs and Metrics" loading="lazy" decoding="async">
<figcaption>Reproducible training logs showing SAE training progress with comprehensive metrics tracking</figcaption>
</figure>


Our framework provides **comprehensive logging** for reproducible research and easy debugging.

## 🏗️ Framework Features

### ✨ **PEFT-Inspired Design**

- Seamless integration with existing models
- Minimal code changes required
- Compatible with Hugging Face ecosystem

### 🔧 **Flexible Configuration**

- Support for various SAE architectures
- Configurable sparsity levels and latent dimensions
- Target any model layer with precision

### 📈 **Scalable Training**

- ZeRO optimization support for large models
- Distributed training capabilities
- Memory-efficient implementations

### 🔍 **Research-Ready**

- Built-in experiment tracking
- Reproducible training pipelines
- Comprehensive logging and metrics

## 🎓 Research Applications

### Mechanistic Interpretability

- **Feature Discovery** - Identify interpretable features in neural networks
- **Activation Analysis** - Study how models process information
- **Behavioral Understanding** - Understand model decision-making

### Model Analysis

- **Sparse Representation** - Learn compressed, interpretable representations
- **Feature Steering** - Control model behavior through feature manipulation
- **Safety Research** - Understand and mitigate potential risks

## 📚 Related Work and Citation

If you find this repository useful, please consider checking out our [previous paper](https://arxiv.org/pdf/2411.14982) on applying Sparse Autoencoders (SAE) to Large Multimodal Models, **accepted at ICCV 2025**.

## 🌟 Key Benefits

### **Ease of Use**

Transform complex SAE integration into a few lines of code with our PEFT-inspired design.

### **Scalability**

Train on models ranging from 7B to 72B parameters with optimized memory usage.

### **Flexibility**

Apply SAEs to any neural network layer with configurable parameters and architectures.

### **Research Impact**

Accelerate mechanistic interpretability research with production-ready tools and frameworks.

## 🚀 Getting Started

1. **Install** the framework following our documentation
2. **Prepare** your data using our preprocessing pipeline
3. **Configure** SAE parameters for your specific use case
4. **Train** using our optimized training scripts
5. **Analyze** learned features for interpretability insights

**SAE Made Easy** democratizes access to sparse autoencoder research, enabling researchers and practitioners to easily integrate interpretability tools into their workflows.


<section class="research-resource-card">
  <header class="research-resource-header">
    <p class="research-block-kicker">Open research</p>
    <h3>Open Source Resources</h3>
    <p>Comprehensive resources for the research community to reproduce and extend our multimodal SAE work</p>
  </header>
  <section class="research-resource-links"><a class="research-resource-link" data-resource-type="github" href="https://github.com/EvolvingLMMs-Lab/sae" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[Code]</span>
  <span class="research-resource-name">GitHub Repository</span>
  <span class="research-resource-description">Complete implementation and code</span>
</a>
<a class="research-resource-link" data-resource-type="link" href="https://github.com/EvolvingLMMs-Lab/sae/tree/main/examples" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[Link]</span>
  <span class="research-resource-name">Training Scripts</span>
  <span class="research-resource-description">SAE training and integration pipelines</span>
</a>
<a class="research-resource-link" data-resource-type="link" href="https://github.com/EvolvingLMMs-Lab/multimodal-sae" target="_blank" rel="noopener noreferrer">
  <span class="research-resource-type">[Link]</span>
  <span class="research-resource-name">Interpretation Tools</span>
  <span class="research-resource-description">Auto-explanation pipeline implementation</span>
</a></section>
</section>

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
