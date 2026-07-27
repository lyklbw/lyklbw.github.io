---
title_zh: MU-MIMO
title_en: MU-MIMO
date: 2025-08-27
---

# MU-MIMO
> 带着问题去学习知识（在已经有一定的知识基础的情况下）

要搞清楚MU-MIMO的工作细节，首先要和已知的技术进行对比，首先我们要了解SIMO和MIMO的不同，这里引发思考MIMO是如何提升信道传输的能力的？

#### Q1:MIMO对比SIMO是如何实现的性能提升
> 其实这里是老生常谈了

1. 空间复用 （speed）
2. 分集增益 （reliability）
3. 波束成形

1.空间复用

我们自然要从具体的建模角度来理解为什么有效

我们考虑一个点对点的MIMO系统，具有$N_t$根发射天线和$N_r$根接收天线。基带等效模型可以写为：

$$
\mathbf{y} = \mathbf{Hx} + \mathbf{n}
$$

唯一需要提醒的是 $\mathbf{H} \in \mathbb{C} ^ {N\_r \times N\_t}$ 的维度与SIMO不同

对信道矩阵 $\(\mathbf{H}\)$ 进行SVD：

$$
\mathbf{H} = \mathbf{U} \Sigma \mathbf{V}^H
$$

其中：

- $\\mathbf{U} \in \mathbb{C}^{N_r \times N_r}\$ 和 $\mathbf{V} \in \mathbb{C}^{N_t \times N_t}\$ 是酉矩阵。
- $\Sigma \in \mathbb{R}^{N_r \times N_t}$ 是一个对角矩阵，其对角元素是非负的奇异值 $\sigma_1 \geq \sigma_2 \geq \ldots \geq \sigma_{\min(N_t, N_r)} \geq 0$。非零奇异值的个数 $r = \text{rank}(\mathbf{H}) \leq \min(N_t, N_r)$。

我们对发射和接收信号进行预处理和后处理
1. $\tilde{\mathbf{x}} = \mathbf{V}^H \mathbf{x}$ （发射预编码）
2. $\tilde{\mathbf{y}} = \mathbf{U}^H \mathbf{y}$ （接收 shaping）
3. $\tilde{\mathbf{n}} = \mathbf{U}^H \mathbf{n}$ （噪声变换）

原模型变换如下：

$$
\mathbf{U}^H \mathbf{y} = \mathbf{U}^H \mathbf{U} \Sigma \mathbf{V}^H \mathbf{x} + \mathbf{U}^H \mathbf{n}
$$

$$
\tilde{\mathbf{y}} = \Sigma \tilde{\mathbf{x}} + \tilde{\mathbf{n}}
$$

由于 $\mathbf{U}$ 和 $\mathbf{V}$ 是酉矩阵，它们不改变噪声的统计特性（$\tilde{\mathbf{n}} \sim \mathcal{CN}(0, \sigma_n^2 \mathbf{I}_{N_r})$）和信号的功率约束（$\mathbb{E}[\tilde{\mathbf{x}}^H \tilde{\mathbf{x}}] = P$）。

这个变换后的系统是一个等效的并行高斯信道：

$$
\tilde{y}_i = \sigma_i \tilde{x}_i + \tilde{n}_i, \quad i = 1, 2, \ldots, r
$$

上述等效模型将 MIMO 信道分解成了 \( r \) 个独立的、并行的子信道，每个子信道的功率增益是 \( \sigma_i^2 \)。每个子信道的容量是：

$$
C_i = \log_2 \left( 1 + \frac{P_i \sigma_i^2}{\sigma_n^2} \right) \text{ bits/s/Hz}
$$

其中 \( P_i \) 是分配给第 \( i \) 个子信道的功率，满足总功率约束 \(\sum_{i=1}^r P_i = P\)。

整个 MIMO 信道的总容量是这些并行子信道容量之和。为了最大化总容量，我们需要在所有子信道上进行注水功率分配。

$$
C_{\text{MIMO}} = \max_{\{P_i\} : \sum P_i = P} \sum_{i=1}^r \log_2 \left( 1 + \frac{P_i \sigma_i^2}{\sigma_n^2} \right)
$$

**注水功率分配**的最优解为：(马太效应)

$$
P_i^{\text{opt}} = \left( \mu - \frac{\sigma_n^2}{\sigma_i^2} \right)^+, \quad \text{其中} \ (x)^+ = \max(0, x)
$$

参数 $\mu$ 的选择需满足总功率约束 $\sum_{i=1}^r P_i^{\text{opt}} = P$。

可以证明，在平均意义上容量随 $\min(N_t, N_r)$ 线性增长。当空间是富散射时，我们可以得到最大的空间复用增益。

2.分集增益

分集的核心思想是：为同一份信息提供多个独立的、或者高度不相关的传输路径。

对于一个通信系统，其平均误码率（BER）或误符号率（SER）在高信噪比条件下可以近似为：

$$P_e \approx c \cdot \text{SNR}^{-d}$$

其中 $c$ 是一个常熟，而 $d$ 为分集阶数(Diversity Order)

我们用一个2×1 系统（即2根发射天线，1根接收天线，也称为发射分集，当然还要时间分集等等）来具体说明。最经典的方案是Alamouti空时码

Alamouti方案的编码矩阵是：

$$
\mathbf{C} = \begin{bmatrix} s_1 & s_2 \\\\ -s_2^* & s_1^* \end{bmatrix}
$$

接收信号为：
$$
r_1 = h_1 s_1 + h_2 s_2 + n_1
$$

$$
r_2 = -h_1 s_2^* + h_2 s_1^* + n_2
$$

接收端把两个时隙的观测组合成向量：

$$
\mathbf{r} = \begin{bmatrix} r_1  \\\\ r_2^* \end{bmatrix} = \begin{bmatrix} h_1 & h_2 \\\\ h_2^* & -h_1^* \end{bmatrix} \begin{bmatrix} s_1 \\\\ s_2 \end{bmatrix} + \begin{bmatrix} n_1 \\\\ n_2^* \end{bmatrix}.
$$

解码时，接收机只需做：

$$
\hat{\mathbf{s}} = (H^H H)^{-1} H^H \mathbf{r}
$$

由于 \( H^H H = (|h_1|^2 + |h_2|^2)I \)，所以解码非常简单：

$$
\tilde{s}_1 = h\_1^* y\_1 + h\_2 y\_2^*
$$

$$
= h_1^* (h_1 s_1 + h_2 s_2 + n_1) + h_2 \left( -h_1 s_2^* + h_2 s_1^* + n_2 \right)^*
$$

$$
= (|h\_1|^2 + |h\_2|^2)s\_1 + (h\_1^* n\_1 + h\_2 n\_2^*)
$$

最后再除以能量因子 $ |h_1|^2 + |h_2|^2 $，就得到对 $ s_1, s_2 $ 的估计。

最终的判决信噪比是两个信道增益的平方和乘以原始信噪比，提醒：在瑞利衰落下，$|h_i|^2$ 服从指数分布）


#### Q2:SIMO和MIMO与MU-MIMO对应的神经接收机之间的区别


#### Q2：MU-MIMO如何实现?
传统的5G NR下基站可以向多个或者一个用户传输多个layer，每个layer对应一个空间流，对应一个独立的数据序列，不同layer线性叠加，由预编码矩阵编码后发送

但是需要保证信道矩阵有足够的秩，需要CSI构建解码矩阵



---

ps: 

1.接收端和发送端对信道的认识

在真实场景中，接收端一般是具备CSI的估计功能的（来源于导频提供的吸到信息），无擦好主要来源于导频的密度，1-pilot/2-pilot、以及信道本身的变化快慢。

而发送端若采用FDD(频分双工),则无法直接感知下行信道，需要UE反馈给基站；若采用TBB(时分双工)，依赖于信道互易性(channel reciprocity)发射端可以通过上行导频推测下行信道。

2.信道容量与互信息量的计算（信息论太久没用了啊啊啊）

信道容量 $C$ 是指在给定信道条件下，能够无误传输的最大信息速率。而互信息量在信道容量的计算中起关键作用：
通过选择合适的输入分布（编码）$p(\mathbf{x})$ 可以最大化互信息量，从而最大化信道容量。
$$
C = \max_{p(\mathbf{x})} I(\mathbf{x}; \mathbf{y})
$$

互信息量衡量两个随机变量的依赖程度；而熵衡量单个变量的不确定性；联合熵标识两者的总不确定性；条件熵反映了在知道一个变量的情况下，另一个变量的不确定性
$$
I(X; Y) = H(X) + H(Y) - H(X, Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)
$$

3.关于真实的信道场景建模

* 瑞利衰落 (Rayleigh Fading)： 在富散射环境中，没有主导的视距（LoS）路径，$h_{ij}$ 可以建模为独立的零均值循环对称复高斯随机变量
* 莱斯衰落 (Rician Fading)： 如果存在一个稳定的LoS路径，$\mathbf{H}$ 可以建模为一个常数矩阵（LoS分量）和一个随机矩阵（非视距NLoS分量）之和: 
$\mathbf{H} = \sqrt{\frac{K}{K+1}} \mathbf{H}\_{\text{LoS}} + \sqrt{\frac{1}{K+1}} \mathbf{H}\_{\text{NLoS}}$ ，其中$\mathbf{K}$ 为莱斯因子。

4.什么是酉矩阵？

实数域下的正交矩阵（Orthogonal Matrix），在复数域下对应酉矩阵（Unitary Matrix）
酉矩阵的逆矩阵等于它的共轭转置
$$\mathbf{U}^{-1} = \mathbf{U}^{\dagger} $$

而复数协方差矩阵对应的是Hermitian 半正定矩阵
$$\mathbf{R} = \mathbf{R}^H $$

5.信道衰落

1. 路径损耗（Path Loss）: 确定性平均趋势，不会随机波动
2. 阴影衰落（Shadow Fading）: 慢衰落 对数正态（log-normal）。
3. 多径衰落（Multipath Fading）: Rayleigh / Ricean / Nakagami

6.关于MCS(Modulation and Coding Scheme)

---


