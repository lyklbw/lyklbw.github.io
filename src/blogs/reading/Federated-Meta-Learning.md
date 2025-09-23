# Federated Meta-Learning 
## 1.Federated Meta-Learning with Fast Convergence and Efficient Communication

### 1.1 Abstract

不使用全局模型而是用一个参数化算法（元学习器）

### 1.2 Introduction

联邦学习以分布式方式部署极具诱惑，但是面临两个问题：
* 统计挑战：去中心化的数据是非独立同分布的、高度个性化且异构的
* 系统挑战：设备数量通常比传统分布式设置中的设备数量多几个数量级

基于初始化的元学习算法（MAML、Reptile等）以快速适应新任务和良好的泛化能力而闻名，这使其特别适合联邦学习场景，因为在联邦学习中，去中心化的训练数据是非独立同分布的且高度个性化。

元学习使得模型在经过少量梯度下降步骤后，能够在有限样本的新任务上达到最佳性能，元学习算法背后的直觉是提取和传播先前任务的内部可迁移表示。因此，它们可以防止过拟合并提高在新任务上的泛化能力。

### 1.3.Federated Meta-Learning

#### 1.3.1The Meta-Learning Approach

元学习的目标是训练出一个算法A，该算法可以快速的为新任务布置训练模型。算法 $A_\varphi$ 通常是参数化的，$\varphi$ 在元训练过程中通过一系列任务更新，一个任务 $T$ 由支持集 $D_S^T = \left\{ (x_i, y_i) \right\}_{i=1}^{|D_S^T|}$ 与查询集 $D_Q^T = \left\{ (x'_i, y'_i) \right\}_{i=1}^{|D_Q^T|}$ 组成，算法A在支持集上训练f，输出参数 $\theta_T$，此为内更新；$f_{\theta_T}$在查询集上进行评估，计算损失函数 $\mathcal{L}_{D_Q^T}(\theta_T)$反映 $A_\varphi$ 的训练能力，之后更新    $A_\varphi$ 最小化损失，此为外更新。

需要注意的是支持集和查询集相互独立可以最大化 $A_\varphi$ 的泛化能力，元训练以 episodic 的方式进行，其中在每个 episode 中，从元训练集上的任务分布 $\mathcal{T}$ 中采样一批任务。因此，算法    $A_\varphi$ 的优化目标如下:

$$
\min_\phi \mathbb{E}_{\mathcal{T} \sim \mathcal{T}} \left[ \mathcal{L}_{D_Q^T} (\theta_T) \right] = \min_\phi \mathbb{E}_{\mathcal{T} \sim \mathcal{T}} \left[ \mathcal{L}_{D_Q^T} \left( A_\phi (D_S^T) \right) \right]
$$

总的来说：
1. 输入：支持集 $D_S^T$
2. 输出：任务特定参数 $\theta_T\$
3. 参数化：通过 $\varphi$ 参数化
4. 可微性：支持端到端训练
5. 快速适应：能够用少量样本快速学习

具体的算法包含MAML、Reptile等，于此同时还可以进一步学习初始化 $\theta$ 与内学习率 $\alpha$ 。

如何协同学习？

将元学习融入联邦学习框架中。目标是利用分布在客户端的数据协同元训练一种算法。以 MAML 为例，我们旨在通过联合使用所有客户端的数据来训练模型的初始化。MAML 包含两个层次的优化：内循环使用维护的初始化来训练特定任务的模型，外循环使用任务的测试损失来更新初始化

此过程中传输的信息包括模型参数初始化（从服务器到客户端）和测试损失（从客户端到服务器），不需要将数据收集到服务器。对于 Meta-SGD，向量 α 也作为算法参数的一部分进行传输，并用于内循环模型训练


## 2.Learning to Demodulate From Few Pilots via Offline and Online Meta-Learning

### 2.1Abstract
研究了一种物联网（IoT）场景，其中设备通过衰落信道零星传输带有少量导频符号的短分组.设备具有独特的传输非理想特性，例如 I/Q 不平衡。导频的数量通常不足以准确估计端到端信道，而端到端信道包含衰落和传输侧失真的影响。

元学习学习的是一个解调器，解调器能通过少量的导频快速适应新的端到端信道条件。常用的元学习方法有：模型无关元学习（MAML）、一阶 MAML（FOMAML）、REPTILE 和基于元学习的快速上下文适应（CAVIA）。

本文还开发了离线与在线方案。在在线方案中，提出了一种集成的在线元学习和自适应导频数选择方案

### 2.2Introduction
大多数通信链路使用导频序列来估计 CSI，然后将其代入具有理想接收 CSI 的最优接收器中，但是如果出现以下情况，这种基于模型的标准方法将不适用：（i）缺乏准确的信道模型；以及 / 或者（ii）给定传输方案和信道的最优接收器复杂度极高或未知。

1. Federated Meta-Learning with Fast Convergence and Efficient Communication
2. Learning to Demodulate From Few Pilots via Offline and Online Meta-Learning

通讯

对于干扰 FDD TDD
GNN + Federated Learning
incremental
干扰是怎么形成的，如何用机器学习的方法解决。
大颗粒思考问题

看学姐的切片文章

问题：

传统的SIMO->MIMO神经网络本身

---
现有问题：
1. 协作周期过长，无法快速优化与部署
2. 对于高异构化场景的泛化与学习边界的讨论没有研究
3. 对于资源消耗，资源的占用没有被讨论
4. 目前的元学习接收机针对于相干时间内的任务，只能处理简单的信道连续变化（神经网络非常非常浅）
ituitive:
1. 异构性越高，越可以视为不同的任务
2. 仅需低数量的训练样本即可快速部署，符合内训练的范式
3. 

所以我们解决的贡献在于：
1. 提出基于元学习的聚类联邦学习，获取更多信道信息，提升神经接收机能力。
2. 探讨高异构性的信道结构的协作边界，每个设备在存储、计算和通信能力方面可能存在显著限制，不同计算能力的基站同步问题 by 聚类联邦学习。
3. 对其他指标的探究——资源消耗、占用，指导实际部署。