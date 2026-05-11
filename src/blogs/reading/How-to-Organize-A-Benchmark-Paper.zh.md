## 如何组织一篇Benchmark论文
> 本文主要依据LLM社区的Benchmark论文作为理论参考，总结阅读期间，个人对于Benchmark论文的理解和组织结构的建议。希望能为后续撰写Benchmark论文提供帮助。

### 0.思考
下周和sajjad的讨论
我应提供如下问题的思考，让他帮我看看我是否focus对了主要的问题

So this topic is combined with three components:
MLLM (Particarly Audio Language Model + Federated Learning + Benchmark), so each component has so many different potential angles to analyze.

Befor design the benchmark experiment, I need to clarify the following questions:
1. what is the main difference between LLM benchmark and LLM federated learning benchmark?
Kai's Answer: LLM benchmark tries to answer what is the performance of different kinds of model on designed tasks.
而federated learning benchmark关注的是LLM的联邦学习训练范式对模型能力的影响，以及统计、系统异构性对模型和训练的影响。   

2. what is the main difference between MLLM benchmark and Audio language model benchmark?
尽管Audio可以作为MLLM的一个特定模态，但在仅讨论Audio Language Model的情况下，我们应当发掘声学异质性对于Federated Learning的影响。

所以综上我认为，ALM Federated Learning Benchmark的和核心思路是：**构建能充分代表声学异构性的丰富的数据集，评估单个模型的不同的federated learning策略会如何被声学异质性和其他因素影响，之后再推广到更多类型的架构下**。
但是需要提到的是，ALM领域的声学问题主要分为三类：
1. 音频分类、环境音识别、声音检索等任务，输入为音频，输出为文本标签或文本描述。（音频-文本对比/编码器范式）
2. 语音识别 (ASR)、音频字幕生成 (Audio Captioning) 等任务，输入为音频，输出为文本。（端到端音频语言模型）
3. 音频生成 (Audio Generation) 等任务，输入为文本，输出为音频

针对不同类型的任务的模型架构完全不同，因此我们的benchmark应该是集中于某一个任务，而不是针对所有类型的任务的一个大而全的benchmark。

针对音频分类任务

所以我现在开始思考哪一种任务更适合我们进行benchmark的设计，我认为第二种任务更适合我们进行benchmark的设计，原因如下：
ASR/Caption 的异构性来源于：
    → 异构性 = 说话人级别的个人化差异
    → 数据集设计 = 系统性覆盖语音个人化的来源


    维度1：口音/语言异构
        → 标准普通话 / 方言 / 带口音英语 / 多语言
        → 数据集：CommonVoice（100+语言）
                AISHELL-1（普通话）
                AISHELL-3（多说话人）
                LibriSpeech（英语）
        → 每个客户端 = 一种语言/口音群体

    维度2：声学环境异构
        → 录音室 / 家庭 / 街道 / 车载 / 电话
        → 数据集：CHiME-6（家庭多人对话）
                AISHELL-4（远场会议）
        → 人工叠加：RIR（房间冲激响应）模拟

    维度3：领域/内容异构
        → 日常对话 / 医疗 / 法律 / 学术讲座
        → 数据集：TED-LIUM（演讲）
                PodcastFillers（播客）
                MedQA相关语音数据
        → 模拟：不同行业客户端的真实数据分布

    维度4：说话人数量与风格异构
        → 单说话人 vs 多说话人混合
        → 儿童 / 成人 / 老人声音
        → 数据集：CMU Kids（儿童语音）
                VCTK（多说话人多口音）

    维度5：Caption任务的描述粒度异构
        → 细粒度描述（含情感、场景）
        → 粗粒度描述（仅内容）
        → 数据集：AudioCaps、Clotho（细粒度）
                AudioSet（粗粒度）


    Task 1：自动语音识别（ASR）
        → 输入语音 → 输出文字转录
        → 评估指标：WER（词错率）、CER（字错率）

    Task 2：音频字幕生成（Audio Captioning）
        → 输入音频 → 输出自然语言描述
        → 评估指标：METEOR、CIDEr、SPICE

    Task 3：跨语言语音识别
        → 在语言A上训练，测试语言B的迁移能力
        → 评估联邦训练的跨语言泛化

    Task 4：说话人无关识别
        → 评估模型对未见说话人的泛化
        → 核心联邦问题：每个客户端说话人不重叠

验证模型：
SALMONN Qwen-Audio  WavLLM Pengi等，但是这里又存在一个问题，how to promise generalization ability of our benchmark across different LLM backbones.

并且有一个问题是上述模型甚至没有引入联邦学习的训练范式，因此我们需要在这些模型的基础上设计如何引入不同的联邦学习训练策略（如FedAvg、FedProx、个性化联邦学习等）

那么每一种架构如何确定正确的联邦学习的实现细节如何确定？
1. 用先验知识剪枝，排除明显不合理的组合
2. 设计 pilot study，用少量实验确定主实验方向
3. 确定"默认配置"+ "消融变量"的分层结构

总的来说工作量非常非常的大，我认为前期准备需要谨慎且思考充分，不然后续会举步维艰。


### 1. 阅读笔记
#### 1.1 FedVLMBench: Benchmarking Federated Fine-Tuning of Vision-Language Models
> Rejected by NeurIPS 2025 & ICLR 2026, under reviewed by ECCV 2026

##### 1.1.1 Rebuttal Notes
**ICLR**

1. The work is seen as largely descriptive and empirically driven，with limited technical or theoretical innovation and insufficient conceptual motivation

2. Performance differences among fine-tuning strategies are often small, weakening some of the stated conclusions

3. citing limited model diversity, small client counts, and insufficient exploration of key FL factors such as non-IID heterogeneity, fairness, and scalability

4. suggest that stronger motivation, deeper analysis, broader model and FL settings, and clearer justification of the main takeaways 

NeurIPS

1. Computational costs 
2. Report averages but no variance measures.
3. The paper briefly mentions privacy but doesn’t discuss potential misuse 
4.  full-parameter finetuning overlooked
5.   zero-shot performance comparisons would be provided 
6.   On cross-task datasets such as Fed-Nature and Fed-Med, the impact of different fine-tuning strategies warrants further investigation;
7.   The paper lacks a discussion of future directions, potential optimization strategies, and known limitations of the current approach.
   
PS:
cross-task: 极端异构性 知识迁移与协作 多任务干扰(不同任务的梯度可能会产生冲突)


   
##### 1.1.2 Reading Notes

#### 1.2 FedLLM-Bench: Realistic Benchmarks for Federated Learning of Large Language Models
> Accepted by NeurIPS 2024

Rebuttal Notes:
1. reasons for filtering the dataset
2. Most observations based on Llama2-7B
3. they did not mention how to quickly implement new algorithms based on their framework.
4. Perplexity is a common metric for evaluating a data sample in language modeling.
5. it should be explained why they choose these baselines and what are the set hyper-parameters.

Reading Notes:
1. Instrument Tuning / Preference Alignment is what to do, and LoRA, QLoRA, Full Fine-Tuning are how to do it.\
2. Baseline实现： Local training part & model aggregation part.
3. Guidance of how to visualize the distribution of dataset： IFD scores and t-SNE scores.
4. metrics： Open-ended & Closed-ended?
5. Fed-ChatbotIT, Fed-ChatbotPA and Fed-WildChat are based on Chatbot-arena Conversations dataset and WildChat dataset
6.  Appendix contains Differential Privacy

#### 1.3 SALMONN: TOWARDS GENERIC HEARING ABILITIES FOR LARGE LANGUAGE MODELS


#### 1.4 Qwen-Audio: Advancing Universal Audio Understanding  via Unified Large-Scale Audio-Language Models

#### 1.5 WavLLM: Towards Robust and Adaptive Speech Large Language Model


#### 1.6 Pengi: An Audio Language Model for Audio Tasks




### 2.General Thinking of our work
#### 2.1 Core Question and Motivation
Motivation Anchor: Centralized audio data collection faces immense privacy hurdles (voice biometrics, background conversations). FL is the natural solution, but current ALMs aren't tested against realistic, decentralized acoustic distributions.

Concerning this will be a benchmark work, Addressing the Gap in Realistic Data is also a good motivation: We should not rely on artificially constructed or partitioned datasets, and should instead design a benchmark that reflects the true diversity and heterogeneity of real-world audio data across different clients.

I think the core objective is to Evaluate how acoustic heterogeneity (speaker, environment, domain) impacts the parameter-efficient federated fine-tuning of pre-trained ALMs. 

#### 2.2 Tasks and Datasets Design
Selected Tasks:(Three Potential)
任务过多可能导致评审的注意力会被分散到模型本身的跨任务泛化能力上
1. Task 1: 自动语音识别 (ASR) —— 测试声学到文本的精确映射
2. Task 2: 口语理解/问答 (Spoken Language Understanding / QA) —— 测试指令遵循
* 意图识别与槽位提取 (基于 SLURP 数据集，按说话人习惯切分)
* 语音问答 (基于合成本地口音的 QA 数据集)
3. Task 3: 语音翻译 (Speech Translation) —— 测试跨语言对齐能力
资源不平衡翻译 (模拟高资源与低资源语种客户端的混合联邦)

Dataset Construction:
* 多语言/口音异构
* 极度噪音异构
* 专业领域
* 资源不平衡
* Data Quality

ps: implement methods to measure the complexity or quality of the audio/transcripts for each client to prove dataset contains realistic quality heterogeneity scientifically

#### Baselines & Methods
Model Selection: SALMONN firstly and to prove the generalization ability of the benchmark, we can also include Qwen-Audio, WavLLM..

* Local Training Strategy Part
* Federated Aggregation Baselines Part 

#### Evaluation Protocol
Task-Specific Metrics: * ASR: Word Error Rate (WER), Character Error Rate (CER) etc

General Capability Retention

FL Metrics: Communication Efficiency, Convergence Speed, Fairness (performance variance across clients), Robustness to Heterogeneity (performance drop vs centralized training) Differential Privacy Metrics

