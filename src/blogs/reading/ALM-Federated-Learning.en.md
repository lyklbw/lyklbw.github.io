## Federated Learning for ALM
### 0. Clarification
I would like to clarify one thing first. In our communication last Friday, I mentioned an article about federated learning in the ALM field. However, that article is based on a very basic model (CNN + RNN). As for why I would not use this article as a reference, please refer to the logic of this document. 
[FEDAUDIO: A FEDERATED LEARNING BENCHMARK FOR AUDIO TASKS](https://ieeexplore.ieee.org/abstract/document/10096500)

### 1.My thoughts on the research direction
To accommodate all modalities, Multimodal Large Language Models (MLLMs) often sacrifice the depth of certain individual modalities. Furthermore, in scenarios where the client side only requires text or visual services, invoking an MLLM with hundreds of billions of parameters is both computationally expensive and sluggish. Additionally, many edge devices lack the necessary hardware support for such massive models.

Therefore, research into modality-specific models remains highly necessary.

An Audio Language Model (ALM) focuses specifically on the audio modality. However, it must first be emphasized that within audio processing, different tasks require distinct problem-solving approaches and model architectures. Current tasks can be broadly categorized as follows:
1. Audio-Text Contrastive Models (Representative: CLAP)
2. Multimodal Generative Audio-LLMs (Representative: SALMONN, Qwen-Audio, LTU, Pengi).
3. Audio Generation Models (Representative: AudioLM, AudioLDM, MusicGen).

In real-world scenarios, however, models need to be updated or fine-tuned based on specific users or datasets. Data privacy and security concerns make it infeasible to centralize data on a server for training, rendering Federated Learning (FL) a crucial solution. 

It is vital to highlight that audio is a continuous physical signal with temporal characteristics, making it highly susceptible to the physical environment (e.g., background noise, microphone frequency response) and individual biological traits (e.g., accents, vocal timbre). This severe Feature Shift inherently makes ALMs more reliant on Personalization than pure NLP or CV tasks. Consequently, I aim to explore the integration and application of Federated Learning, particularly Personalized Federated Learning (PFL), within the ALM domain.

Based on the paper I have read, the FedLoRA decomposes the incremental matrix into $\mathbf{A}$ for extracting universal knowledge (used for global aggregation) and $\mathbf{B}$ for fitting local data distributions (retained locally). Following a similar line of thought, we can consider the potential applications of PFL in this domain from two perspectives:
1. Parameter-level decoupling (similar to LoRA, there is a parameter A and B we choose one for global aggression and one for local update).
2. Module-level decoupling (based on the architectural characteristics of ALMs, like the adapters, incorporating modality-specific up- and down-projection layers and a shared cross-modal projection).

To further investigate the rationality and feasibility of the experimental design, we must first define the specific problem our Federated Learning model aims to solve and establish the foundational model framework. This framework should be solidly validated by the academic community. Subsequently, we need to consider how to implement parameter-level or module-level decoupling within this framework. Simultaneously, we must ensure fair comparisons with other FL methods and account for the unique characteristics of the ALM domain by designing appropriate evaluation metrics and datasets.

### 2.Dive into the model architecture
#### 2.1. CLAP (Contrastive Language-Audio Pretraining) (2023 ICASSP)
Tasks: Audio classification, environmental sound recognition, sound retrieval, etc. (Input: Audio $\rightarrow$ Output: Text labels or descriptions).
[CLAP Learning Audio Concepts from Natural Language Supervision](https://ieeexplore.ieee.org/abstract/document/10095889)
<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/CLAP_structure.png" style="width: 700px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">The structure of CLAP</span>
  </div>
</div>

##### 2.1.1 General Structure
Inspired by CLIP, CLAP utilizes contrastive pre-training to compute the (dis)similarity of audio-text pairs within a batch. The inputs are audio-text pairs passed into an audio encoder and a text encoder, which are then concatenated in a joint multimodal space via linear projections. The validation process involves zero-shot classification for multi-label tasks.

##### 2.1.2 Experimental Details
During training, data is constructed from four datasets: FSD50K, ClothoV2, AudioCaps, and MACS. Downstream tasks (zero-shot prediction) encompass multiple tasks across 16 datasets from 7 different domains (e.g., sound event classification, music classification, scene classification, emotion detection).
* **Training:** Audio is represented using log Mel spectrograms. The audio encoder is a CNN14 model, and the text encoder is the HuggingFace implementation of BERT base uncased. The text sequence length is limited to 100 tokens, and the temperature parameter $\tau$ is learnable.
* **Validation:** For specific downstream tasks, the audio encoder is unfrozen and fine-tuned.

##### 2.1.3 Personal Thoughts
1. Because there is currently no existing federated learning work specifically targeting this model, the baseline implementations must be designed and explicitly clarified independently. 
   *Baseline selections:* Local-Frozen, Local-Update, FedAvg, FedBN (Federated Batch Normalization), Ditto, FedRep.
2. **My approach:** Attempt to test whether the text encoder and audio encoder exhibit characteristics similar to matrices $\mathbf{A}$ and $\mathbf{B}$ in *Selective Aggregation for Low-Rank Adaptation in Federated Learning*. Intuitively, the text encoder should be more inclined to extract universal knowledge; for instance, human language (Text) is unaffected by physical environments (the word "barking" remains "barking" regardless of location). Conversely, the audio encoder should lean towards fitting local data distributions.
3. **Specific experimental design:** First, verify the similarity of text encoders and audio encoders across different clients under varying data heterogeneity. Next, evaluate the performance of different baselines across various tasks and Non-IID settings. Assess time and space costs, the effect of the number of clients, communication rounds, and convergence. (Given the lack of existing work on this model, the volume of experiments will be substantial.)

#### 2.2 Encoder + Projector + LLM
##### 2.2.1 [SALMONN: Towards Generic Hearing Abilities for Large Language Models](https://doi.org/10.48550/arXiv.2310.13289) (2024 ICLR)
Tasks: Automatic Speech Recognition (ASR) and translation, auditory-based question answering, emotion recognition, speaker verification, and music/audio captioning.

###### 2.2.1.1 General Structure
SALMONN (Speech, Audio, Language, Music Open Neural Network) is constructed by integrating a pre-trained text-based Large Language Model (LLM) with speech and audio encoders into a single multimodal model.

SALMONN employs a dual-encoder structure: the speech encoder from the Whisper model and the BEATs audio encoder. The model utilizes a window-level Query Transformer (Q-Former) as a connection module to convert variable-length encoder output sequences into augmented audio tokens, which are then fed into the Vicuna LLM. Furthermore, the model applies the LoRA (Low-Rank Adaptation) method to Vicuna (an instruction-tuned version of LLaMA) as a cross-modal adapter to align the input and output spaces and further enhance performance.
<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/SALMONN.png" style="width: 700px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">The structure of SALMONN</span>
  </div>
</div>

###### 2.2.1.2 Experimental Details
**Training:**
* **Stage 1: Cross-modal Pre-training:** The model is trained using massive amounts of Audio Captioning and Automatic Speech Recognition (ASR) data. The objective is to enable the LLM to comprehend audio features and preliminarily align them with text labels.
* **Stage 2: Instruction Tuning:** Utilizes various task instruction data encompassing speech, audio, and music. The model is trained to follow different types of user instructions, such as "Describe the rhythm of this music" or "Translate this speech."
* **Stage 3: Activation Tuning:** This is SALMONN's key innovation. To mitigate task-specific overfitting (i.e., catastrophic forgetting of unobserved tasks), a small number of high-quality instruction samples are introduced to reactivate the LLM's inherent general reasoning and emergent abilities.

**Validation:**
Task Selection: Speech Tasks, Audio Tasks, Music Tasks, Emergent Ability Tests.

###### 2.2.1.3 Personal Thoughts
The primary focus here is how to apply PFL to this type of architecture and how to design the corresponding experiments.
1. Similar to CLAP, no existing federated learning work was found for this model, meaning baselines must be designed independently.
2. Since this architecture mainly consists of three modules—a dual-encoder (Whisper + BEATs), a connection module (Q-Former), and an LLM (Vicuna + LoRA)—Federated Learning can be applied to different components. For instance, within the LoRA section, we can discuss the $\mathbf{A}$ and $\mathbf{B}$ matrices. Alternatively, the connection module could be shared globally while LoRA updates locally. We could also attach a small adapter at the encoder side, sharing the encoder globally while using the adapter for local fine-tuning. Different modules assume entirely distinct semantic hierarchies within multimodal large models, and their vulnerabilities to data heterogeneity vary significantly. We need to investigate how sensitive different modules are to data heterogeneity across various tasks to design rational PFL methods. Additionally, we can explore the "joint training dynamics" between modules to clarify which should be globally aggregated and which should remain static. For example: if both the Encoder and Q-Former undergo federated aggregation simultaneously, the minor feature drifts produced by the Encoder across different clients might be non-linearly amplified by the Q-Former's attention mechanism.
3. As for the specific experimental design, we can refer to the previous paper's methodology. The implementation will likely involve a massive workload, but the topic is highly fascinating.

##### 2.2.2 [Qwen-Audio: Advancing Universal Audio Understanding via Unified Large-Scale Audio-Language Models](https://doi.org/10.48550/arXiv.2311.07919) (2023 arXiv)

###### 2.2.2.1 General Structure
**Introduction:**
Because most existing works only support limited interactive capabilities, this paper addresses this limitation by scaling up audio-language pre-training to cover over 30 tasks and various audio types (e.g., human speech, natural sounds, music, and song), thereby facilitating universal audio understanding capabilities.

A significant challenge in multi-task and multi-dataset co-training stems from the massive variations in text labels associated with different datasets. This variance arises from differences in task objectives, languages, annotation granularity, and text structures (structured vs. unstructured). To overcome this "one-to-many" challenge, a multi-task training framework was meticulously designed to condition the decoder on a sequence of hierarchical tags.

A notable achievement of Qwen-Audio is attaining State-of-the-Art (SOTA) performance on the test sets of Aishell1, cochlscene, ClothoAQA, and VocalSound. Leveraging Qwen-Audio's capabilities, the authors introduced Qwen-Audio-Chat via supervised instruction fine-tuning.

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/Qwen-Audio.png" style="width: 700px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">The structure of Qwen-Audio</span>
  </div>
</div>

Qwen-Audio's architecture comprises an audio encoder and a Large Language Model (LLM).

An interesting aspect of this work is the proposed hierarchical tag framework, designed to resolve interference caused by label disparities across different datasets. Personally, I believe this paper is less suitable as a foundational subject for PFL research, as the required experimental workload would be overwhelmingly extensive.

### 3.Conclusion and Concerns
Overall, Federated Learning in the ALM domain is a field with very sparse existing literature; there are not even representative foundational federated learning papers yet. However, this is exactly what concerns me: does the broader industry simply not recognize the research value of Federated Learning for ALMs? Compared to Vision Language Models, the academic community seems to allocate much less attention to ALMs. Most existing papers on ALMs in top-tier AI conferences focus primarily on novel model architectures and training/testing methodologies, whereas literature addressing Federated Learning within the ALM domain is virtually non-existent. Therefore, I worry that this research direction might be considered excessively niche or even unacknowledged, despite my firm personal belief that it is highly meaningful and necessary.