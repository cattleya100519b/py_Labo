from IPython.display import display, Math
from sympy import latex
from sympy.core import Basic


def disp_tex(str_tex: str | Basic) -> None:
    """
    Display LaTeX string in Jupyter Notebook.
    （要は、
    from IPython.display import display, Math
    を省略できるだけ）

    Parameters
    ----------
    str_tex : str or sympy.core.basic.Basic
        LaTeX string to display.

    Examples
    --------
    >>> from sympy import symbols, latex
    >>> from common import disp_tex
    
    >>> x = symbols('x')
    >>> disp_tex(x+x-1)

    >>> a,b,c=symbols('a b c')
    >>> disp_tex(f'{latex(left:=a*x**2+b*x+c)}=0')
    >>> disp_tex(f'{x}={latex(solveset(left, x))}')

    """

    if isinstance(str_tex, Basic):
        str_tex = latex(str_tex)

    display(Math(str_tex))
