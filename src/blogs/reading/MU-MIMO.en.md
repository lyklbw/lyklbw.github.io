---
title_zh: MU-MIMO
title_en: MU-MIMO
date: 2025-08-27
---

# MU-MIMO
> Learning with questions in mind (given an existing knowledge base)
> 
> This blog was originally written in Chinese. Translated by Gemini Pro.

To understand the working details of MU-MIMO, we first need to compare it with known technologies. First, we must understand the differences between SIMO and MIMO. This prompts the question: how does MIMO improve channel transmission capacity?

#### Q1: How does MIMO achieve performance improvements compared to SIMO?
> Actually, this is a well-worn topic.

1. Spatial Multiplexing (speed)
2. Diversity Gain (reliability)
3. Beamforming

1. Spatial Multiplexing

We naturally need to understand why it is effective from a specific modeling perspective.

Consider a point-to-point MIMO system with $N_t$ transmit antennas and $N_r$ receive antennas. The baseband equivalent model can be written as:

$$
\mathbf{y} = \mathbf{Hx} + \mathbf{n}
$$

The only thing to note is that the dimension of $\mathbf{H} \in \mathbb{C}^{N_r \times N_t}$ is different from that in SIMO.

Performing SVD on the channel matrix $\mathbf{H}$:

$$
\mathbf{H} = \mathbf{U} \Sigma \mathbf{V}^H
$$

Where:

- $\mathbf{U} \in \mathbb{C}^{N_r \times N_r}$ and $\mathbf{V} \in \mathbb{C}^{N_t \times N_t}$ are unitary matrices.
- $\Sigma \in \mathbb{R}^{N_r \times N_t}$ is a diagonal matrix whose diagonal elements are non-negative singular values $\sigma_1 \geq \sigma_2 \geq \ldots \geq \sigma_{\min(N_t, N_r)} \geq 0$. The number of non-zero singular values is $r = \text{rank}(\mathbf{H}) \leq \min(N_t, N_r)$.

We perform pre-processing and post-processing on the transmitted and received signals:
1. $\tilde{\mathbf{x}} = \mathbf{V}^H \mathbf{x}$ (Transmit precoding)
2. $\tilde{\mathbf{y}} = \mathbf{U}^H \mathbf{y}$ (Receive shaping)
3. $\tilde{\mathbf{n}} = \mathbf{U}^H \mathbf{n}$ (Noise transformation)

The original model is transformed as follows:

$$
\mathbf{U}^H \mathbf{y} = \mathbf{U}^H \mathbf{U} \Sigma \mathbf{V}^H \mathbf{x} + \mathbf{U}^H \mathbf{n}
$$

$$
\tilde{\mathbf{y}} = \Sigma \tilde{\mathbf{x}} + \tilde{\mathbf{n}}
$$

Since $\mathbf{U}$ and $\mathbf{V}$ are unitary matrices, they do not change the statistical properties of the noise ($\tilde{\mathbf{n}} \sim \mathcal{CN}(0, \sigma_n^2 \mathbf{I}_{N_r})$) and the power constraint of the signal ($\mathbb{E}[\tilde{\mathbf{x}}^H \tilde{\mathbf{x}}] = P$).

This transformed system is an equivalent parallel Gaussian channel:

$$
\tilde{y}_i = \sigma_i \tilde{x}_i + \tilde{n}_i, \quad i = 1, 2, \ldots, r
$$

The equivalent model above decomposes the MIMO channel into $r$ independent, parallel sub-channels, and the power gain of each sub-channel is $\sigma_i^2$. The capacity of each sub-channel is:

$$
C_i = \log_2 \left( 1 + \frac{P_i \sigma_i^2}{\sigma_n^2} \right) \text{ bits/s/Hz}
$$

Where $P_i$ is the power allocated to the $i$-th sub-channel, satisfying the total power constraint $\sum_{i=1}^r P_i = P$.

The total capacity of the entire MIMO channel is the sum of the capacities of these parallel sub-channels. To maximize the total capacity, we need to perform water-filling power allocation across all sub-channels.

$$
C_{\text{MIMO}} = \max_{\{P_i\} : \sum P_i = P} \sum_{i=1}^r \log_2 \left( 1 + \frac{P_i \sigma_i^2}{\sigma_n^2} \right)
$$

The optimal solution for **water-filling power allocation** is: (Matthew effect)

$$
P_i^{\text{opt}} = \left( \mu - \frac{\sigma_n^2}{\sigma_i^2} \right)^+, \quad \text{where} \ (x)^+ = \max(0, x)
$$

The selection of the parameter $\mu$ must satisfy the total power constraint $\sum_{i=1}^r P_i^{\text{opt}} = P$.

It can be proven that, on average, the capacity grows linearly with $\min(N_t, N_r)$. When the space is rich in scattering, we can obtain the maximum spatial multiplexing gain.

2. Diversity Gain

The core idea of diversity is to provide multiple independent or highly uncorrelated transmission paths for the same piece of information.

For a communication system, its average Bit Error Rate (BER) or Symbol Error Rate (SER) under high Signal-to-Noise Ratio (SNR) conditions can be approximated as:

$$
P_e \approx c \cdot \text{SNR}^{-d}
$$

Where $c$ is a constant, and $d$ is the Diversity Order.

We use a 2×1 system (i.e., 2 transmit antennas and 1 receive antenna, also known as transmit diversity, though there is also time diversity, etc.) to specifically illustrate. The most classic scheme is the Alamouti space-time code.

The coding matrix of the Alamouti scheme is:

$$
\mathbf{C} = \begin{bmatrix} s_1 & s_2 \\ -s_2^* & s_1^* \end{bmatrix}
$$

The received signals are:
$$
r_1 = h_1 s_1 + h_2 s_2 + n_1
$$

$$
r_2 = -h_1 s_2^* + h_2 s_1^* + n_2
$$

The receiver combines the observations from the two time slots into a vector:

$$
\mathbf{r} = \begin{bmatrix} r_1  \\ r_2^* \end{bmatrix} = \begin{bmatrix} h_1 & h_2 \\ h_2^* & -h_1^* \end{bmatrix} \begin{bmatrix} s_1 \\ s_2 \end{bmatrix} + \begin{bmatrix} n_1 \\ n_2^* \end{bmatrix}.
$$

When decoding, the receiver simply needs to do:

$$
\hat{\mathbf{s}} = (H^H H)^{-1} H^H \mathbf{r}
$$

Since $H^H H = (|h_1|^2 + |h_2|^2)I$, the decoding is very simple:

$$
\tilde{s}_1 = h_1^* y_1 + h_2 y_2^*
$$

$$
= h_1^* (h_1 s_1 + h_2 s_2 + n_1) + h_2 \left( -h_1 s_2^* + h_2 s_1^* + n_2 \right)^*
$$

$$
= (|h_1|^2 + |h_2|^2)s_1 + (h_1^* n_1 + h_2 n_2^*)
$$

Finally, dividing by the energy factor $|h_1|^2 + |h_2|^2$, we obtain the estimates for $s_1, s_2$.

The final decision SNR is the sum of the squares of the two channel gains multiplied by the original SNR (reminder: under Rayleigh fading, $|h_i|^2$ follows an exponential distribution).

#### Q2: Differences between the neural receivers corresponding to SIMO, MIMO, and MU-MIMO

#### Q2: How is MU-MIMO implemented?
In traditional 5G NR, the base station can transmit multiple layers to multiple users or a single user. Each layer corresponds to a spatial stream and an independent data sequence. Different layers are linearly superposed and transmitted after being encoded by the precoding matrix.

However, it is necessary to ensure that the channel matrix has sufficient rank, and CSI (Channel State Information) is needed to construct the decoding matrix.

---

ps: 

1. Understanding of the channel by the receiver and transmitter

In real-world scenarios, the receiver generally has CSI estimation capabilities (derived from channel information provided by pilots). The estimation error primarily stems from pilot density (e.g., 1-pilot/2-pilot) and how fast the channel itself changes.

If the transmitter uses FDD (Frequency Division Duplex), it cannot directly sense the downlink channel and requires the UE to feed it back to the base station; if TDD (Time Division Duplex) is used, relying on channel reciprocity, the transmitter can infer the downlink channel through the uplink pilots.

2. Calculation of channel capacity and mutual information (Haven't used information theory in ages ahhhh)

Channel capacity $C$ refers to the maximum information rate that can be transmitted without errors under given channel conditions. Mutual information plays a key role in the calculation of channel capacity:
By choosing an appropriate input distribution (coding) $p(\mathbf{x})$, the mutual information can be maximized, thereby maximizing the channel capacity.
$$
C = \max_{p(\mathbf{x})} I(\mathbf{x}; \mathbf{y})
$$

Mutual information measures the degree of dependency between two random variables; entropy measures the uncertainty of a single variable; joint entropy represents the total uncertainty of both; conditional entropy reflects the uncertainty of one variable given the knowledge of another.
$$
I(X; Y) = H(X) + H(Y) - H(X, Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)
$$

3. Regarding real channel scenario modeling

* Rayleigh Fading: In a rich scattering environment without a dominant Line-of-Sight (LoS) path, $h_{ij}$ can be modeled as independent zero-mean circularly symmetric complex Gaussian random variables.
* Rician Fading: If a stable LoS path exists, $\mathbf{H}$ can be modeled as the sum of a constant matrix (LoS component) and a random matrix (Non-LoS/NLoS component): 
$\mathbf{H} = \sqrt{\frac{K}{K+1}} \mathbf{H}_{\text{LoS}} + \sqrt{\frac{1}{K+1}} \mathbf{H}_{\text{NLoS}}$, where $K$ is the Rician factor.

4. What is a unitary matrix?

An Orthogonal Matrix in the real number field corresponds to a Unitary Matrix in the complex number field.
The inverse of a unitary matrix is equal to its conjugate transpose.
$$
\mathbf{U}^{-1} = \mathbf{U}^{\dagger}
$$

And a complex covariance matrix corresponds to a Hermitian positive semi-definite matrix.
$$
\mathbf{R} = \mathbf{R}^H 
$$

5. Channel Fading

1. Path Loss: A deterministic average trend, does not fluctuate randomly.
2. Shadow Fading: Slow fading, log-normal distribution.
3. Multipath Fading: Rayleigh / Ricean / Nakagami

6. Regarding MCS (Modulation and Coding Scheme)

---