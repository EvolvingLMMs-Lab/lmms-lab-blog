---
title: "LMMs-Eval"
date: "2024-07-17"
description: "Reality Check on the Evaluation of Large Multimodal Models"
---
**Authors:** Kaichen Zhang · [Bo Li](https://brianboli.com/) · Peiyuan Zhang · Fanyi Pu · Joshua Adrian Cahyono · Kairui Hu · Shuai Liu · Yuanhan Zhang · Jingkang Yang · Chunyuan Li · [Ziwei Liu](https://liuziwei7.github.io/)

<figure>
<img src="./remote-media/68747470733a2f2f692e706f7374696d672e63632f4b766b4c7a6246392f5758-7c41ec81.avif" alt="LMMs-Eval Banner" loading="lazy" decoding="async">
<figcaption>LMMs-Eval: A comprehensive evaluation framework for Large Multimodal Models</figcaption>
</figure>


[Paper](https://arxiv.org/abs/2407.12772) | [GitHub](https://github.com/EvolvingLMMs-Lab/lmms-eval) | [Documentation](https://github.com/EvolvingLMMs-Lab/lmms-eval/tree/main/docs) | [Discord](https://discord.gg/zdkwKUqrPy)


## Why LMMs-Eval?

We're on an exciting journey toward creating Artificial General Intelligence (AGI), much like the enthusiasm of the 1960s moon landing. This journey is powered by advanced large language models (LLMs) and large multimodal models (LMMs), which are complex systems capable of understanding, learning, and performing a wide variety of human tasks.

To gauge how advanced these models are, we use a variety of evaluation benchmarks. These benchmarks are tools that help us understand the capabilities of these models, showing us how close we are to achieving AGI. However, finding and using these benchmarks is a big challenge. The necessary benchmarks and datasets are spread out and hidden in various places like Google Drive, Dropbox, and different school and research lab websites. It feels like we're on a treasure hunt, but the maps are scattered everywhere.

In the field of language models, there has been a valuable precedent set by the work of [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness). They offer integrated data and model interfaces, enabling rapid evaluation of language models and serving as the backend support framework for the open-llm-leaderboard, and has gradually become the underlying ecosystem of the era of foundation models.

We humbly absorbed the exquisite and efficient design of lm-evaluation-harness and introduce [lmms-eval](https://github.com/EvolvingLMMs-Lab/lmms-eval), an evaluation framework meticulously crafted for consistent and efficient evaluation of LMM. For more details, please refer to our [paper](https://arxiv.org/abs/2407.12772).

## Key Features

- **Multi-modality support**: Text, image, video, and audio evaluations
- **100+ supported tasks** across different modalities
- **30+ supported models** including vision-language and audio models
- **Response caching** and accelerated inference options (vLLM, SGLang, tensor parallelism)
- **OpenAI-compatible API support** for diverse model architectures
- **Reproducible results** with version-controlled environments using `uv`

## Supported Models

LMMs-Eval supports a wide range of models including:

- **LLaVA series**: LLaVA-1.5, LLaVA-OneVision, LLaVA-OneVision 1.5
- **Qwen series**: Qwen2-VL, Qwen2.5-VL
- **Commercial APIs**: GPT-4o, GPT-4o Audio Preview, Gemini 1.5 Pro
- **Audio models**: Aero-1-Audio, Gemini Audio
- **Other open models**: InternVL-2, VILA, LongVA, LLaMA-3.2-Vision

## Supported Benchmarks

### Vision
MME, COCO, VQAv2, TextVQA, GQA, MMVP, ChartQA, DocVQA, OCRVQA, LLaVA-Bench, MMMU, MathVista

### Video
EgoSchema, PerceptionTest, VideoMME, MVBench, LongVideoBench, TemporalBench, VideoMathQA

### Audio
AIR-Bench, Clotho-AQA, LibriSpeech, VoiceBench, WenetSpeech

### Reasoning
CSBench, SciBench, MedQA, SuperGPQA, PhyX

## Installation


**Installation with uv (Recommended)**


```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
git clone https://github.com/EvolvingLMMs-Lab/lmms-eval
cd lmms-eval
uv pip install -e ".[all]"
```


## Usage


**Basic Evaluation**


```bash
# Evaluate LLaVA-OneVision on multiple benchmarks
accelerate launch --num_processes=8 -m lmms_eval \
  --model=llava_onevision \
  --model_args=pretrained=lmms-lab/llava-onevision-qwen2-7b-ov \
  --tasks=mmmu_val,mmbench_en,mathvista_testmini \
  --batch_size=1

# See all options
python -m lmms_eval --help
```


## Latest Release (v0.5)

The October 2025 release features:
- Comprehensive audio evaluation expansion
- Response caching capabilities
- 5 new models (GPT-4o Audio Preview, Gemma-3, LongViLA-R1, LLaVA-OneVision 1.5)
- 50+ new benchmark variants
- Enhanced reproducibility tools

## Community

With **3.4k+ stars**, **460+ forks**, and **157+ contributors**, LMMs-Eval has become the standard evaluation framework for multimodal models in the research community.


### LMMs-Eval Resources

Complete resources for evaluating large multimodal models

- [GitHub Repository](https://github.com/EvolvingLMMs-Lab/lmms-eval)
- [Research Paper](https://arxiv.org/abs/2407.12772)
- [Documentation](https://github.com/EvolvingLMMs-Lab/lmms-eval/tree/main/docs)
- [Datasets](https://huggingface.co/lmms-lab)

## BibTeX

```bibtex
@misc{zhang2024lmmsevalrealitycheckevaluation,
      title={LMMs-Eval: Reality Check on the Evaluation of Large Multimodal Models},
      author={Kaichen Zhang and Bo Li and Peiyuan Zhang and Fanyi Pu and Joshua Adrian Cahyono and Kairui Hu and Shuai Liu and Yuanhan Zhang and Jingkang Yang and Chunyuan Li and Ziwei Liu},
      year={2024},
      eprint={2407.12772},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2407.12772},
}
```
