FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg wget git \
 && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir numpy scipy tensorflow==2.15.0

WORKDIR /app
RUN git clone --depth 1 https://github.com/birdnet-team/BirdNET-Analyzer .

ENV PORT=8080 
# 8080 for local dev; Railway injects a real port at runtime
EXPOSE $PORT
CMD ["bash", "-c", "python server.py --model models/BirdNET_GLOBAL_6K_V2.4_Model_FP32.tflite --port $PORT"]