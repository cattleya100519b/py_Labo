import matplotlib.pyplot as plt
import numpy as np

def draw_3d_pyplot(X: np.ndarray,Y: np.ndarray,Z: np.ndarray)->None:
    """
    """
    fig = plt.figure(figsize=(5, 5))
    ax = fig.add_subplot(111, projection='3d')
    ax.plot_surface(X, Y, Z, cmap="viridis", edgecolor="none")
    ax.set(
        xlabel="x",
        ylabel="y",
        zlabel="z(x,y)",    # 何故か見切れる
        title="Surface plot of z(x,y)"
        )
    plt.show()