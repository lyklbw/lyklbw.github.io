## Neural_Receiver 

> This article is based on the Artificial Intelligence (AI)/Machine Learning (ML) theme from the 3GPP Release 18 New Topics. It includes supplementary information on communication theory in this context, as well as an introduction to Neural Receivers in AI for Wireless.
>
> This blog is originally written in Chinese. Translated by Gemini Pro.

### 1. OFDM System

#### 1.1 Traditional Communication Structure
> Although the author is a communications major, my current knowledge of communications is admittedly somewhat superficial. If there are any errors, please email me; I appreciate your corrections.

In 5G NR, distinguishing the channel into the Physical Uplink Shared Channel (PUSCH) and the Physical Downlink Shared Channel (PDSCH) is the most common analytical perspective. The main difference between the two lies in the direction of signal transmission; the structures and technologies at the transmitting and receiving ends do not actually have major differences.

What we need to focus on here are the principles of the transmitting and receiving ends. First, we need to understand what a complete communication process generally looks like. For example:

1. At the transmitting end, we have a bitstream to transmit. First, it undergoes LDPC coding and rate matching. Then, bits are mapped to symbols using techniques like QAM. These symbols are distributed across available Physical Resource Blocks (PRBs) within a Transmission Time Interval (TTI). After that, what we commonly call pilots, namely the Demodulation Reference Signal (DMRS), are inserted into specific subcarriers. The PRBs are then input into an IFFT, converting the data into an OFDM waveform (understanding frequency domain -> time domain: the reason it starts from the frequency domain is that when allocating resource blocks, amplitude allocation in the frequency domain is achieved). Before transmission, a Cyclic Prefix (CP) is added to the beginning of each OFDM symbol to mitigate inter-symbol interference.
2. Next is the normal channel transmission (fading + interference).
3. At the receiving end (ignoring the RF portion of reception), we first remove the cyclic prefix and perform an FFT to obtain frequency domain information. This is divided into two main parts: first, the receiver extracts the DMRS for channel estimation. Then, the initial channel estimates are interpolated to populate the entire time-frequency grid. After this, the interpolated channel estimates are used to equalize the symbols (e.g., using an LMMSE equalizer). The equalized symbols are fed into a demapper, which outputs soft bits or Log-Likelihood Ratios (LLRs). After LDPC decoding, the estimated bitstream is obtained.

The entire process is quite clear, but there are some minor details and engineering knowledge, which will be introduced in the supplementary section below.

For detailed theories on LDPC coding, you can refer to relevant literature and blogs. In the 5G NR system, the application of OFDM technology is already quite mature.

---
Supplementary:
1. LDPC coding is a type of channel coding. The purpose of channel coding is to add redundancy for error detection and correction. This needs to be distinguished from source coding, whose purpose is to remove redundancy (common ones include Huffman, Lempel-Ziv-Welch (LZW), Discrete Cosine Transform (DCT), etc.).
2. In 5G NR, each frame contains 10 subframes, and each subframe lasts for 1 ms. Each subframe is divided into slots, and each slot contains 14 OFDM symbols. When PDSCH or PUSCH is scheduled, DMRS is inserted; for instance, DMRS might be configured on the fourth OFDM symbol. The slot length depends on the subcarrier spacing: $T_{\text{slot}} = \frac{1 \ \text{ms}}{2^\mu}$. The larger $\mu$ is, the larger the subcarrier spacing.
3. The Transmission Time Interval (TTI) in 5G can be at the slot level or mini-slot level, representing the basic time unit for scheduling/transmission.
4. A Physical Resource Block (PRB) is the unit of frequency domain resource scheduling, typically consisting of 12 consecutive subcarriers. A slot generally contains 12x14=168 Resource Elements.
5. Common algorithms for channel estimation include LS and MMSE. When estimating the channel, we also need to consider the tradeoff between pilot overhead and efficiency. Channel equalization can be understood as interpolation recovery for channel sampling, both of which are fundamentally parts of channel computation.
6. Of course, after the base station receives the signal, it sends HARQ feedback (ACK/NACK) to the UE via the Physical Downlink Control Channel (PDCCH) to inform whether the communication was successful.
7. How is the multipath effect simulated in a wireless environment? Through Tapped Delay Line (TDL) and Clustered Delay Line (CDL) channel models. The former describes multipath through taps with different delays, phases, and powers, while the latter is an optimization of the former. In realistic scenarios, multipaths are not completely independent but arrive in clusters.
8. Regarding Cyclic Redundancy Check (CRC): In practice, CRC is highly correlated with the concept of code blocks. This is not the main focus here, so I will not elaborate.
9. LMMSE (Linear Minimum Mean Square Error) and LS (Least Squares) algorithms are commonly used in the channel estimation step of communication reception. The main difference between the two lies in whether channel estimation is performed with prior knowledge of the channel's statistical properties. The former generally serves as the performance upper bound for LMMSE, while the latter is applied in practical LMMSE receivers.

This step occurs after the decoding process. The basic idea of the CRC algorithm is to treat the transmitted data as a very long number. This number is modulo-2 divided by another number. The resulting remainder is appended to the original data as check data. In practical applications:
* Before communication, the sender and receiver agree on a preset integer to act as the divisor.
* Before transmission, the sender performs a modulo-2 division based on the original data and the agreed-upon divisor to generate a remainder (i.e., the CRC code), which is then appended to the original data and sent to the receiver together.
* Upon receiving the data, the receiver performs a modulo-2 division using the agreed-upon divisor. The receiver assumes there are no errors if and only if the remainder is 0.

There are many implementations available online, so I won't waste space here. It should be noted that CRC is not a unique mapping $m$. For a well-designed $r$-bit CRC, the probability of any error pattern going undetected is approximately $\frac{1}{2^r}$. Furthermore, CRC is a crucial component of HARQ (Hybrid Automatic Repeat Request), with ACK and NACK corresponding to supplementary point (6).

---
Image Supplementary:
<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx3.png" style="width: 700px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">DMRS Illustration</span>
  </div>
</div>
ps:The considered DMRS/pilot configurations, illustrated for one PRB over the duration of a TTI. Note that in the forthcoming results the pilot
configurations are only differentiated in terms of how many OFDM symbols they utilize

---

#### 1.2 Neural Receiver
> The development status of Neural Receivers, in a chronicle format

There isn't quite enough time for this right now, but I can briefly describe it.
In the late 1990s and the first few years of this century, during the previous wave of deep learning development, some scholars attempted to use neural receivers to process wireless signals. Obviously, the technology and commercial prospects at the time led researchers to focus heavily on theory rather than practical deployment.

In the past two years, with the publication of 3GPP Release 18, the academic community has once again begun to emphasize this direction. Based on current technological developments in deep learning, optimizing and deploying neural receiver theory has become feasible.

### 2. Existing Solutions
> Very rambling notes, not particularly neat.

#### 2.1 DeepRx: Fully Convolutional Deep Learning Receiver (Bell Labs 2020)
> This paper was accepted by TWC, a top-tier communications journal. We will focus on its contributions to Wireless Communication.
> This paper primarily proposes that the holistic optimization of an end-to-end neural receiver is more effective than modular optimization, and suggests allowing the network unrestricted access to all data, rather than limiting it strictly to pilots.

##### 2.1.1. abstract
Looking solely at the abstract, the most important information is nothing more than the following points:
* Current radio systems are fully understood and have industry-recognized optimal algorithms. Instead of optimizing each module individually, it is better to perform holistic optimization on a more complete system.
* This paper proposes a Deep Fully Convolutional Neural Network, DeepRx, which achieves signal processing from frequency domain signals to uncoded bitstreams, complying with 5G communication standards.

##### 2.1.2. introduction
> related work and intro

Starting from first principles: the performance foundation of entire network-level applications lies in the processing methods at the physical layer. The goal of this paper is to unearth gains at the physical layer through machine learning.
From the related work, we can see that common baselines include traditional MMSE receivers based on minimum mean square error, receivers based on linear least squares, MMSE-based receivers, and ideal genic-aided receivers with perfect channel knowledge.

In this article, the first very impressive work and point is: **By carefully designing the neural network architecture and its inputs, higher performance improvements can be achieved; however, the maximum gain is obtained by allowing the neural network to utilize unknown data symbols and their distributions to improve channel estimation accuracy.**

The main contributions and work of this paper:
* A performance-optimal receiver that, starting from frequency domain antenna data, accomplishes channel estimation, equalization, and soft demapping.
* It can utilize received data symbols and their distributions, and the training method employed helps it effectively handle non-Gaussian noise.

##### 2.1.3. System Model 
> A receiver based on Convolutional Neural Networks.

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx4.png" style="width: 700px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">DeepRx's simulator architecture</span>
  </div>
</div>

As seen in the image, the entire architecture contains all the components of the physical layer. This paper restricts the discussion of input antennas to a SIMO system.

The paper first introduces the generation of the dataset and channel set, and then separately describes how traditional communication models perform channel estimation and equalization.

(1) First is the received signal. After FFT, the received signal (frequency domain signal) can be expressed as:
$$y_{ij} =\mathbf{H}\_{ij} {x}\_{ij} + \mathbf{n}\_{ij}$$
Where $y_{ij} \in \mathbb{C}^{N_r \times 1}$ and $x_{ij} \in \mathbb{C}$ are the received and transmitted symbols respectively,
$H_{ij} \in \mathbb{C}^{N_r \times 1}$ is the channel of the $i$-th OFDM symbol on the $j$-th subcarrier, and $N_r$ is the number of receiving antennas. 

(2) Following this, a traditional receiver uses known pilots and assumes flat fading for each subcarrier to estimate the channel:

$$\hat{H}_{ij} = y\_{ij} x\_{ij}^*, \quad (i, j) \in \mathcal{P} $$

Where $\mathcal{P}$ represents the index set corresponding to pilot positions in the frequency grid, and $(\cdot)^*$ denotes the conjugate. The raw channel estimates are then interpolated to fill the entire time-frequency grid, thereby providing channel estimates for the data signals. This yields channel estimates $\hat{H}_{ij} \in \mathbb{C}^{N_r \times 1}$ corresponding to the data signal and subcarrier index set $(i, j) \in \mathcal{D}$. The noise (plus interference) power $\sigma_n^2$ is also estimated during the channel estimation phase.

(3) Interpolation is performed based on channel estimation to achieve the equalization operation.
The interpolated channel estimates are then used to equalize each data symbol. As mentioned above, an LMMSE equalizer is used in the considered reference receiver architecture, which means for $(i, j) \in \mathcal{D}$, the equalizer output is:
$$
\hat{x}\_{ij} = \left( \hat{H}\_{ij}^H \hat{H}\_{ij} + \sigma_n^2 I \right)^{-1} \hat{H}\_{ij}^H y\_{ij}
$$

Where $\sigma_n^2$ is the noise power estimate, $I$ is the identity matrix, and $(\cdot)^H$ denotes the Hermitian conjugate transpose.

(4) The equalized symbols are fed into the demapper to calculate the LLR (Log-Likelihood Ratio).
Specifically, operating on the symbol estimates $\hat{x}_{ij}$, the LLR is defined as:

$$L_{ijl} \triangleq \log \left( \frac{\Pr(c_l = 0 | \hat{x}\_{ij})}{\Pr(c_l = 1 | \hat{x}\_{ij})} \right) 
$$
Where $\Pr(c_l = b \mid \hat{x}_{ij})$ is the conditional probability that the transmitted bit $c_l$ is $b \in \{0, 1\}$ given the observed symbol $\hat{x}_{ij}$, with $l = 0, \ldots, B - 1$, and $B$ being the number of bits per symbol. Assuming the equalizer eliminates all channel effects and only AWGN remains, the LLR can be well approximated by:
$$
L_{ijl} \approx \frac{1}{\sigma_n^2} \left( \min\_{x \in \mathcal{C}_l^1} \||\hat{x}\_{ij} - x\||_2^2 - \min\_{x \in \mathcal{C}_l^0} \||\hat{x}\_{ij} - x\||_2^2 \right)
$$
Where $x \in \mathcal{C}_l^b$ represents those points in the constellation $\mathcal{C}$ where the $l$-th bit is $b \in \{0, 1\}$, and $\sigma_n^2$ is the noise power estimate. In the reference implementation, the final LLR is also multiplied by the channel amplitude of the considered subcarrier to reflect higher uncertainty due to more severe fading.

##### 2.1.4. Convolutional Neural Networks-Based Receiver
> Replacing the frequency domain signal to LLR process of traditional architectures with a neural network.

The main design principles are the following two points:
* Considering non-stationary environments and potentially mobile User Equipments (UEs), the frequency domain channel coefficients for each subcarrier and Orthogonal Frequency Division Multiplexing (OFDM) symbol are different. In this scenario, the physical channel possesses strong local correlations in frequency and time — therefore, we adopt fully convolutional neural networks.
* Because sparse pilot symbols only provide local channel information, we allow the network to utilize unknown data and its known distribution to improve the estimation accuracy of LLRs located far from the actual pilot positions. Therefore, the approach in this paper grants the CNN unrestricted access to all data.

DeepRx operates on 3D arrays; its construction is illustrated in the figure below:
<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx5.png" style="width: 400px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">Input structure of DeepRx</span>
  </div>
</div>

Note: It should be noted that pilot symbols are mixed and transmitted together within the data frame, while the pilot reference signal is transmitted separately. Meanwhile, pilot locations can have different configurations. To allow a single network to operate under multiple pilot configurations, the prerequisite is that these configurations are presented to the network during training.

The specific network structure can be viewed in conjunction with ResNet, which is not the main focus here.

During training, there is a very tricky method used to solve the unification problem of different modulation orders:
Since the four higher-order constellation points in a constellation diagram can be dimensionally reduced and mapped to a single constellation point of a lower-order modulation, this relationship is used to define the model's output. The same output bits (LLRs) correspond to the same parts in the constellation diagram, and an increase in the number of bits corresponds to spatial refinement. In practical deployment, the output is fixed at 8 bits, but depending on the actual signal's modulation scheme, dynamic bit masking is performed. For example, if QPSK is received, the loss is calculated only for the first two bits, and ultimately, only the first two bits' LLRs are passed to the decoder.

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx6.png" style="width: 350px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">Bit mapping mechanism illustration</span>
  </div>
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx7.png" style="width: 200px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">Bit masking mechanism illustration</span>
  </div>
</div>


##### 2.1.5. Generation of Training and Validation Data
> Introduction to data generation, structure, and the training process.

The dataset contains 500,000 TTIs. Parameter randomization is targeted at each frame, where one frame contains 10 TTIs. Both SNR and SIR are randomized, and interference is only presented in some of the results.

As is well known, the signal-to-noise ratio in practical scenarios is more likely to follow a log-normal distribution, but the paper chooses a uniform distribution to improve training efficiency.

Regarding DMRS, various usages of PRBs were configured, which can be divided into "single pilot" and "dual pilots". Traditional LMMSE can only work properly under specific DMRS configurations. In this paper, it was found that the position of DMRS symbols has no significant impact on performance, and the introduction of a single pilot was purely to evaluate extreme performance.

During training and validation, the channel models do not overlap. This design ensures that the deep neural network cannot achieve high performance by simply learning the characteristics of a single channel model.

Furthermore, this paper also uses a purely synthetic channel model to generate a smaller training dataset. In this synthetic model, the channel for a single OFDM symbol is a 7-tap Rayleigh fading channel. After each OFDM symbol transmission, the channel changes randomly: 90% of the new channel's variance comes from the previous channel realization, and 10% comes from a newly generated 7-tap channel. This design ensures that the channels between consecutive OFDM symbols have some correlation. The purpose of this artificial channel model is not to simulate a realistic propagation channel, but to capture some basic characteristics of wireless channels while remaining distinct from the realistic 3GPP channel models.

In the experiments, there are two types of bit error rates — uncoded bit error rate and coded bit error rate: studying the coded BER can reveal whether the LLRs output by DeepRx adequately capture the uncertainty of detected bits to meet LDPC decoding needs. At the same time, because ideal LLRs lack explicit analytical formulas under the utilized channel models, making direct accuracy evaluation difficult, the coded BER can also serve as an indirect metric for the accuracy of the LLRs themselves.

An exploration into the high performance of DeepRx?

(1) Channel time tracking capability: Investigating the relationship between the uncoded BER and the maximum channel Doppler shift (which is inversely proportional to channel coherence time). It is known that a 500 Hz Doppler shift corresponds to a very severe mobility scenario (135 km/h).

(2) DeepRx does not gain its advantage by learning the channel model: (Supplementary note: the Rayleigh channel model is completely independent of the 3GPP channel model). Training DeepRx with the Rayleigh channel model and validating with the 3GPP channel, DeepRx still outperforms LMMSE.

(3) Blind utilization of position data?

A structurally restricted CNN architecture was set up to control whether the CNN could access the full Rx data array. This structurally restricted CNN architecture represents to some extent the existing deep learning-based channel estimators, and comparing DeepRx to it can also reveal DeepRx's advantages over these earlier DL-aided receivers.

(4) Advanced utilization of data symbol distributions?

Another reason for DeepRx's high performance might be that it has learned to use the distribution information of data symbols (such as known constellation points) to track channel variations across time and frequency dimensions.
Validation: In the time-frequency grid of a TTI, each quadrant is filled with identical symbols while retaining standard pilot symbol positions. Comparing QPSK and 16QAM scenarios, DeepRx's performance only dropped slightly in the QPSK scenario. It was found that because QAM uses both the amplitude and phase of symbols to encode information (unlike QPSK, which only encodes information via phase), significant differences emerged — under the artificial symbol distribution, DeepRx failed to provide adequate performance; whereas the restricted CNN receiver (which could not learn to exploit the data symbol distribution because it couldn't observe multiple symbols simultaneously) actually outperformed the unrestricted DeepRx architecture significantly. This indicates that DeepRx relies on learning from the data symbol distribution. The paper infers that DeepRx achieves some form of local amplitude normalization or amplitude tracking by learning to rely on the data symbol distribution, enabling accurate equalization of the channel amplitude response. The performance failure caused by disrupting the symbol distribution is mainly related to symbol amplitude, implying that DeepRx may have learned a blind equalization scheme similar to the well-known Constant Modulus Algorithm (CMA).

(5) Comparison with iterative receivers

Hypothesis: DeepRx utilizes valid constellation point information — this concept is very similar to iterative receivers. The authors designed an experiment to prove that both DeepRx and iterative receivers can utilize unknown data symbols for channel estimation.

Basic process of the iterative receiver: First, perform initial channel estimation and equalize the RX symbols using a single pilot symbol, then calculate new channel estimates using the previous RX symbol decisions; subsequently, the optimized channel estimates are averaged across the entire TTI and used to equalize the RX symbols again. This process is repeated 40 times to ensure convergence.

It should be noted that this version of DeepRx is trained with conventional data containing uniformly random symbols.

**Ablation Experiments**
> Exploring the relationship between architecture and performance via ablation experiments.

There are quite a few experiments here. One point to note is: thanks to the fully convolutional architecture, the computational complexity scales linearly when expanding the TTIs of the processed data.
Conclusion: The theoretical asymptotic complexity of DeepRx is similar to that of an LMMSE receiver; however, DeepRx has a much larger constant coefficient (not reflected in the asymptotic expression), so the actual computational cost of DeepRx in practice might be higher than the LMMSE receiver, despite its superior radio performance.

This work has been extended by the original authors to the MIMO scenario:
[6] D. Korpi, M. Honkala, J. M. Huttunen, and V. Starck, “DeepRx MIMO: Convolutional MIMO Detection with Learned Multiplicative Transformations,” in ICC 2021-IEEE International Conference on Communications. IEEE, 2021, pp. 1–7.

#### 2.2 DeepRx MIMO: Convolutional MIMO Detection with Learned Multiplicative Transformations

##### 2.2.1 Abstract and Introduction
As one of the deep learning solutions for physical layer performance enhancement in wireless reception, most studies have not explored spatial multiplexing scenarios in MIMO. This paper proposes a network structure composed of a ResNet and a transformation layer. This paper features two implementation schemes: one is maximal ratio combining (MRC) and the other is a fully learning-based transformation, which are prepended to the input of the original DeepRx architecture.

The MIMO scenario requires the separation of multiple overlapping spatial streams during the equalization and symbol detection stages. This paper will demonstrate that letting the neural network autonomously learn all information from the data is a superior solution.

##### 2.2.2  System Model
This paper explores an OFDM MIMO system containing $N_T$ layers (spatial streams) and $N_R$ receive antennas, setting the number of OFDM symbols within a TTI to $S=14$, with $F$ representing the number of subcarriers.
The 5G system supports Code Division Multiplexing (CDM) to provide separable pilots for all layers (allocating different orthogonal cover codes to different layers).

##### 2.2.3 DeepRx MIMO Receiver with Expert Knowledge-based Transformation Layer
When extending the DeepRx architecture to Multiple-Input Multiple-Output (MIMO) scenarios, the input and output arrays are defined as follows:
- The received data signal is denoted as $Y \in \mathbb{C}^{F \times S \times N_R}$;
- The raw channel estimates are denoted as $\hat{H} \in \mathbb{C}^{F \times S \times N_R \times N_T}$, where each $N_R \times N_T$ subarray corresponds to the final raw estimate $\hat{H}_{ij}$ for the respective resource element.

Unlike the baseline receiver, DeepRx employs an extremely simple nearest-neighbor interpolation method: for each data resource element $(i, j) \in \mathcal{D}$, its channel estimate is determined by selecting the raw estimate of the nearest pilot-bearing resource element $(i, j) \in \mathcal{P}$.

The most naive idea: reshape the channel into $F \times S \times N_R \times N_T$. However, experiments proved that this architecture has mediocre performance in high-order MIMO scenarios because the difficulty of separating different MIMO layers is much higher than signal detection without spatial multiplexing. Expanding the network is an option.

The paper proposes two novel transformation layers that can be combined with any neural network receiver:

- Preprocessing based on Maximal Ratio Combining (MRC), using learnable virtual spatial streams;
- Fully learning-based multiplicative transformation / preprocessing.


#### 2.3 A Neural Receiver for 5G NR Multi-user MIMO
> NVIDIA Arxiv 2023

##### 2.3.1 Abstract and Introduction
Implemented a MU-MIMO receiver complying with the PUSCH standard. The architecture combines convolutional layers with Graph Neural Networks (GNNs); the former handles time-frequency correlations, while the latter processes multi-user scenarios.

DeepRx was almost the earliest in the industry (2021) to propose a Neural Network (NN)-based receiver fully compliant with the 5G New Radio (5G NR) standard, and extended the SIMO system to a MIMO system in the same year, with the two papers published in TWC and ICC respectively. However, in 2017, some scholars had already proposed a CNN-based OFDM detection receiver algorithm.

In the same year as DeepRx, some scholars merged the transmitter and receiver into an End2End model, and even achieved pilot-less communication. In 2022, NR for IoT devices was also validated.
However, current research on MU-MIMO is often limited to ideal Channel State Information by researchers, neglecting implicit channel estimation.

The main work of this paper lies in:
1. The neural network architecture achieves adaptability to variable numbers of users and configurable subcarrier quantities.
2. The training weights require less than 1 million parameters, and the number of PRBs is variable.
A practical challenge this paper needs to address is how to prevent model overfitting.


##### 2.3.2 Neural Multi-user MIMO OFDM Receiver
In the 5G NR scenario, users equipped with multiple antennas can transmit multiple MIMO Layers (data streams), and a single user can correspond to multiple layers. Let $N_S$ be the number of OFDM symbols constituting the Resource Grid, and $N_F$ be the number of subcarriers. For the $n_T$-th layer, its allocated REs are [$n_F$, $n_S$], and a bit vector $b_{n_F, n_S, n_T} \in \{0, 1\}^m$ of length $m$ is transmitted on this layer. This is then mapped via Gray-coded $m$-order QAM. MIMO precoding techniques can also be applied for multiple transmitting antennas. The entire resource grid is as follows:
$$
X\_{n\_T} = \begin{bmatrix}
x\_{1,1,n\_T} & \cdots & x\_{1,N\_S,n\_T} \\\\
\vdots & \ddots & \vdots \\\\
x\_{N\_F,1,n\_T} & \cdots & x\_{N\_F,N\_S,n\_T}
\end{bmatrix}
$$

Of course, DMRS pilot resources, CP, and the like also need to be allocated, and the received signals are all standard models. To save time, we won't care about the specific formulas.

**We will focus on the receiver architecture**

The algorithm below implements the neural receiver shown in the following figure. This receiver processes the data of the entire slot and can complete the bit estimation for all layer transmissions at once.
<div style="display: flex; justify-content: center; align-items: flex-start; margin: 16px 0;">
  <div style="flex: 1; text-align: center;">
    <img src="/images/blog/nr_DeepRx8.png" style="width: 400px; display: block; margin: 0 auto;" />
    <span style="display: block; text-align: center; color: #888;">Neural MU-MIMO Receiver Architecture Diagram</span>
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