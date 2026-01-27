## Synthetic Aperture Interferometry Radiometer Notes
> author: lyk
> 
> date: 2025-12-22
>
> location: Santa Barbara, CA

### Background
> In the section, I will detailedly discuss the principles of the SAIR system

SAIR obtains the cross-correlation outputs of signals received by different baselines in the array through a complex correlator; these frequency-domain outputs are commonly referred to as visibility functions. The Van Cittert–Zernike theorem establishes the relationship between the visibility function in the frequency domain and the brightness temperature (BT) image in the spatial domain, showing that this relationship can be expressed as a spatial integral when spatial decorrelation effects are neglected

$$
V(u, v)=
\iint_{\xi^2 + \eta^2 \le 1}
\frac{k Z}{\lambda_c^2}
\frac{T_B(\xi, \eta)\, |f(\xi, \eta)|^2}
{\sqrt{1 - \xi^2 - \eta^2}}
\, e^{-j 2\pi (u \xi + v \eta)}
\, d\xi \, d\eta
\tag{1}
$$

where $\xi$ and $\eta$ denotes direction cosine coordinates, $k$ is the Boltzmann constant, $Z$ is air impedance, $f(\xi, \eta)$ denotes antenna's normalized field pattern, and $u$ and $v$ are baselines, normalized by the center wavelength $\lambda_c$. Let the modified brightness temperature be defined as

$$
T_M(\xi,\eta)=
\frac{\kappa Z}{\lambda_c^{2}}
\,
\frac{T_B(\xi,\eta)\,\lvert f(\xi,\eta)\rvert^{2}}
{\sqrt{1-\xi^{2}-\eta^{2}}}
\tag{2}
$$

Then, equation (1) can be rewritten as a strict two-dimensional Fourier transform relationship:

$$
V(u,v)=
\iint_{\xi^{2}+\eta^{2}\le 1}
T_M(\xi,\eta)\,
e^{-j2\pi\,(u\xi+v\eta)}
 d\xi\, d\eta.
\tag{3}
$$

Based on the inverse Fourier transform theory, the modified brightness temperature image can be reconstructed from the visibility function as follows:

$$
T_M(\xi,\eta)=
\iint
V(u,v)\,
e^{j2\pi\,(u\xi+v\eta)}
\, du\, dv.
\tag{4}
$$

In practical applications, owing to the limited number of antennas and the resulting limited number of baselinesm, the $u-v$ distribution is discreted and band-limited sampled. Hence (4) can be expressed through a inverse discrete Fourier transform (IDFT):

$$
\hat{T}\_M(\xi,\eta)=
\Delta s
\sum_{i=1}^{N_v}
V(u_i,v_i)\,
e^{j2\pi\,(u_i\xi+v_i\eta)}.
$$



whre $N_v$ is the number of non-redundant baselines, and $\Delta s$ is the area of each cell in the $u-v$ plane. 
<!-- $W(u_i,v_i)$ is the windowing function applied to the visibility data to suppress the side lobes, which can smooth the reconstructed image and reduce background noise but may also decrease the spatial resolution. -->


### Methods for RFI Mitigation


### Question？
1. what is the spatial decorrelation effect?

2. what is the meanind of the direction cosine coordinates?