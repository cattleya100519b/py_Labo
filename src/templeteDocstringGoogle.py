"""
モジュールの概要を1行で記述。

詳細説明（必要に応じて複数行）。

Functions:
    func1: 関数 func1 の説明
    func2: 関数 func2 の説明

Classes:
    ClassName: クラス ClassName の説明

Exceptions:
    CustomError: このモジュールで定義された例外の説明
"""


def function_name(arg1: type, arg2: type = default) -> return_type:
    """
    関数の概要を1行で記述。

    詳細な説明（必要に応じて複数行）。

    Args:
        arg1 (type): 説明
        arg2 (type, optional): 説明。デフォルトは default

    Returns:
        return_type: 戻り値の説明

    Raises:
        ExceptionType: 発生条件の説明

    Yields:
        yield_type: ジェネレータの場合の説明

    Examples:
        >>> function_name(1)
        expected_output
        >>> function_name(2, arg2="value")
        expected_output
    """
    pass


class ClassName:
    """
    クラスの概要を1行で記述。

    詳細説明（必要に応じて複数行）。

    Attributes:
        attr1 (type): 属性1の説明
        attr2 (type): 属性2の説明

    Methods:
        method1: メソッド1の説明
        method2: メソッド2の説明
    """

    def __init__(self, attr1: type, attr2: type):
        """
        コンストラクタの説明。

        Args:
            attr1 (type): 属性1の初期値
            attr2 (type): 属性2の初期値
        """
        self.attr1 = attr1
        self.attr2 = attr2

    def method1(self, arg: type) -> return_type:
        """
        メソッド1の簡単な説明。

        Args:
            arg (type): 引数の説明

        Returns:
            return_type: 戻り値の説明
        """
        pass
