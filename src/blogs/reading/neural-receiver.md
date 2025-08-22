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
2. 5G NR中 每个帧（frame）包含10个子帧，每个子帧维持1ms，每个子帧都被划分为时隙（slot），每个时隙包含14个OFDM符号，当调度了PDSCH或者PUSCH时会插入DMRS，可能DMRS就被配置在第四个OFDM符号上。时隙的长度取决于子载波间隔为： $T_{\text{slot}} = \frac{1 \, \text{ms}}{2\mu}$，这里的$\mu$越大，子载波间隔也就越大。
3. Transmission Time Interval（TTI） 在5G中可以时slot级别的也可以时mini-slot级别的，表示调度/传输的基本时间
4. Physical Resource Block 是频域资源调度的单位 一般是12个连续的子载波 一个时隙一般包含 12x14=168个Resource Elements
5. 信道估计的常见算法有LS、MMSE，我们在估计信道时还需要考虑导频开销以及效率的tradeoff；关于信道均衡则可以理解成对于信道抽样的插值恢复，本质都是信道计算的一部份。
6. 当然在基站接收了信号，会通过下行控制信道（PDCCH）向UE发送HARQ反馈（ACK/NACK）告知通信是否成功。
7. 无线环境中多径效应是如何仿真的？抽头延迟线（TDL）和通过簇延迟线（CDL）信道模型，其中前者将多径通过具有不同时延时、相位与功率的抽头描述，而后者是前者的优化，现实场景中多径不完全独立，而是会以cluster的组成到达。

---
图片补充：
<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/nr_DeepRx3.png" style="width: 700px; display: block; margin: 0 auto;" />
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
> 理清楚文章的主要思路 并提炼出核心创新点 以及对论文阅读总结心得
1. abstract
单看abstract最重要的信息无非以下几点
* 目前的无线电系统以及有了充分的理解以及行业认定的最优算法，与其对每个模块进行优化，不如对一个较为完整的系统进行整体优化
* 本文提出了一个 Deep Fully Convolutional Neural Networks,DeepRx实现了由频域信号到未编码比特流的信号处理，符合5G通信标准。

2. introduction
> related work and intro

从第一性原理出发：整个网络级别应用的性能基础是物理层的处理方式，本文的目标是通过机器学习在物理层发掘增益
通过related work 我们可以得知 常用的baseline包括 基于最小均方误差的MMSE传统接收机、基于线性最小二乘的接收机、基于MMSE的接收机和具有完美信道知识的理想辅助接收机。

在本篇文章中，第一个非常impressive的工作和点在于：**通过精心设计神经网络架构及其输入，可以实现更高的性能提升，但是允许神经网络利用未知数据符号及其分布来提高信道估计精度，能获得最大的增益**

本篇文章的主要贡献与工作：
* 性能最优接收机，从频域天线数据出发，完成了信道估计、均衡、软解映射
* 可以利用接收的数据符号与其分布，其所使用的训练方法帮助其很好的应对了非高斯噪声

3. System Model 




#### 2.2 A Neural Receiver for 5G NR Multi-user MIMO (NVIDA 2023)




#### 2.3 Design of a Standard-Compliant Real-Time Neural Receiver for 5G NR (NVIDA 2024)






