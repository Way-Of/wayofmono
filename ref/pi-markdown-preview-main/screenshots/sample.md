Here's a sample that shows off the renderer's capabilities:

## Mathematical Foundations

The **Gaussian integral** is one of the most beautiful results in mathematics:

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

### Why it matters

This result connects to:

1. **Probability theory** — the normal distribution $f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$
2. **Physics** — quantum mechanics, statistical mechanics
3. **Signal processing** — Fourier transforms

### Code example

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-4, 4, 1000)
y = np.exp(-x**2)

plt.fill_between(x, y, alpha=0.3, color="steelblue")
plt.plot(x, y, linewidth=2)
plt.title(r"$e^{-x^2}$")
plt.show()
```
