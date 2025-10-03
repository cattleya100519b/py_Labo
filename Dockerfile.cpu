FROM python:latest
WORKDIR /app/src
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Dockerコンテナ内で新しいKernelを登録
RUN python -m ipykernel install --user --name=my_docker_kernel --display-name "Python (Docker)"
# Pythonのパスを通す
RUN ipython profile create
RUN echo 'import sys\nimport os\nsys.path.append(os.path.abspath("/app/src"))' > ~/.ipython/profile_default/startup/00-first.py