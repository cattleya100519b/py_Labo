set -e

PWD_ABS="$(pwd)"

if grep -qi microsoft /proc/version 2>/dev/null; then
    echo "Detected WSL2 → run with GPU (CUDA)"
    docker build -f Dockerfile.cuda -t app .
    docker run --rm -it --gpus all \
        -v "$PWD_ABS/src:/app/src" \
        -w /app/src \
        app bash
else
    echo "Mac/Other → run without GPU"
    docker compose run --rm --build app bash
fi
