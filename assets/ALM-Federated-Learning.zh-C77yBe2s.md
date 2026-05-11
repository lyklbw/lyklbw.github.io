## Federated Learning for ALM

### My thoughts on the research direction
多模态大预言模型为了兼容所有模态，往往会牺牲某些模态的深度，同时一些场景下，用户端仅需文本或视觉服务等，调用一个拥有千亿参数的 MLLM 既昂贵又缓慢，同时一些边远设备也并没有硬件支撑。

因此对于特定模态的模型的研究依旧必要。

ALM（Audio Language Model） 是一个专注于音频的语言模型，但首先需要强调的是音频处理这一模态下不同的任务的解决方法，模型架构是不同的，当下任务主要分为下面几类：
1. 音频分类、环境音识别、声音检索等任务，输入为音频，输出为文本标签或文本描述。
2. 语音识别 (ASR)、音频字幕生成 (Audio Captioning) 等任务，输入为音频，输出为文本。
3. 音频生成 (Audio Generation) 等任务，输入为文本，输出为音频

然而现实场景中，模型需要根据特定的用户或数据集进行更新/微调，然而数据隐私和安全问题使得将数据集中到服务器端进行训练变得不可行，因此联邦学习（Federated Learning）成为了一种重要的解决方案。需要强调的是音频是具有时序性的连续物理信号，且极易受到物理环境（底噪、麦克风频响）和个体生物特征（口音、音色）的影响。 这种强烈的特征偏移（Feature Shift）使得 ALM 天然比单纯的 NLP 或 CV 更需要 Personalization。因此我想要探索Federated Learning，尤其是Personalized Federated Learning 在 ALM 领域的融合与应用。

FedLoRA 将增量矩阵分解为提取通用知识的 $\mathbf{A}$（用于全局聚合）和拟合局部数据分布的 $\mathbf{B}$（留在本地），类似的思路，我们可以从两个角度思考PFL在这个领域应用的可能：
1. 参数级的解耦（类似于LoRA）
2. 模块级的解耦 (基于 ALM 架构特性的划分)

为了进一步深入的探讨实验设计的合理性与可行性，首先需要先确定我们讨论的Federated Learning的模型是解决的什么问题，确定模型框架，这个模型框架应该是基础，且被学界验证的，再思考如何在这个框架下进行参数级或模块级的解耦，同时也要注意如何公平的和其他的FL方法进行对比，最后还要考虑到ALM领域的特殊性，设计合理的评测指标和数据集。


### Dive into the model architecture
#### 1. CLAP (Contrastive Language-Audio Pretraining)(2023 ICASSP)
音频分类、环境音识别、声音检索等任务，输入为音频，输出为文本标签或文本描述。
[CLAP Learning Audio Concepts from Natural Language Supervision](https://ieeexplore.ieee.org/abstract/document/10095889)
<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/CLAP_structure.png" style="width: 700px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">The structure of CLAP</span>
  </div>
</div>

##### 1.1 大致结构
受到CLIP的启发，CLAP利用constrastive pretraining对比学习计算一个批次中音频和文本对的（不）相似性,输入是传递给音频编码器和文本编码器的音频-文本对,通过线性投影在联合的多模态空间中进行连接。而验证过程中的零样本分类 (Zero-Shot Classification)，对多标签分类。


##### 1.2 实验细节：
实验过程中，从 FSD50k，ClothoV2，AudioCaps与MACS四个数据集构建数据进行训练,而下游任务（zero-shot prediction）则7 个不同领域的 16 个数据集的多个任务（声音事件分类，音乐分类，场景分类，情感检出等）
* 训练：我们使用音频的对数梅尔谱图（log Mel spectrogram）表示，音频编码器选用 CNN14 模型，文本编码器采用 HuggingFace 实现的 BERT base uncased，文本序列长度限制在 100 个 token 以内，温度参数 $\tau$ 是可学习。

* 验证：对于特定下游任务，取消冻结并微调音频编码器

##### 1.3 个人想法

1. 该模型其实没有找到相关的工作进行联邦学习，所以对于基线的实现需要自行设计澄清
基线选择：Local-Frozen, Local-Update, FedAvg, FedBN (Federated Batch Normalization)，Ditto
FedRep

2. 我的方法：尝试测试text encoder和 audio encoder是否有类似SELECTIVE AGGREGATION FOR LOW-RANK ADAPTATION IN FEDERATED LEARNING中$\mathbf{A}$和$\mathbf{B}$的特点，intuitively, text encoder应该更倾向于提取通用知识,例如人类的语言（Text）是不受物理环境干扰的（“狗叫”这个词，无论在哪里都是“狗叫”），而audio encoder则更倾向于拟合本地数据分布。

3. 具体实验设计：首先验证不同客户端text encoder和audio encoder在不同数据异构性下的相似度，之后验证不同的baseline在不同的任务下的表现，在不同Non-IID setting下的表现,Time and space costs. EFFECT OF NUMBER OF CLIENTS, 通信轮次与convergence。（因为没有此模型下的工作所以实验的量会比较大）



  
  



#### 2. Encoder + Projector + LLM
##### 2.1 [SALMONN: Towards Generic Hearing Abilities for Large Language Models](https://doi.org/10.48550/arXiv.2310.13289)(2024 ICLR)
自动语音识别（ASR）与翻译、基于听觉信息的问答、情感识别、说话人验证、以及音乐和音频字幕生成等
###### 2.1.1 大致结构
SALMONN，是一个语音（Speech）、音频（Audio）、语言（Language）、音乐（Music）开放神经网络,它通过将预训练的基于文本的大语言模型（LLM）与语音及音频编码器整合到一个单一的多模态模型中而构建.


SALMONN 采用了双编码器结构:Whisper语音模型的语音编码器和BEATs音频编码器。
模型使用窗口级查询 Transformer（Q-Former）作为连接模块，将变长的编码器输出序列转换为增强音频标记，输入到 Vicuna LLM 中 。此外，模型对 Vicuna(基于 LLaMA 的指令微调版本) 应用了 LoRA（低秩自适应）方法作为跨模态适配器，以对齐输入与输出空间并进一步提升性能
<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/SALMONN.png" style="width: 700px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">The structure of SALMONN</span>
  </div>
</div>

###### 2.1.2 实验细节
**训练**

阶段 1：跨模态预训练 (Cross-modal Pre-training)：
在此阶段，模型使用大量的音频字幕生成（Audio Captioning）和自动语音识别（ASR）数据进行训练。其目标是让 LLM 学会理解音频特征并将其与文本标签初步对齐。
阶段 2：指令微调 (Instruction Tuning)：
使用包含语音、音频和音乐的各类任务指令数据。模型被训练以遵循不同类型的用户指令，例如“描述这段音乐的节奏”或“翻译这段语音”。
阶段 3：激活涌现能力的微调 (Activation Tuning)：
这是 SALMONN 的关键创新点。为了缓解模型在特定任务上的过拟合（即只会做训练过的任务，而失去了处理未知任务的能力），我们引入了少量的高质量指令样本，旨在重新激活 LLM 固有的通用推理和涌现能力。

**验证**
任务选择：语音任务 (Speech Tasks)、音频任务 (Audio Tasks)、音乐任务 (Music Tasks)、涌现能力测试 (Emergent Ability Tests)

###### 2.1.3 个人想法
主要在于如何将PFL应用于此类架构以及如何设计实验
1. 该模型同样没有找到相关的工作进行联邦学习，所以对于基线的实现需要自行设计澄清

2. 由于此架构主要由三个模块组成双编码器 (Whisper + BEATs)、连接模块 (Q-Former) 以及 LLM (Vicuna + LoRA)，
也就是说联邦学习可以服务于不同的模块，例如LoRA部分我们就可以讨论A and B matrices，也可以共享连接模块，而LoRA本地更新，也可以在编码器端增加一个小的adapter，共享encoder，而小的adapter用于本地微调。不同模块在多模态大模型中承担的语义层级完全不同，它们面对数据异构性时的脆弱性也大相径庭，以及不同的模块在不同的任务中对于数据异构性的敏感程度，进而设计合理的PFL方法。同时我们也可以讨论探究不同模块之间的“联合训练动力学”，明确哪些模块应该被全局聚合、哪些应该保持静止，举个例子：如果同时对 Encoder 和 Q-Former 进行联邦聚合，Encoder 在不同客户端产生的微小特征漂移，会被 Q-Former 的注意力机制非线性放大。

3. 至于具体的实验设计，可以参照上一篇论文的实验，实现起来应该也任务量很大，不过这个话题很有意思。


##### 2.2 [Qwen-Audio: Advancing Universal Audio Understanding via Unified Large-Scale Audio-Language Models](https://doi.org/10.48550/arXiv.2311.07919)(2023 arXiv)

##### 2.2.1 大致结构
引入：
由于现有的多数工作仅能支持有限的交互能力，本文通过将音频语言预训练扩展到涵盖 30 多项任务和各种音频类型（如人类语音、自然声音、音乐和歌曲）来解决这一局限，从而促进通用音频理解能力。

多任务和多数据集协同训练的一个重大挑战源于不同数据集相关的文本标签存在巨大差异 。这种差异源于任务目标、语言、标注粒度和文本结构（结构化或非结构化）的不同，为了应对这一“一对多”挑战，我们精心设计了一个多任务训练框架，使解码器以一系列层级标签为条件。

Qwen-Audio 的一项显著成就是它在 Aishell1、cochlscene、ClothoAQA 和 VocalSound 的测试集上达到了最先进（SOTA）的性能 。利用 Qwen-Audio 的能力，我们通过监督指令微调引入了 Qwen-Audio-Chat。

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/Qwen-Audio.png" style="width: 700px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">The structure of Qwen-Audio</span>
  </div>
</div>

Qwen-Audio 的架构包含一个音频编码器和一个大型语言模型 (LLM)

本文一个有意思的工作是为了解决不同数据集标签差异导致的干扰，提出了层级标签框架，个人认为这篇文章不是很适合作为PFL的研究对象，因为实验量会过于庞大。

### Conclusion and Concerns
总的来说，ALM领域的Federated Learning是一个现有工作很少的领域，甚至基础的federated Learning工作都没有代表作，但是这也是我所担心的，是否业界并不认可ALM领域的Federated Learning的研究价值，对于Vision Language Model,整个学界对于ALM的投入的关注度似乎不高，AI top 会议现有的关于ALM的文章大多数也是比较优秀的模型架构和训练测试方法的文章，而关于ALM领域的Federated Learning的文章几乎没有，所以我担心这个研究方向可能会过于小众，甚至不被认可，虽然我个人觉得这个方向是非常有意义的。