---
title_zh: 神经网络接收器
title_en: Neural Receiver
date: 2025-08-20
---

## Neural_Recevier 

> 本篇文章内基于3GPP release 18 New Topics中的Artificial Intelligence (AI)/Machine Learning (ML)的主题，内容包含此场景下通信理论的部分补充以及AI for Wireless中Neural Receiver的介绍。

### 1.OFDM 系统

#### 1.1 传统通信结构
> 虽然笔者是通信专业的学生，但是关于通信的知识自己目前的确只是一知半解的水平，如有错误，劳烦email笔者，感谢斧正

5G NR中，将信道区分为物理上行共享信道（PUSCH）和物理下行共享信道（PDSCH）是最常见的分析视角，这两者的主要区别在于信号传输的方向不同，其接收与发送端的结构与技术其实并没有大的区别。

我们在此需要注重的是，发送与接收端的原理，首先需要清楚一个完整的通信流程大致是怎么样的，举例如下

1. 在发送端，我们有一串比特流需要传输，首先会对其进行LDPC编码，并进行速率匹配，之后通过QAM等技术进行比特到符号的映射，这些符号会在传输时间间隔（TTI）内被分布在可用的物理资源块（PRB）上，之后我们常说的导频，也就是解调参考信号（DMRS）会被插入到特定的子载波中，之后将PRB输入到IFFT中，数据被转化为OFDM波形（频域->时域的理解：之所以是频域出发，是因为分配资源块时，实现了频域的幅值分配），在传输之前，我们还会给每一个OFDM符号的开头添加循环前缀（CP），用以减少符号间干扰。
2. 之后就是正常的信道传输 （衰弱+干扰）
3. 在接收端，（不考虑射频部分的接收）我们先去除掉循环前缀，进行FFT获得频域信息，这里分为两个大的部分，首先接收方会提取DMRS进行信道的估计，之后对整个原始信道估计进行插值，填充整个时隙网络，在这之后使用插值之后的信道估计对符号进行均衡（例如LMMSE均衡器），均衡后的符号会被送入解映射器，输出软比特或者对数似然比（LLR），LDPC译码之后就得到了预估比特流
整个流程还是非常清晰的，但是有一些小的细节和工程上的知识，在下面的补充中介绍

关于LDPC编码的详细理论，可以参考相关文献与博客。在5G NR系统中，OFDM技术的应用已经相当成熟。

---
补充：
1. LDPC编码是一种信道编码，信道编码的目的是增加冗余，用于检测与纠正错误，这里需要和信源编码区分，信源编码的目的是去除冗余，常用的有Huffman、Lempel-Ziv-Welch (LZW)、离散余弦变换（DCT）等。
2. 5G NR中 每个帧（frame）包含10个子帧，每个子帧维持1ms，每个子帧都被划分为时隙（slot），每个时隙包含14个OFDM符号，当调度了PDSCH或者PUSCH时会插入DMRS，可能DMRS就被配置在第四个OFDM符号上。时隙的长度取决于子载波间隔为： $T_{\text{slot}} = \frac{1 \ \text{ms}}{2\mu}$，这里的$\mu$越大，子载波间隔也就越大。
3. Transmission Time Interval（TTI） 在5G中可以时slot级别的也可以时mini-slot级别的，表示调度/传输的基本时间
4. Physical Resource Block 是频域资源调度的单位 一般是12个连续的子载波 一个时隙一般包含 12x14=168个Resource Elements
5. 信道估计的常见算法有LS、MMSE，我们在估计信道时还需要考虑导频开销以及效率的tradeoff；关于信道均衡则可以理解成对于信道抽样的插值恢复，本质都是信道计算的一部份。
6. 当然在基站接收了信号，会通过下行控制信道（PDCCH）向UE发送HARQ反馈（ACK/NACK）告知通信是否成功。
7. 无线环境中多径效应是如何仿真的？抽头延迟线（TDL）和通过簇延迟线（CDL）信道模型，其中前者将多径通过具有不同时延时、相位与功率的抽头描述，而后者是前者的优化，现实场景中多径不完全独立，而是会以cluster的组成到达。
8. 关于Cyclic Redundancy Check(CRC):CRC其在实际过程中与code block的概念高度相关，这里不是重点不加赘述
9. LMMSE（线性最小均方误差）和LS（最小二乘）算法通常用于通信接收中的信道估计步骤。两者的主要区别在于是否在知道信道统计特性的前提下进行信道估计。前者一般是LMMSE的性能上限，后者应用于实际LMMSE接收机。

这个环节出现在解码流程之后，CRC 算法的基本思想是将传输的数据当做一个位数很长的数。将这个数模二除以另一个数。得到的余数作为校验数据附加到原数据后面,而在实际应用中：
* 发送方和接收方在通信前，约定好一个预设整数作为除数
* 发送方在发送前根据原始数据和约定好的除数进行模二除法运算生成余数（即CRC码），然后将其附加到原始数据后面一起发送给接收方
* 接收方收到后将其模二除以约定好的除数，当且仅当余数为0时接收方认为没有差错。

具体实现网上有很多这里不浪费篇幅，需要注意的是CRC不是唯一映射m，对于一个设计良好的r位CRC，任何错误模式未被检测到的概率大约是$\frac{1}{2^r}$。同时CRC是HARQ（混合自动重传请求）的重要一环，ACK与NACK与补充(6)对应。

---
图片补充：
<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx3.png" style="width: 700px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">DMRS图解</span>
  </div>
</div>
ps:The considered DMRS/pilot configurations, illustrated for one PRB over the duration of a TTI. Note that in the forthcoming results the pilot
configurations are only differentiated in terms of how many OFDM symbols they utilize

---

#### 1.2 Neural Receiver
> Neural Receiver的发展情况，编年史形式
这个目前时间不太够，但是可以简单描述一下
上个世纪末和本世纪初的几年，上一次深度学习发展时期的部分学者尝试了使用神经接收机对无线信号进行处理，显然当时的技术与商业前景让研究人员将重点集中在理论而没有实际部署。

在近两年，随着3GPP release 18的发布，学界才重新重视起这个方向，基于现有的深度学习的技术发展，优化神经接收机理论并部署变得可行。

### 2.现有的方案
> 非常碎碎念的记录，并不是很工整
#### 2.1 DeepRx: Fully Convolutional Deep Learning Receiver (Bell Labs 2020)
> 本文接收于通信顶顶刊TWC，重点关注其在Wireless Communication上的贡献
> 本文主要解决提出了 端到端的神经接收机的整体优化相比于模块化优化更加有效，并提出让网络无限制的接触所有数据，而不是限制在导频上

##### 2.1.1. abstract
单看abstract最重要的信息无非以下几点
* 目前的无线电系统以及有了充分的理解以及行业认定的最优算法，与其对每个模块进行优化，不如对一个较为完整的系统进行整体优化
* 本文提出了一个 Deep Fully Convolutional Neural Networks,DeepRx实现了由频域信号到未编码比特流的信号处理，符合5G通信标准。

##### 2.1.2. introduction
> related work and intro

从第一性原理出发：整个网络级别应用的性能基础是物理层的处理方式，本文的目标是通过机器学习在物理层发掘增益
通过related work 我们可以得知 常用的baseline包括 基于最小均方误差的MMSE传统接收机、基于线性最小二乘的接收机、基于MMSE的接收机和具有完美信道知识的理想辅助接收机。

在本篇文章中，第一个非常impressive的工作和点在于：**通过精心设计神经网络架构及其输入，可以实现更高的性能提升，但是允许神经网络利用未知数据符号及其分布来提高信道估计精度，能获得最大的增益**

本篇文章的主要贡献与工作：
* 性能最优接收机，从频域天线数据出发，完成了信道估计、均衡、软解映射
* 可以利用接收的数据符号与其分布，其所使用的训练方法帮助其很好的应对了非高斯噪声

##### 2.1.3. System Model 
> 基于卷积神经网络的接收机.

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx4.png" style="width: 700px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">DeepRx's simulator architecture</span>
  </div>
</div>

图上信息课件，整个架构包含物理层的所有组件，本文限制了输入天线讨论在一个SIMO系统中

文章首先介绍了一下数据集以及信道集合的产生，之后分别介绍了传统通信模型是如何进行信道估计与均衡的

(1) 首先是接收信号，FFT之后接受的信号（频域信号）可以表示为：
$$y_{ij} =\mathbf{H}\_{ij} {x}\_{ij} + \mathbf{n}\_{ij}$$
其中$y_{ij} \in \mathbb{C}^{N_r \times 1}$和$x_{ij} \in \mathbb{C}$分别为接收与发射符号，
$H_{ij} \in \mathbb{C}^{N_r \times 1}$为是第 i 个 OFDM 符号在第 j 个子载波上的信道，$N_r$是接收天线的数量。 

(2) 之后传统接收机会使用已知的导频，假设各个子载波为频率平坦衰弱来估计信道：

$$\hat{H}_{ij} = y\_{ij} x\_{ij}^*, \quad (i, j) \in \mathcal{P} $$

其中 $\mathcal{P}$ 表示频网格中导频位置对应的索引集，$(\cdot)^*$ 表示共轭。然后对原始信道估计进行插值，以填充整个时频网格，从而为数据信号提供信道估计。这将得到数据信号和子载波索引集 $(i, j) \in \mathcal{D}$ 对应的信道估计 $\hat{H}_{ij} \in \mathbb{C}^{N_r \times 1}$。在信道估计阶段还会估计噪声（加干扰）功率 $\sigma_n^2$。

(3) 根据信道估计进行插值，从而实现均衡操作
然后使用插值后的信道估计对每个数据符号进行均衡。如上所述，所考虑的参考接收机架构中使用的是 LMMSE 均衡器，这意味着对于 $(i, j) \in \mathcal{D}$，均衡器输出为：
$$
\hat{x}\_{ij} = \left( \hat{H}\_{ij}^H \hat{H}\_{ij} + \sigma_n^2 I \right)^{-1} \hat{H}\_{ij}^H y\_{ij}
$$

其中 $\sigma_n^2$ 是噪声功率估计，$I$ 是单位矩阵，$(\cdot)^H$ 表示厄米共轭转置。

(4) 均衡之后的符号会被输入至解映射器，计算LLR（log likelihood Ratio）
具体而言基于符号估计 $\hat{x}_{ij}$ 进行操作，LLR定义为：

$$L_{ijl} \triangleq \log \left( \frac{\Pr(c_l = 0 | \hat{x}\_{ij})}{\Pr(c_l = 1 | \hat{x}\_{ij})} \right) 
$$
其中 $\Pr(c_l = b \mid \hat{x}\_{ij})$ 是给定观测符号 $\hat{x}\_{ij}$ 时，发射比特 $c_l$ 为 $b \in \{0, 1\}$ 的条件概率，$l = 0, \ldots, B - 1$，$B$ 是每个符号的比特数。假设均衡器消除了所有信道影响，只剩下高斯白噪声，则 LLR 可以通过以下方式很好地近似：
$$
L_{ijl} \approx \frac{1}{\sigma_n^2} \left( \min\_{x \in \mathcal{C}_l^1} \||\hat{x}\_{ij} - x\||_2^2 - \min\_{x \in \mathcal{C}_l^0} \||\hat{x}\_{ij} - x\||_2^2 \right)
$$
其中 $x \in \mathcal{C}_l^b$ 表示星座图 $\mathcal{C}$ 中第 $l$ 个比特为 $b \in \{0, 1\}$ 的那些点，$\sigma_n^2$ 则为噪声功率估计。在参考实现中，最终的 LLR 还会乘以所考虑子载波的信道幅度，以反映由于更严重的衰落导致的更高不确定性。

##### 2.1.4. Convolutional Neural Networks-Based Receiver
> 用神经网络替代传统架构中频域信号到LLR的过程

主要的设计原理有以下两点；
* 考虑到非静态环境和可能移动的用户设备（UEs），每个子载波和正交频分复用（OFDM）符号的频域信道系数都是不同的这种情况下物理信道在频率和时间上具有很强的局部相关性 ———— 因此我们采用全卷积神经网络
* 由于稀疏的导频符号仅提供信道的局部信息，我们允许网络利用未知数据及其已知分布来提高远离实际导频位置的 LLRs 估计精度。所以本文的思路让 CNN 不受限制地访问所有数据

DeepRx在三位数组上运行，其构建情况如下图：
<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx5.png" style="width: 400px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">DeepRx的输入结构</span>
  </div>
</div>

备注：需要注意的是，导频符号是混合在数据帧中一并传输的，导频参考信号是单独传输的。于此同时，导频位置可以有不同的配置，为了使得单个网络能够在多种导频配置下运行，前提是在训练期间向网络呈现过这些配置。

具体的网络结构结合ResNet去看，这里不做重点。

在训练时，有一个很tricky的方法，用于解决不同调制阶数的统一问题：
由于星座图中高阶的四个星座点可以被降维映射到低阶调制的一个星座点，利用这关系定义模型的输出，相同的输出比特（LLRs）对应星座图中相同的部分，比特数的增对应空间的精细。在实际部署时，输出固定为8个比特，但是根据实际信号的调制方式的不同，会进行动态的比特屏蔽，例如接受的是QPSK，算损失只算前两位比特，最终也只取前两位的LLRs传给解码器。

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx6.png" style="width: 350px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">比特映射机制示意图</span>
  </div>
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx7.png" style="width: 200px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">比特屏蔽机制示意图</span>
  </div>
</div>


##### 2.1.5. Generation of Training and Validaiton Data
> 关于数据的生成、结构介绍以及训练过程

数据集包含50万个TTI，参数的随机化针对于每个帧，一个帧包含10个TTI，SNR和SIR都会被随机化，干扰尽在部分结果中呈现。

众所周知，实际场景的信噪比更可能服从对数正态分布，但是文章选择均匀分布是为了提高训练效率。

关于DMRS，配置了多种对PRB的使用情况，可以分为“单导频”和“双导频”，传统的LMMSE只能在DMRS配置下正常工作，在本文中发现DMRS符号的位置对性能无显著影响，引入单导频只是为了评估极限性能。

在训练时与验证时，信道模型是不重叠的，这一设计可确保深度神经网络无法通过简单学习单个信道模型的特性来获得高性能。

此外，本文还使用完全合成的信道模型生成了一个较小的训练数据集。在该合成模型中，单个 OFDM 符号的信道为 7 抽头瑞利衰落信道。每个 OFDM 符号传输结束后，信道会随机变化：新信道方差的 90% 来自前一信道实现，10% 来自新随机生成的 7 抽头信道。这一设计确保了连续 OFDM 符号之间的信道具有一定相关性。该人工信道模型的目的并非模拟真实传播信道，而是在与真实 3GPP 信道模型保持差异的同时，捕捉无线信道的一些基本特性

在实验中，有两类误码率——未编码误码率和编码误码率：对编码误码率的研究可揭示 DeepRx 输出的 LLRs 是否能充分捕捉检测比特的不确定性，以满足 LDPC 解码需求；同时，由于在所用信道模型下，理想 LLRs 缺乏明确计算公式，难以直接评估其准确性，因此编码误码率也可作为 LLRs 自身准确性的间接衡量指标。

关于DeepRx高性能的探究？

(1) 信道时间追踪能力：探究未编码误码率和信道最大多普勒频移（与信道相干时间成反比）的关系。已知500hz的多普勒频偏对应的是非常严重的移动场景（135km/h）

(2) DeepRx不是通过学习信道模型获得优势：（补充：瑞利信道模型与3GPP信道模型完全独立）用瑞利信道模型训练DeepRx用3GPP信道验证，DeepRx的效果依旧优于LMMSE。

(3) 对位置数据的盲利用？

设置一种结构受限制的CNN架构，控制CNN是否可以获取完整的Rx数据数组，该结构受限制的CNN架构在一定程度上代表了现有基于深度学习的信道估计器，DeepRx与其的对比也可揭示 DeepRx 相对于这些早期深度学习辅助接收机的优势。

(4) 对数据符号分布的高级利用？

DeepRx 高性能的另一原因可能在于：它学会了利用数据符号的分布信息（例如已知的星座点）来跟踪信道在时间和频率维度的变化。
验证：在 TTI 的时频网格中，每个象限填充相同的符号，同时保留常规导频符号位置。对比了QPSK和16QAM的场景，QPSK场景下DeepRx的性能仅出现轻微下降，发现QAM由于符号的幅度和相位均用于编码信息（与 QPSK 仅通过相位编码信息不同），结果出现显著差异 —— 在人工符号分布下，DeepRx 无法提供足够性能；而受限制的 CNN 接收机（因无法同时观察多个符号，无法学习利用数据符号分布）的性能反而明显优于无限制的DeepRx架构，这说明DeepRx 通过学习依赖数据符号分布。文章推测DeepRx 通过学习依赖数据符号分布，实现了某种局部幅度归一化或幅度跟踪，以准确均衡信道幅度响应，符号分布被破坏引起的性能失效主要与符号幅度相关，暗示 DeepRx 可能学习到了类似著名恒模算法（CMA）的盲均衡方案

(5)与迭代接收机进行对比

假设：DeepRx利用了合法的星座点信息——这种思想和迭代接收机很相似，作者设计了一个实验证明DeepRx和迭代接收机可以利用未知数据符号进行信道估计。

迭代接收机的基本流程：先通过单个导频符号进行初始信道估计并均衡 RX 符号，再利用先前的 RX 符号判决计算新的信道估计；随后将优化后的信道估计在整个 TTI 内取平均，用于再次均衡 RX 符号。该过程重复 40 次以确保收敛。

需要注意的是，此版本的 DeepRx 采用含均匀随机符号的常规数据训练。

**消融实验**
> 通过消融实验探究架构与性能之间的关系

这里就是实验比较多，需要注意的一点是：得益于全卷积架构，是的在对处理数据的TTI扩展时计算复杂度是线性上升的。
结论性：DeepRx 的理论渐近复杂度与 LMMSE 接收机相似；但 DeepRx 的常数系数更大（渐近表达式中未体现），因此实际应用中 DeepRx 的计算成本可能高于 LMMSE 接收机，尽管其无线电性能更优。

本工作已被原作者推广至MIMO场景:
[6] D. Korpi, M. Honkala, J. M. Huttunen, and V. Starck, “DeepRx MIMO: Convolutional MIMO Detection with Learned Multiplicative Transformations,” in ICC 2021-IEEE International Conference on Communications. IEEE, 2021, pp. 1–7.

#### 2.2 DeepRx MIMO: Convolutional MIMO Detection with Learned Multiplicative Transformations

##### 2.2.1 Abstract and Introduction
深度学习用于无线接收物理层性能提升的解决方案之一，大多数研究没有在MIMO的空间复用场景下展开探索。本文提出一种基于ResNet与一个transformation layer构成的网络结构，本文有两种实现方案：一种是最大比合并（maximal ratio combining）与完全基于学习的变化,并将其前置到原始 DeepRx 架构的输入端。

MIMO场景需在均衡与符号检测阶段分离多个重叠的空间流，本文将证明，让神经网络从数据中自主学习所有信息是更优的方案。

##### 2.2.2  System Model
本文探讨的是OFDM的MIMO系统，包含 $N_T$ 个层(spatial streams)与 $N_R$ 个接收天线，设定一个TTI内的OFDM符号数为 $S=14$ 个, $F$ 表示子载波数
5G 系统支持采用码分复用（CDM）为所有层提供可分离的导频(为不同的层分配不同的正交覆盖码)

##### 2.2.3 DeepRx MIMO Receiver with Expert Knowledge-based Transformation Layer
将 DeepRx 架构扩展至多输入多输出（MIMO）场景时，输入与输出数组定义如下：
- 接收数据信号表示为 $Y \in \mathbb{C}^{F \times S \times N_R}$；
- 原始信道估计值表示为 $\hat{H} \in \mathbb{C}^{F \times S \times N_R \times N_T}$，其中每个 $N_R \times N_T$ 子数组对应相应资源单元的最终原始估计值 $\hat{H}_{ij}$。

与基准接收机不同，DeepRx 采用极为简单的最近邻插值法：对于每个数据资源单元 $(i, j) \in \mathcal{D}$，其信道估计值通过选取最近的导频承载资源单元 $(i, j) \in \mathcal{P}$ 的原始估计值确定。

最朴素的想法：信道重塑为 $F \times S \times \N_R \times N_T $ ，但实验证明本架构在高阶MIMO场景性能一般，因为分离不同 MIMO 层的难度远高于无空间复用的信号检测，可以扩展网络。

文章提出了两种可与任意神经网络接收机结合的新型变换层

- 基于最大比合并（MRC）的预处理，采用可学习虚拟空间流；
- 完全基于学习的乘法变换 / 预处理


#### 2.3 A Neural Receiver for 5G NR Multi-user MIMO
> NVIDIA Arxiv 2023

##### 2.3.1 Abstract and Introduction
实现了MU-MIMO接收机，符合PUSCH标准，架构结合卷积层与图神经网络，前者处理时频相关性,后者处理多用户场景。

DeepRx几乎是行业最早(2021)提出基于神经网络（NN）且完全符合 5G 新空口（5G NR）标准的接收机，并在同年将SIMO系统推广到了MIMO系统，两篇文章分别发表在了TWC和ICC上。但是在2017年，有学者就提出了基于CNN的OFDM检测接收机算法。

在DeepRx同年，有学者将发与收合并为一个End2End模型，甚至实现了无导频通信，2022年，面向IoT设备的NR也被验证。
但是目前对MU-MIMO的研究，研究人员都有很多局限于理想信道状态信息，而忽略了隐式信道估计。

本文的主要工作在于：
1. 神经网络架构实现了对可变用户数量和可配置子载波数量的适应性
2. 训练权重仅需不到100万，且PRB在数量上具有可变性
本文需要解决的一个实际挑战是如何防止模型过拟合


##### 2.3.2 Neural Multi-user MIMO OFDM Receiver
在5G NR场景下，配备多根天线的用户可以传输多个MIMO Layer（数据流），一个用户可以对应多个层，记构成Resource Grid的OFDM符号数为$N_S$，子载波数为$N_F$，对于第$n_T$层其被分配的RE为[$n_F$,$n_S$], 此层上传输一个长度为$m$的比特向量$b_{n_F, n_S, n_T} \in \{0, 1\}^m$，之后通过格雷码的m阶QAM完成映射，针对多根发射天线还可以诶应用MIMO预编码技术。整个资源网络如下：
$$
X\_{n\_T} = \begin{bmatrix}
x\_{1,1,n\_T} & \cdots & x\_{1,N\_S,n\_T} \\\\
\vdots & \ddots & \vdots \\\\
x\_{N\_F,1,n\_T} & \cdots & x\_{N\_F,N\_S,n\_T}
\end{bmatrix}
$$

当然还要分配DMRS导频资源等等，以及CP，以及接收信号都是正常的模型，为了节省时间就不care具体公式了。

**我们重点关注接收机架构**

下面的算法实现了下图的神经接收机，该接收机对整个时隙的数据进行处理，可一次性完成所有层传输比特的估计。
<div style="display: flex; justify-content: center; align-items: flex-start; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx8.png" style="width: 400px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">Neural MU-MIMO Receiver 架构图</span>
  </div>
</div>


---

$$
\begin{aligned}
\textbf{Algorithm 1: } \text{Neural MU-MIMO receiver} \\\\
\textbf{Input: } 
& \text{Number of iterations } N_{\mathrm{it}},\;
  \text{Number of layers } N_T, \\\\
& \text{Received post-FFT signal } \mathbf{Y}\in\mathbb{C}^{N\_F,N\_S,N\_{Rx}}, \\\\
& \text{Pos. encoded pilot distance } \mathbf{P}\_{n\_T}\in\mathbb{R}^{N\_F,N\_S,2}\ \text{for each layer } n\_T, \\\\
& \text{[Optional] Noise PSD } N\_0\in\mathbb{R}^{N\_F,N\_S,N\_{Rx}}\ \text{in dB} \\\\
\textbf{Output: } 
& \text{Soft-estimate } {\ell}\in\mathbb{R}^{N\_F,N\_S,N\_T,m}\ \text{for each coded bit per layer} \\\\[4pt]
\textbf{for } n\_T=0,\ldots,N\_T-1 \\\\
& \hat{\mathbf{H}}\_{n\_T}\leftarrow \mathrm{LS\_estimate}(\mathbf{Y},n\_T)
\quad \text{\# Initial LS estimation \& interpolation} \\\\
& \mathbf{S}^{(0)}\_{n\_T}\leftarrow \mathrm{CNN}\_{\mathrm{init}}
(\mathbf{Y},\mathbf{P}\_{n\_T},N\_0,\hat{\mathbf{H}}\_{n\_T}) \\\\[2pt]
\textbf{for } t=0,\ldots,N\_{\mathrm{it}}-1 \\\\
\quad \textbf{for } n\_T=0,\ldots,N\_T-1 \\\\
& \mathbf{m'}^{(t)}\_{n\_F,n\_S,n\_T}\leftarrow 
\mathrm{MLP}^{(t)}\_{\mathrm{MP}}(\mathbf{S}^{(t)}\_{n\_F,n\_S,n\_T})
\quad \forall n\_F,n\_S \\\\
& \mathbf{m}^{(t)}\_{n\_F,n\_S,n\_T}\leftarrow 
\frac{1}{N\_T-1}\!\sum_{n\_T'\neq n\_T}\mathbf{m'}^{(t)}\_{n\_F,n\_S,n\_T'}
\quad \forall n\_F,n\_S \\\\
& \mathbf{S}^{(t+1)}\_{n\_T}\leftarrow 
\mathrm{CNN}\_{\mathrm{state}}(\mathbf{M}\_{n\_T},\mathbf{P}\_{n\_T},\mathbf{S}^{(t)}\_{n\_T}) \\\\[2pt]
\textbf{for } n\_T=0,\ldots,N\_T-1 \\\\
& {\ell}\_{n\_F,n\_S,n\_T}\leftarrow 
\mathrm{MLP}^{(N\_{\mathrm{it}})}\_{\mathrm{readout}}
(\mathbf{S}^{(N\_{\mathrm{it}})}\_{n\_F,n\_S,n\_T})
\quad \forall n\_F,n\_S \\\\[2pt]
\textbf{return } {\ell}
\end{aligned}
$$

---