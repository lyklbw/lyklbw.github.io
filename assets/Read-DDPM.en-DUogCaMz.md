---
title_zh: 扩散模型阅读
title_en: Reading DDPM
date: 2025-11-06
---

## Read DDPM
> author: lyk
> 
> date: 2025-11-6

### 1 Overview
Denoising Diffusion Probabilistic Models (DDPM) was introduced by Ho et al. in 2020 as a novel generative modeling approach, which has shown impressive results in generating high-equality images, Text-to-Speech, audio synthesis, and various other domains.In this article, I will explore the mathematical foundations of DDPM step by step and draw a clear picture of how it works.

Before we start, here are two initial impressions you should have about DDPM:

1. This model is a parameterized Markov chain ending with Noise, whose transitions are learned to reverse a diffusion process/forward process.
2. During training, this parameterization is equivalent to denoising 
score matching over multiple noise levels. During sampling, the 
process is equivalent to annealed Langevin dynamics.
---

<br>


### 2 Preliminaries
1.  Probability Density Function (PDF): $ p(x) $

    The PDF is used to specify the probability of the random variable falling within a particular range of values
    $$
      P(a \leq X \leq b) = \int_a^b p(x) \, dx
    $$
    Note that $X$ typically represents a random variable, while $x$ represents a specific value that the random variable $X$ can take.

2. Conditional Probability: $ p(x|y) $

   The conditional probability $ p(x|y) $ represents the probability of event $ x $ occurring given that event $ y $ has occurred. It is defined as:
   $$
     p(x|y) = \frac{p(x, y)}{p(y)}
   $$
   where $ p(x, y) $ is the joint probability of events $ x $ and $ y $, and $ p(y) $ is the marginal probability of event $ y $.

   Bayes' theorem, which I have reviewed over and over again:
    $$
      p(x|y) = \frac{p(y|x) \cdot p(x)}{p(y)}
    $$
    where:
    - $ p(x|y) $ is the posterior probability -- Your updated belief about x after observing evidence y
    - $ p(y|x) $ is the likelihood -- This describes how probable the evidence y is, assuming x is true. It answers: "If x were true, how likely would I be to observe y?"
    - $ p(x) $ is the prior probability or hypothesis --  Your initial belief about x before seeing any evidence. It answers: "What did I believe about x before observing y?"
    - $ p(y) $ is the marginal likelihood or evidence -- This is the overall probability of observing evidence y, regardless of whether x is true or false. It's a normalizing constant that ensures probabilities sum to 1. Notice that $p(y) = p(y|x) p(x) + p(y|\neg x) p(\neg x)$.
    Basically, y is the hypothisis/evidence, and x is the data/observation.z`

3. Joint Probability: $ p(x, y) $

   The joint probability $ p(x, y) $ represents the probability of both events $ x $ and $ y $ occurring simultaneously. It can be expressed in terms of conditional probability as:
   $$
     p(x, y) = p(x|y) \cdot p(y) = p(y|x) \cdot p(x)
   $$

   The chain rule of probability allows us to decompose joint probabilities into conditional probabilities:
   $$
     p(x_1, x_2, \ldots, x_T) = p(x_1) \cdot p(x_2|x_1) \cdot p(x_3|x_1, x_2) \cdots p(x_T|x_1, x_2, \ldots, x_{T-1})
   $$

   We can also express the joint probability in a concise form:
   $$
   p(\mathbf{x}\_{0:T}) = p(x\_0, x\_1, \ldots, x\_T) = p(x\_0) \prod_{t=1}^{T} p(x\_t \mid x\_0, x\_1, \ldots, x\_{t-1})
   $$
 
 4. Gaussian Distribution: $ \mathcal{N}(\mu, \sigma^2) $
    
    We assume that $X$ is a random varible follow a Gaussian distribution with mean $\mu$ and variance $\sigma^2$, denoted as $X \sim \mathcal{N}(\mu, \sigma^2)$. As a instance of $X$, the PDF of $x$ can be writen as $f(x) = \mathcal{N}(x; \mu, \sigma^2)$.

    Property that will be used later:
    - The sum of two independent Gaussian random variables is still a Gaussian random variable.
  If $\( Y_1 \sim \mathcal{N}(\mu_1, \sigma_1^2) \)$ and $\( Y_2 \sim \mathcal{N}(\mu_2, \sigma_2^2) \)$, then $\( Y_1 + Y_2 \sim \mathcal{N}(\mu_1 + \mu_2, \sigma_1^2 + \sigma_2^2) \)$.

    - The mean and variance of a product of two Gaussian distributions.
   If $\( Y_1 \sim \mathcal{N}(\mu_1, \sigma_1^2) \)$ and $\( Y_2 \sim \mathcal{N}(\mu_2, \sigma_2^2) \)$, then the product $\( Y = Y_1 \cdot Y_2 \)$ is proportional to a Gaussian distribution with mean and variance given by:
   $$     \mu = \frac{\sigma_2^2 \mu_1 + \sigma_1^2 \mu_2}{\sigma_1^2 + \sigma_2^2} $$
   $$     \sigma^2 = \frac{\sigma_1^2 \sigma_2^2}{\sigma_1^2 + \sigma_2^2} $$

5. Kullback-Leibler (KL) Divergence

   KL divergence is a measure of how one probability distribution diverges from a second, expected probability distribution. For two probability distributions $P$ and $Q$ defined on the same probability space, the KL divergence from $Q$ to $P$ is defined as:
   $$
     D_{KL}(P \| Q) = \int p(x) \log \frac{p(x)}{q(x)} \, dx
   $$
   where $p(x)$ and $q(x)$ are the probability density functions of distributions $P$ and $Q$, respectively.

   Note that KL divergence is not symmetric, meaning that generally $D_{KL}(P \| Q) \neq D_{KL}(Q \| P)$.

  6. The tower property of expectation
  $$
  \mathbb{E}[X] = \mathbb{E}_Y \big[ \mathbb{E}[X \mid Y] \big]
  $$
  The expected value of a random variable is the expected value of its conditional expected values.


   
---
<br>

### 3 Background
1. Diffusion models

     Roughly, Diffusion models are latent variable models of the form $\\int p\_{\theta}(\mathbf{x}\_{0:T}) \, d\mathbf{x}\_{1:T}\$, here $x_0$ is the observed data following a particular distribution in which we are interested.

2. Forward Process(Diffusion Process) and Reverse Process
    
    Forward process/ diffusion process is fixed to <u>a Markov chain </u> that gradually adds Gaussian noise to the data over a series of time steps according to a variance schedule $\beta_1, \ldots, \beta_T$.
    $$
    q(\mathbf{x}\_{1:T} | \mathbf{x}\_0) := \prod_{t=1}^{T} q(\mathbf{x}\_t | \mathbf{x}\_{t-1}) \tag{1}
    $$
    $$
    \quad q(\mathbf{x}\_t | \mathbf{x}\_{t-1}) := \mathcal{N}(\mathbf{x}\_t; \sqrt{1-\beta_t}\mathbf{x}\_{t-1}, \beta_t \mathbf{I}) \tag{2}
    $$
    It is very important to know that $\beta_t$ can be learned by reparameterization or held constant as hyperparameters, and we choose the latter way. Consequently, the forward process is fixed and can be ignored.
    Here is a notable property of the forward process, we can sample $x_t$ at arbitrary time step $t$ in closed form, using the notation $\alpha_t := 1 - \beta_t$ and $\bar{\alpha}\_t := \prod_{s=1}^{t} \alpha_s$, we  have:
    $$
    q(\mathbf{x}\_t | \mathbf{x}\_0) = \mathcal{N}(\mathbf{x}_t; \sqrt{\bar{\alpha}\_t} \mathbf{x}\_0, (1 - \bar{\alpha}\_t) \mathbf{I}) \tag{5}
    $$

    ------


    Reverse processs is <u> a joint distribution </u> $p\_{\theta}(\mathbf{x}\_{0:T})$, it is also defined as a Markov chain with learned Gaussian transitions starting at $p(\mathbf{x}\_T) = \mathcal{N}(\mathbf{x}\_T; \mathbf{0}, \mathbf{I})$
    $$
    p\_{\theta}(\mathbf{x}\_{0:T}) := p(\mathbf{x}\_T) \prod_{t=1}^{T} p\_{\theta}(\mathbf{x}\_{t-1} | \mathbf{x}\_t) \tag{3}
    $$
    $$
    \quad p\_{\theta}(\mathbf{x}\_{t-1} | \mathbf{x}\_t) := \mathcal{N}(\mathbf{x}\_{t-1}; \boldsymbol{\mu}\_{\theta}(\mathbf{x}\_t, t), \boldsymbol{\Sigma}\_{\theta}(\mathbf{x}\_t, t)) \tag{4}
    $$
    How to calculate the $\boldsymbol{\mu}\_{\theta}(\mathbf{x}\_t, t) $ and $\boldsymbol{\Sigma}\_{\theta}(\mathbf{x}\_t, t)$ will be discussed later since they are extremely important.

    ------

    **Notes** 
    1. these two processes have the same functional form when $\beta_t$ are small.
    2. Markov chain property: $q(x_t|x_{t-1}, x_{t-2}, ..., x_1, x_0) = q(x_t|x_{t-1})$

3. Training 

    Training is performed by optimizing the usual variational bound on negative log likelihood:
    $$
    \mathbb{E}\_q \left[ -\log p\_{\theta}(\mathbf{x}\_0) \right] \leq \mathbb{E}\_{q(x\_{1:T}|x_0)} \left[ -\log \frac{p\_{\theta}(\mathbf{x}\_{0:T})}{q(\mathbf{x}\_{1:T} | \mathbf{x}\_0)} \right] = \mathbb{E}\_q \left[ -\log p(\mathbf{x}\_T) - \sum\_{t \geq 1} \log \frac{p\_{\theta}(\mathbf{x}\_{t-1} | \mathbf{x}\_t)}{q(\mathbf{x}\_t | \mathbf{x}\_{t-1})} \right] =: L \tag{5}
    $$

    $\mathbb{E}\left[ -\log p\_{\theta}(\mathbf{x}\_0) \right]$ is simply the negative log-likelihood (NLL) of the data under the model. Apparently, this high dimensional integral is intractable, so we do a little trick:

    $$
    p_\theta(x_0) = \int q(x_{1:T}\mid x_0)
    \frac{p_\theta(x_{0:T})}{q(x_{1:T}\mid x_0)} \,\mathrm{d}x_{1:T} \tag{6}
    $$

    $$
    \log p\_{\theta}(x_0)=\log \mathbb{E}\_{q(x\_{1:T}\mid x_0)}\left[\frac{p\_{\theta}(x\_{0:T})}{q(x\_{1:T}\mid x_0)}\right] \tag{7}
    $$

    following Jensen's inequality, we have: $f(\mathbb{E}[X]) \ge \mathbb{E}[f(X)]$, so the equation (7) can be written as:
    $$
    -\log p\_\theta(x\_0) \le \mathbb{E}\_{q(x\_{1:T}\mid x\_0)}\left[\log \frac{p\_\theta(x\_{0:T})}{q(x\_{1:T}\mid x\_0)}\right] \tag{8}
    $$

    $$
    \begin{aligned}
    \dots &\le \mathbb{E}\_{q(x\_{1:T}|x\_0)} \left[ -\log \frac{p\_\theta(x\_{0:T})}{q(x\_{1:T}|x\_0)} \right] 
    \\\\
    &= \mathbb{E}\_{q(x\_{1:T}|x\_0)} \left[ -\log p\_\theta(x\_{0:T}) + \log q(x\_{1:T}|x\_0) \right] 
    \\\\
    &= \mathbb{E}\_{q(x\_{1:T}|x\_0)} \left[ -\log p\_\theta(x\_T) - \sum\_{t=1}^T \log p\_\theta(x\_{t-1}|x\_t) + \sum\_{t=1}^T \log q(x\_t|x\_{t-1}) \right] 
    \\\\
    &= \mathbb{E}\_{q(x\_{1:T}|x\_0)} \left[ -\log p\_\theta(x\_T) + \sum\_{t=1}^T \log \frac{q(x\_t|x\_{t-1})}{p\_\theta(x\_{t-1}|x\_t)} \right]
    \\\\
    \text{finally } L &:= \mathbb{E}\_{q(x\_{1:T}|x\_0)} \left[ -\log p\_\theta(x\_T) - \sum\_{t \ge 1} \log \frac{p\_\theta(x\_{t-1}|x\_t)}{q(x\_t|x\_{t-1})} \right] 
    \end{aligned}
    $$
    We can further rewrite the loss $L$ as:
    $$
    L = \mathbb{E}\_q \left[ -\log p\_\theta(x\_T) + \sum\_{t \ge 1} \log q(x\_t|x_{t-1}) - \sum\_{t \ge 1} \log p(x\_{t-1}|x_t) \right] \tag{9}
    $$
  In this stage, we firstly consider the last two terms in the expectation. More specificly, we divide it into two component(t=1 & t>1), so we have:
  $$
   \sum\_{t \ge 1} \log q(x\_t|x\_{t-1}) - \sum\_{t \ge 1} \log p(x\_{t-1}|x\_t) = \left( -\log p\_\theta(x\_0|x\_1) + \log q(x\_1|x\_0) + \sum\_{t \ge 2} \log \frac{q(x\_t|x\_{t-1})}{p\_\theta(x\_{t-1}|x\_t)} \right) \tag{10}
  $$
  Based on the Bayesian theorem in the preliminaries, we can find that:
  $$
  \begin{aligned}
  q(x\_{t-1} | x\_t, x\_0) &= \frac{q(x\_t, x\_{t-1}, x\_0)}{q(x\_t, x\_0)} \\\\
  &= \frac{q(x\_t | x\_{t-1}) q(x\_{t-1} | x\_0) q(x\_0)}{q(x\_t | x\_0) q(x\_0)} \\\\
  &= \frac{q(x\_t | x\_{t-1}) q(x\_{t-1} | x\_0)}{q(x\_t | x\_0)}
  \end{aligned}
  $$

  $$
  \log q(x\_{t-1} | x\_t, x\_0) = \log q(x\_t | x\_{t-1}) q(x\_{t-1} | x\_0) - \log q(x\_t | x\_0) \tag{11}
  $$

  We can rewrite the third term on the right-hand side of Eq. (10) as:

  $$
  \begin{array}{l}
  \sum\_{t \ge 2} \left( \log q(x\_t|x\_{t-1}) - \log p(x\_{t-1}|x\_t) \right)
  = \sum\_{t \ge 2} \left( \log \frac{q(x\_{t-1}|x\_t, x\_0)}{p(x\_{t-1}|x\_t)} + \log \frac{q(x\_t|x\_0)}{q(x\_{t-1}|x\_0)} \right)
  \end{array} \tag{12}
  $$

  Futhermore, we can use telescoping sum to simplify the second term on the right-hand side of Eq. (12):
  $$
  \sum\_{t \ge 2} \log \frac{q(x\_t|x\_0)}{q(x\_{t-1}|x\_0)} = \log q(x\_T|x\_0) - \log q(x\_1|x\_0) \tag{13}
  $$
  So combining Eq. (10), (12) and (13), we can rewrite the Loss $L$ as:
  $$
   L = \mathbb{E}\_q \left[ \log q(x\_T|x\_0) -\log p\\theta(x\_T) + \sum\_{t \ge 2} \log \frac{q(x\_{t-1}|x\_t, x\_0)}{p\_\theta(x\_{t-1}|x\_t)}- \log p\_\theta(x\_0|x\_1)  \right]   \tag{14}
  $$

  Right now, use the definition of KL divergence, we rewrite the Loss $L$ as:
  $$
  \mathbb{E}\_q \left[ \underbrace{D\_{\text{KL}}(q(\mathbf{x}\_T|\mathbf{x}\_0) \parallel p(\mathbf{x}\_T))}\_{L\_T} + \sum\_{t \ge 2} \underbrace{D\_{\text{KL}}(q(\mathbf{x}\_{t-1}|\mathbf{x}\_t, \mathbf{x}\_0) \parallel p\_\theta(\mathbf{x}\_{t-1}|\mathbf{x}\_t))}\_{L\_{t-1}} - \underbrace{\log p\_\theta(\mathbf{x}\_0|\mathbf{x}\_1)}\_{L\_0} \right] \tag{15}
  $$

  What I want to emphasize here is that the q of expectation of each tern is different,

  Next we will discuss what is the formation of $q(\mathbf{x}\_{t-1}|\mathbf{x}\_t, \mathbf{x}\_0)$.
  $$
  q(x\_{t-1} | x\_t, x\_0) = \frac{q(x\_t | x\_{t-1}) q(x\_{t-1} | x\_0)}{q(x\_t | x\_0)}\tag{16}
  $$
  as we have known $x\_t$ and $x\_0$, so this is a probability distribution of $x\_{t-1}$. So the mean and variance are hiden in the the numerator of Eq. (16). We have: 
  $$
  q(\mathbf{x}\_t|\mathbf{x}\_{t-1}) := \mathcal{N}(\mathbf{x}\_t; \sqrt{1 - \beta\_t}\mathbf{x}\_{t-1}, \beta\_t\mathbf{I})
  $$
  $$
  q(x\_{t-1}|x\_0) = \mathcal{N}(x\_{t-1}; \sqrt{\bar{\alpha}\_{t-1}}x\_0, (1 - \bar{\alpha}\_{t-1})\mathbf{I})
  $$
  $$
   x\_t = \sqrt{\alpha\_t} x\_{t-1} + \varepsilon
  $$
  $$
  x\_{t-1} = \frac{x\_t -  \varepsilon}{\sqrt{\alpha\_t}}
  $$
  $$
  \varepsilon \sim \mathcal{N}(0, (1-\alpha\_t) \mathbf{I})
  $$
  $$
  \begin{array}{ll}
  \mu\_1 = \frac{x\_t}{\sqrt{\alpha\_t}} & \delta\_1^2 = \frac{1-\alpha\_t}{\alpha\_t} \\\\
  \mu\_2 = \sqrt{\bar{\alpha}\_{t-1}} x\_0 & \delta\_2^2 = 1 - \bar{\alpha}\_{t-1}
  \end{array}
  $$
  So according to the property of Gaussian distribution in preliminaries, we have:
  $$
\begin{array}{l}
q(x\_{t-1} | x\_t, x\_0) = \mathcal{N}(x\_{t-1}; \tilde{\mu}\_t(x\_t, x\_0), \tilde{\beta}\_t \mathbf{I}) \\\\
\text{where} \quad \tilde{\mu}\_t(x\_t, x\_0) := \frac{\sqrt{\bar{\alpha}\_{t-1}} \beta\_t}{1 - \bar{\alpha}\_t} x\_0 + \frac{\sqrt{\alpha\_t}(1 - \bar{\alpha}\_{t-1})}{1 - \bar{\alpha}\_t} x\_t \quad \tilde{\beta}\_t = \frac{1 - \bar{\alpha}\_{t-1}}{1 - \bar{\alpha}\_t} \beta\_t
\end{array}
$$

### 4 Diffusion Models and Denoising Autoencoders
After all that, we will talk about the each term of the loss $L$ in Eq. (15).

1. Forward Process
The approxiamte posterior has no learnables parameters,
so $L_T$ is a constant during training which can be ignored.

2. Reverse Process
Now we focus on $L_{t-1}$, especially the components of Eq. (4) as follows:
$$
\quad p\_{\theta}(\mathbf{x}\_{t-1} | \mathbf{x}\_t) := \mathcal{N}(\mathbf{x}\_{t-1}; \boldsymbol{\mu}\_{\theta}(\mathbf{x}\_t, t), \boldsymbol{\Sigma}\_{\theta}(\mathbf{x}\_t, t))
$$

Experimentally, we set $\boldsymbol{\Sigma}_{\theta}(\mathbf{x}_t, t) = \delta_t^2 \mathbf{I}$. We can choose either $\delta_t^2 = \tilde{\beta}_t$ or $\delta_t^2 = \beta_t$, where each choice indicates a different regime of the model. When we choose the former ($\tilde{\beta}_t$), it corresponds to the optimal variance when $\mathbf{x}_0$ is deterministic, representing the lower bound on the reverse process entropy. Conversely, the latter ($\beta_t$) is optimal for $\mathbf{x}_0 \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ and corresponds to the upper bound on the entropy. It is quite understandable.

But when it comes to $\tilde{\mu}\_t(x\_\theta, x\_0)$, things get a bit tricky. As shown in Eq. (5), 
$q(\mathbf{x}\_t | \mathbf{x}\_0) = \mathcal{N}(\mathbf{x}_t; \sqrt{\bar{\alpha}\_t} \mathbf{x}\_0, (1 - \bar{\alpha}\_t) \mathbf{I})$, we can obtaint the expression of $x_0$:
$$
\mathbf{x}\_0 = \frac{1}{\sqrt{\bar{\alpha}\_t}} \left( \mathbf{x}\_t - \sqrt{1 - \bar{\alpha}\_t} \boldsymbol{\epsilon} \right), \quad \boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})
\tag{17}
$$

And we also know the expression of $\tilde{\mu}\_t(x\_t, x\_0) := \frac{\sqrt{\bar{\alpha}\_{t-1}} \beta\_t}{1 - \bar{\alpha}\_t} x\_0 + \frac{\sqrt{\alpha\_t}(1 - \bar{\alpha}\_{t-1})}{1 - \bar{\alpha}\_t} x\_t$, so
we can substitue $x_0$ within it using Eq. (17), and we have:
$$
\tilde{\mu}\_t(x\_t, \boldsymbol{\epsilon}) := \frac{1}{\sqrt{\alpha\_t}} \left( x\_t - \frac{\beta\_t}{\sqrt{1 - \bar{\alpha}\_t}} \boldsymbol{\epsilon} \right)
\tag{18}
$$

How can we know the connection between $\tilde{\mu}\_t(x\_t, \boldsymbol{\epsilon})$ and $\boldsymbol{\mu}\_{\theta}(\mathbf{x}\_t, t)$?
To understand the relationship between $\tilde{\mu}\_t(x\_t, \boldsymbol{\epsilon})$ and $\boldsymbol{\mu}\_{\theta}(\mathbf{x}\_t, t)$, we prove as follows:


To compute the KL divergence, we treat both probability distributions as Multivariate Gaussians.Distribution P (The True Posterior $q$):Mean: $\mu_P = \tilde{\mu}\_t(x\_t, x\_0)$ (The calculated ground truth mean).Covariance: $\Sigma_P = \tilde{\beta}\_t I$ (The variance schedule, fixed).Distribution Q (The Model $p\_\theta$):Mean: $\mu_Q = \mu\_\theta(x\_t, t)$ (The mean predicted by the neural network).Covariance: $\Sigma\_Q = \Sigma\_\theta(x\_t, t) = \delta_t^2 I$ (The model variance, assumed to be fixed/constant for this derivation).

The notes use the standard formula for the KL divergence between two Multivariate Gaussians $P$ and $Q$ of dimension $k$:$$D\_{KL}(P \parallel Q) = \frac{1}{2} \left[ \log\frac{|\Sigma_Q|}{|\Sigma_P|} + \text{Tr}(\Sigma_Q^{-1}\Sigma_P) + (\mu\_P - \mu\_Q)^T \Sigma_Q^{-1} (\mu\_P - \mu\_Q) - k \right]$$The derivation then breaks this down into three parts.
Part 1:
 The Log-Determinant TermSince the covariance matrices are diagonal (scalar multiples of the Identity matrix $I$), the determinant calculation is straightforward.$$\log \frac{|\delta\_t^2 I|}{|\tilde{\beta}\_t I|} = \log \frac{(\delta\_t^2)^k}{(\tilde{\beta}\_t)^k} = k \log \frac{\delta\_t^2}{\tilde{\beta}\_t}$$(Note: $k$ is the data dimension)
 Part 2: The Trace TermWe calculate the trace of the product of the inverse variance of $Q$ and the variance of $P$:$$\text{Trace}( (\delta\_t^2 I)^{-1} (\tilde{\beta}\_t I) ) = \text{Tr}\left( \frac{\tilde{\beta}\_t}{\delta\_t^2} I \right) = k \cdot \frac{\tilde{\beta}\_t}{\delta\_t^2}$$
 Part 3: The Mean-Difference Term (Crucial Step)This term compares the true mean $\tilde{\mu}\_t$ with the predicted mean $\mu_\theta$.$$(\tilde{\mu}\_t - \mu\_\theta)^T (\delta\_t^2 I)^{-1} (\tilde{\mu}\_t - \mu\_\theta) = \frac{1}{\delta\_t^2} || \tilde{\mu}\_t - \mu\_\theta ||^2$$This effectively becomes a squared Euclidean distance.

Substituting the three parts back into the original equation:
$$L\_{t-1} = \frac{1}{2} \left[ \underbrace{k \log \frac{\delta\_t^2}{\tilde{\beta}\_t} + k \frac{\tilde{\beta}\_t}{\delta\_t^2} - k}_{\text{Constant terms}} + \underbrace{\frac{1}{\delta\_t^2} || \tilde{\mu}\_t - \mu\_\theta ||^2}\_{\text{Variable term}} \right]
$$

Because the variances ($\delta\_t^2$, $\tilde{\beta}\_t$) and the dimension ($k$) are fixed hyperparameters (they do not depend on the learnable parameters $\theta$), they are constants.We can group them into a constant $C$:$$L\_{t-1} = \frac{1}{2\delta\_t^2} || \tilde{\mu}\_t(x\_t, x\_0) - \mu\_\theta(x\_t, t) ||^2 + C$$

The derivation concludes that minimizing the KL divergence $L\_{t-1}$ is mathematically equivalent to minimizing the squared difference between the means.$$\text{Loss} \propto || \tilde{\mu}\_t(x\_t, x\_0) - \mu\_\theta(x\_t, t) ||^2$$


These below reveal that ${\mu}\_\theta$ must predict $\frac{1}{\sqrt{\alpha\_t}} \left( x\_t - \frac{\beta\_t}{\sqrt{1 - \bar{\alpha}\_t}} \boldsymbol{\epsilon} \right)$, so in other words, we can choose to parameterize ${\mu}_\theta$ in terms of predicting $\boldsymbol{\epsilon}$:
$$
\boldsymbol{\mu}\_{\theta}(\mathbf{x}\_t, t) := \frac{1}{\sqrt{\alpha\_t}} \left( \mathbf{x}\_t - \frac{\beta\_t}{\sqrt{1 - \bar{\alpha}\_t}} \boldsymbol{\epsilon}\_{\theta}(\mathbf{x}\_t, t) \right)
\tag{19}
$$

where $\boldsymbol{\epsilon}\_{\theta}(\mathbf{x}\_t, t)$ is a neural network that predicts the noise $\boldsymbol{\epsilon}$ added to $\mathbf{x}\_0$ to obtain $\mathbf{x}\_t$. To sample $x_{t-1} \sim p_\theta(x_{t-1}|x_t)$ is to compute:
$
\mathbf{x}\_{t-1} = \boldsymbol{\mu}\_{\theta}(\mathbf{x}\_t, t) + \boldsymbol{\sigma}\_t \mathbf{z}$, where $\mathbf{z} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})
$

Finally, we take gradient descent on the following simplified objective:
$$
L\_{t-1} := \mathbb{E}\_{\mathbf{x}\_0, \boldsymbol{\epsilon}} \left[ \left\| \boldsymbol{\epsilon} - \boldsymbol{\epsilon}\_{\theta}(\sqrt{\bar{\alpha}\_t} \mathbf{x}\_0 + \sqrt{1 - \bar{\alpha}\_t} \boldsymbol{\epsilon}, t) \right\|^2 \right]
\tag{20}
$$  

---

There may be mistakes during the writing, and I will proofread and correct them later.







 




    

