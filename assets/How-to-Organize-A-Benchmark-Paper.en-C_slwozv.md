## How to Structure a Benchmark Paper
> **Overview:** This document outlines my conceptual understanding of benchmark papers, primarily drawing theoretical references from benchmark literature in the LLM community. The goal is to establish a clear roadmap for drafting our upcoming Benchmark work.
> 
> **PS:** I drafted 'Section 0' last week. Over the weekend, I read a few more papers, and today I spent some time brainstorming the overall experimental setup roughly.

### 0. Pre-Meeting Reflections (Discussion with Sajjad)
*Objective: Present these initial thoughts to Sajjad to verify if my focus aligns with the core research problems.*

This topic operates at the intersection of three complex components: **Multimodal Large Language Models (specifically Audio Language Models / ALMs)**, **Federated Learning (FL)**, and **Benchmarking**. Each component offers multiple analytical angles. 

Before designing the benchmark experiments, I need to clarify the following foundational questions:

**1. What is the fundamental difference between an LLM benchmark and an LLM Federated Learning benchmark?**
* *Kai's Perspective:* Traditional LLM benchmarks aim to evaluate the baseline performance and capabilities of various models across designed downstream tasks. 
* *Our Focus:* An FL benchmark, however, focuses on how the *federated training paradigm* impacts model capabilities. It investigates how statistical heterogeneity (non-IID data) and system heterogeneity across clients affect both the model's final performance and the training dynamics.

**2. What is the difference between an MLLM benchmark and an Audio Language Model (ALM) benchmark?**
* While audio can be treated simply as one modality within broader MLLMs, focusing exclusively on ALMs requires us to dig deeper into the unique characteristics of sound. We must explore how **acoustic heterogeneity** specifically impacts Federated Learning.

**Core Thesis:** Therefore, the core philosophy of our ALM Federated Learning Benchmark is to: **Construct a rich, highly representative dataset that captures real-world acoustic heterogeneity; evaluate how different FL strategies impact a single model's performance under these acoustic conditions; and finally, demonstrate the benchmark's generalizability across various ALM architectures.**

#### Task Selection Strategy
Audio tasks generally fall into three categories:
1.  **Audio-to-Text (Classification/Retrieval):** e.g., Environmental sound recognition, audio classification (Audio-Text Contrastive / Encoder paradigms).
2.  **Audio-to-Text (Generative):** e.g., Automatic Speech Recognition (ASR), Audio Captioning (End-to-End ALMs).
3.  **Text-to-Audio:** e.g., Audio Generation.

Because model architectures vary drastically across these categories, our benchmark must focus deeply on *one* specific paradigm rather than attempting a superficial, catch-all approach. 

**Decision:** I propose we focus on the **Second Category (ASR / Captioning)**. Here is why:
The heterogeneity in ASR and Captioning tasks is inherently tied to **speaker-level personalization differences**, which perfectly aligns with the fundamental motivation of Federated Learning (where clients = individual speakers or edge devices).

#### Designing the Dataset: Dimensions of Acoustic Heterogeneity
To systematically cover the sources of voice personalization, our dataset design should encompass the following dimensions:

* **Dimension 1: Accent & Linguistic Heterogeneity**
    * *Scope:* Standard accents vs. dialects vs. heavily accented speech vs. multilingual.
    * *Datasets:* CommonVoice (100+ languages), AISHELL-1 (Mandarin), AISHELL-3 (Multi-speaker), LibriSpeech (English).
    * *FL Mapping:* Each client represents a specific language or dialect community.
* **Dimension 2: Acoustic Environment Heterogeneity**
    * *Scope:* Studios, living rooms, streets, vehicles, telephony.
    * *Datasets:* CHiME-6 (Home multi-speaker), AISHELL-4 (Far-field meetings).
    * *Simulation:* Artificial overlay of Room Impulse Responses (RIR) and background noise.
* **Dimension 3: Domain & Content Heterogeneity**
    * *Scope:* Daily conversation, medical, legal, academic lectures.
    * *Datasets:* TED-LIUM (Lectures), PodcastFillers, MedQA-related voice data.
    * *FL Mapping:* Simulating the data distribution of clients from different professional industries.
* **Dimension 4: Speaker Count & Stylistic Heterogeneity**
    * *Scope:* Single speaker vs. overlapped mixed speakers; varying demographics (children, adults, elderly).
    * *Datasets:* CMU Kids (Child speech), VCTK (Multi-speaker/accent).
* **Dimension 5: Caption Granularity Heterogeneity (For Audio Captioning)**
    * *Scope:* Fine-grained (includes emotion, environment context) vs. Coarse-grained (content only).
    * *Datasets:* AudioCaps, Clotho (Fine) vs. AudioSet (Coarse).

#### Proposed Evaluation Tasks
* **Task 1: Automatic Speech Recognition (ASR)** (Input: Audio $\rightarrow$ Output: Transcript. *Metrics: WER, CER*).
* **Task 2: Audio Captioning** (Input: Audio $\rightarrow$ Output: Natural Language Description. *Metrics: METEOR, CIDEr, SPICE*).
* **Task 3: Cross-lingual Speech Recognition** (Train on Language A, test transferability to Language B. *Evaluates cross-lingual generalization under FL*).
* **Task 4: Speaker-Independent Recognition** (Evaluates zero-shot generalization to unseen speakers. *Core FL challenge: No speaker overlap between clients*).

#### The Architecture Challenge
We plan to validate our benchmark using backbones like **SALMONN, Qwen-Audio, WavLLM, and Pengi**. However, this introduces a critical challenge: *How do we ensure the generalization capability of our benchmark across fundamentally different LLM backbones?*

Furthermore, these base models do not natively support FL paradigms. We will need to engineer the implementation of various FL strategies (FedAvg, FedProx, Personalized FL, etc.) on top of them. 

**How to determine the correct FL implementation details?**
1.  **Prior Knowledge Pruning:** Eliminate obviously incompatible hyperparameter/strategy combinations based on existing LLM-FL literature.
2.  **Pilot Studies:** Run small-scale, constrained experiments to identify the most promising main experimental directions.
3.  **Hierarchical Design:** Establish a strict "Default Configuration" baseline, coupled with designated "Ablation Variables" to isolate specific effects.

*Self-Note:* The sheer volume of work here is immense. The preparatory phase must be incredibly rigorous and well-thought-out, otherwise the execution phase will be paralyzed by debugging and pivoting.

---

### 1. Literature Review & Notes

#### 1.1 FedVLMBench: Benchmarking Federated Fine-Tuning of Vision-Language Models
> *Status: Rejected by NeurIPS 2025 & ICLR 2026, currently under review at ECCV 2026.*

**Key Takeaways from Rebuttals:**
* **Lack of Depth:** Reviewers felt the work was largely descriptive/empirical, lacking technical innovation, theoretical depth, or strong conceptual motivation.
* **Marginal Gains:** Performance differences between fine-tuning strategies were too small, undermining the paper's conclusions.
* **Limited Scope:** Criticized for limited model diversity, too few clients, and failing to adequately explore core FL factors (non-IID data, fairness, scalability).
* **Missing Baselines/Analysis:** Overlooked full-parameter fine-tuning baselines, lacked zero-shot performance comparisons, and failed to report variance measures (only reported averages).
* **Cross-Task Interference:** Reviewers wanted more investigation into cross-task datasets (e.g., Fed-Nature, Fed-Med). *Note: Cross-task training introduces extreme heterogeneity, forcing a trade-off between knowledge transfer and multi-task interference (where gradients from different tasks conflict).*

#### 1.2 FedLLM-Bench: Realistic Benchmarks for Federated Learning of Large Language Models
> *Status: Accepted by NeurIPS 2024.*

**Key Takeaways:**
* **Conceptual Clarity:** They clearly distinguish between *what* to do (Instruction Tuning / Preference Alignment) and *how* to do it (Parameter-Efficient methods like LoRA, QLoRA vs. Full Fine-Tuning).
* **Implementation Separation:** Baselines are cleanly divided into the *Local Training* phase and the *Model Aggregation* phase.
* **Data Distribution Visualization:** They utilize IFD scores and t-SNE plots to quantify and visualize dataset heterogeneity—a technique we should adopt.
* **Critiques Addressed in Rebuttal:** They had to defend their dataset filtering rationale, their heavy reliance on a single model (Llama2-7B), and their baseline/hyperparameter selections. They were also critiqued for not explaining how easily new algorithms could be integrated into their framework.

*(Placeholders for further reading)*
#### 1.3 SALMONN: Towards Generic Hearing Abilities for Large Language Models
#### 1.4 Qwen-Audio: Advancing Universal Audio Understanding via Unified Large-Scale Audio-Language Models
#### 1.5 WavLLM: Towards Robust and Adaptive Speech Large Language Model
#### 1.6 Pengi: An Audio Language Model for Audio Tasks

---

### 2. General Strategy for Our Work

#### 2.1 Core Question and Motivation
* **Motivation Anchor:** Centralized audio data collection faces immense privacy hurdles (voice biometrics, background conversations, sensitive environments). FL is the natural, inevitable solution. However, current ALMs are almost exclusively tested in centralized settings and have not been robustly evaluated against realistic, decentralized acoustic distributions.
* **Addressing the Data Gap:** We must explicitly state that we are moving away from artificially constructed or arbitrarily partitioned datasets. Our benchmark is designed to reflect the *true*, messy diversity of real-world audio data across distinct client devices.
* **Core Objective:** To systematically evaluate how acoustic heterogeneity (speaker, environment, domain) impacts the Parameter-Efficient Federated Fine-Tuning (PEFFT) of pre-trained Audio Language Models.

#### 2.2 Task and Dataset Design
*Strategic Note: Including too many diverse tasks will dilute the paper's focus, causing reviewers to critique the model's inherent cross-task generalization rather than the FL framework itself. We must stay focused.*

**Selected Tasks (Top 3 Candidates):**
1.  **Task 1: Automatic Speech Recognition (ASR):** Tests the baseline acoustic-to-text mapping fidelity under heterogeneous conditions.
2.  **Task 2: Spoken Language Understanding (SLU) / QA:** Tests instruction-following capabilities from audio.
    * *Intent Recognition & Slot Filling:* Based on datasets like SLURP, partitioned by speaker habits.
    * *Spoken QA:* Using QA datasets synthesized with local accents.
3.  **Task 3: Speech Translation:** Tests cross-lingual alignment.
    * *Resource Imbalance FL:* Simulating a federated network mixing high-resource and low-resource language clients.

**Dataset Quality & Construction:**

**Dataset Construction:**

* Multilingual / Accent Heterogeneity
* Extreme Noise Heterogeneity
* Specialized Domains (or Professional Domains)
* Resource Imbalance
* Data Quality

**Quality:**

implement methods to measure the complexity or quality of the audio/transcripts for each client to prove dataset contains realistic quality heterogeneity scientifically

#### 2.3 Baselines & Methods
* **Model Selection:** Lead with SALMONN as the primary testbed. To prove the framework's generalization, run secondary validation on Qwen-Audio or WavLLM.
* **Architecture:** Clearly define the separation between the *Local Training Strategy* (LoRA, QLoRA) and the *Federated Aggregation Baselines* (FedAvg, FedProx).

#### 2.4 Evaluation Protocol
* **Task-Specific Metrics:** WER/CER for ASR, etc.
* **General Capability Retention:** Ensuring FL fine-tuning doesn't cause catastrophic forgetting of the LLM's core reasoning skills.
* **FL-Specific Metrics:**
    * Communication Efficiency (Costs of aggregating ALM weights).
    * Convergence Speed.
    * Fairness (Measuring performance variance across different clients/demographics).
    * Robustness to Heterogeneity (Quantifying the performance drop compared to centralized training upper-bounds).


### 3. Miscellaneous
#### 3.1 Projection Description
Audio Language Models (ALMS) have achieved unprecedented success in Automatic Speech Recognition (ASR) and Audio Captioning. These ALMs are usually trained by centralized learning paradigm, which fails to meet the privacy protection requirements necessary for some distributed systems.
Federated Learning has emerged as a sound and off-the-shelf technique to facilitate collaboration, which leverages decentralized language data to collaboratively train models.

However, the performance of ALMs under the federated learning paradigm has not been systematically evaluated. The lack of a standardized benchmark makes it difficult to explore how data heterogeneity and system heterogeneity etc. affect the performance of ALMs in federated learning, and to compare different federated learning strategies for ALMs.

So we propose to build a benchmark for Federated Learning of Audio Language Models (FedALM-Bench). This benchmark will include a carefully curated dataset that captures the real-world heterogeneity of audio data, a set of evaluation tasks that test the capabilities of ALMs under federated learning, and a suite of baselines and metrics to evaluate the performance of different federated learning strategies for ALMs.