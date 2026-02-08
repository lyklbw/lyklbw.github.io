# Optimizaiton Estimation Theory
> UCSB ECE 240 2025 Winter Quarter
>
> Supervised by Prof. Mahnoosh Alizadeh
>
> Ref: Fundamentals of Statistical Signal Processing: Estimation Theory by Steven M. Kay 1993

## Introduction
1. Estimation in Signal Processing System

    Modern estimation theory lies at the core of many electronic signal processing systems designed to extract useful information from measurements.

    For example, radar systems are used to detect and estimate the position or range of aircraft. In sonar systems, a key objective is to estimate the bearing angle of targets, such as submarines, in the presence of noise.

    A more complicated example is in speech processing system, we estimate the spectral envelope, which will not be changed since the Fourier Transform of a periodic signal is a sampled version of the Fourier Transform of one period of the signal. To extract the spectral envelope, some used a model called Linear Predictive Coding (LPC)

    Although most real-world signals we encounter are continuous-time waveforms, the widespread adoption of digital signal processors has made discrete-time signal processing systems increasingly important. Therefore, we will primarily focus on estimation problems for discrete-time signals.

---

2. The mathematical Estimation Problem

    Mathematically, we have the $N$ points dataset ${x[0], x[1], \ldots, x[N-1]}$, we wish to determine the unknown parameter $\theta$ based on the observations through an estimator, we organize this problem as follows:
    $$
    \hat{\theta} = g(x[0], x[1], \ldots, x[N-1])
    $$

    In determining good estimators the primary step is to mathematically model the data. As the data is inherently random, we use the Probablity Density Function (PDF) / $p(x[0], x[1], \ldots, x[N-1];\theta)$ to describe the statistical properties of the data. 

    Intuitively, the value of $\theta$ affects the probability of data, so we should be able to infer the value of $\theta$ <u> from the observed data.</u>

    As told the PDF is <u>parameterized</u> by the unknown parameter $\theta$, i.e. we have a class of PDFs indexed by $\theta$, and semicolon is used to denote this property of dependence.
    The specification of the PDF is critical in determining a good estimator.

    In a actual problem, we are not given a PDF but must choose one that is not only consistent with the problem constraints and any prior knowledge, but is also <u>mathematically tractable</u>.

    Consider the Dow-Jones Industrial Average (DJIA) shown below.
    <div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
    <div style="flex: 1; text-align: center;">
        <img src="/images/Dow-Jones-Industrial-average.jpg" style="width: 500px; display: block; margin: 0 auto;" />
        <span style="display: block; text-align: center; color: #888;">Dow-Jones Industrial Average</span>
    </div>
    </div>
    We assume that the data actually consist of a straight light embedded in random noise:
    $$
        x[n] = A + Bn + w[n], \quad n = 0, 1, \ldots N-1
        \tag{1}
    $$

    White Gaussian Noise (WGN) is a reasonalbe model for $w[n]$ or each example of $w[n]$ has the PDF $\mathcal{N}(0, \sigma^2)$, which is uncorrelated with each other. The unknown parameters are $A$ and $B$, which can be arranged as a vector parameter $\theta = [A, B]^T$. Let the data $\boldsymbol{x} = [x[0], x[1], \ldots, x[N-1]]^T$, so the PDF is:

    $$
    p(\boldsymbol{x}; \theta) = \prod_{n=0}^{N-1} \frac{1}{\sqrt{2\pi\sigma^2}} \exp\left(-\frac{(x[n] - A - Bn)^2}{2\sigma^2}\right)
    \tag{2}
    $$

    By the way, the assumption of WGN is justified by the need to formulate a mathematically tractable model so that the closed form estimators can be found.

    Evaluation based on Eq. (2) is termed classical estimation in that the parameters otinterest are asumed tobe determnistcbut unknown. But as we can obtain prior knowledge we can assume that $A$ is no longer deterministic but a random variable. Any subsequent estimator will yield in certain range. Such an approach is termed Bayesian estimation.The
    parameter we are attempting to estimate is then viewed as realization of the random
    variable $\theta$. As such,the data are described by the joint PDF
    $$
    p(\boldsymbol{x}, \theta) = p(\boldsymbol{x}|\theta)p(\theta)
    $$
    where $p(\theta)$ is the prior PDF, summarizing our prior knowledge about $\theta$ before observing the data. $p(x|\theta)$ is a conditional PDF, summarizing our knowledge provided by the data $\boldsymbol{x}$ conditioned on knowing $\theta$.

    3. Accessing Estimator Performance
    
    An estimator is a function of the data, which are random variables, it too is a random variable. As such its performance can only be completely described statistically or by its PDF.

    The use of computer simulations for asessing estimation pertormance,although
    quite valuable for gaining insight and motivating conjectures,is never conclusive.
    At best,the true performance may be obtained to the desired degree ot accuracy
    At worst,for an insuficient number of experiments and/or errors in the simulation
    techniques employed,erroneous results may be obtained.


    Another theme that we wil repeatedy encounter is the tradeot between performance and computational complexity.

---

## Minimum Variance Unbiased Estimation

1. Introduction

    In this chapter, We will restrict our attention to estimators which on the average yield the true parameter value. Then, within this class of estimators the goal will be to find the one that exhibits the least variability. 
    
    The notion of a minimum variance unbiased estimator is examined within this chapter, but the means to find it will require some more theory.

2. Summary

    An unbiased estimator is defined as follows:
    $$
    E[\hat{\theta}] = \theta  \quad a< \theta < b
    \tag{3}
    $$
    where $a$ and $b$ are the lower and upper bounds of the parameter $\theta$. 

    Within this class of estimators, the one with the minimum variance is sought.
    Minimum variance unbiased estimators generally do not exist. When they do, several methods can be used to find them. The methods rely on the Cramer-Rao lower bound and the concept of a sufficient statistic. If a minimum variance unbiased estimator does not exist or if both of the previous two approaches fail, a further constraint on the estimator, to being linear in the data, leads to an easily implemented, but suboptimal, estimator.

3. Unbiased Estimators


    For an estimator to be unbiased we mean that on the average the estimator will yield the true value of the unknown parameter. Since the parameter value may in general be anywhere in the interval ( a < $\theta$ < b ), unbiasedness asserts that no matter what the true value of ( $\theta$ ), our estimator will yield it on the average.Unbiased estimator tend to have symmetric PDFs about the true value of $\theta$. 

    The restriction that $E(\hat{\theta}) = \theta$ for all $\theta$ is an important one. Letting $\hat{\theta} = g(\mathbf{x})$, where $\mathbf{x} = [x[0]; x[1]; \cdots; x[N-1]]^T$, it asserts that
    $$
    E(\hat{\theta}) = \int g(x)p(x;\theta)\,dx = \theta \quad \text{for all } \theta.
    $$

4. Minimum Variance Criterion

    In searching for optimal estimators, we need to adopt some optimal criterion. It is natural to think about Mean Square Error (MSE), defined as:
    $$
    MSE = E[(\hat{\theta} - \theta)^2] = \text{Var}(\hat{\theta}) + (E[\hat{\theta}] - \theta)^2
    $$
    where the first term is the variance of the estimator and the second term is the bias of the estimator. It would seem that any criterion which depends on the bias will lead to an unrealizable estimator.

    From a practical viewpoint, the minimum MSE estimator needs to be abandoned.
    An alternative approach is to constrain the bias to be zero and find the estimator which
    minimizes the variance. Such an estimator is termed the minimum variance unbiased
    (MVU) estimator. Note that the MSE of an unbiased estimator is just the variance.

5. Existence of MVUE

    In general, the MVE estimator does not always exist, and it may also be possible that there may not exist even an unbiased estimator.
  <div style="display: flex; justify-content: center; align-items: flex-start; gap: 32px; margin: 16px 0;">
    <div style="flex: 1; text-align: center;">
        <img src="/images/existenceofMVUE.png" style="width: 500px; display: block; margin: 0 auto;" />
        <span style="display: block; text-align: center; color: #888;">Possibile dependence of estimator variance with \theta
 </span>
    </div>
    </div>

6. Finding the MVUE

    Even if there is a MVE estimator, it may not like a “turn-the-crank” procedure which can always produce the estimator.
    But there are some approaches:

    * Cramer-Rao Lower Bound (CRLB)
    * Rao-Blackwell-Lehman-Scheffe Theorem
    * Further constraint of linearity and unbiasedness  

## Cramer-Rao Lower Bound (CRLB)
The CRLB provides a lower bound on the variance of any unbiased estimator. If an unbiased estimator achieves this bound, it is the MVUE. However, not all unbiased estimators achieve the CRLB, and in some cases, the CRLB may not beattainable. The CRLB is extrmely useful in practice. At best it can allows us to assert that an estimator is the MVU estimator. At worst, it provides the benchmark against which we can compare the performance of any unbiased estimator.

1. Estimator Accuracy Considerations

    Since all of the information is embodied in the observed data and the underlying PDF, the estimation accuracy is determined directly by the PDF. So in general, the more the PDF is influenced by the unknown parameters, the better we should be able to estimate it.

    When the PDF is viewed as a function of the unknown parameter (with fixed x)
    



