import plotly.graph_objects as go
import numpy as np

def draw_3d_plotly(X: np.ndarray,Y: np.ndarray,Z: np.ndarray)->None:
    """
    """
    fig3d = go.Figure(data=[go.Surface(z=Z, x=X, y=Y, colorscale='Viridis')])
    fig3d.update_layout(
        scene=dict(
            xaxis_title='x',
            yaxis_title='y',
            zaxis_title='z(x,y)'
            ),
        title="3D Surface Plot (Interactive)",
        paper_bgcolor='black',   # 図全体の背景
        plot_bgcolor='black',    # 座標軸の背景
        font_color='white',      # 軸ラベル・タイトルなどの文字色
        width=700,
        height=600,
        )
    fig3d.show()