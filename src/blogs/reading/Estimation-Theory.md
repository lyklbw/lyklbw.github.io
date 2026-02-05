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






 

