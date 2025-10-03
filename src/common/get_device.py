import torch
import platform

def get_device() -> torch.device:
    """
    デバイス判別関数

    Returns:
        torch.device: デバイス

    Examples:
        >>> device = get_device()
        >>> x = torch.tensor([1, 2, 3, 4], device=device)
        >>> print(f"Using device: {device}")
    """
    system = platform.system()
    
    if system == 'Darwin':  # macOS
        if torch.backends.mps.is_available():
            return torch.device('mps')
        else:
            return torch.device('cpu')
    else:
        if torch.cuda.is_available():
            return torch.device('cuda')
        else:
            return torch.device('cpu')
