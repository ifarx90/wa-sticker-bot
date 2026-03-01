# 1. Pake base image Node.js versi 18
FROM node:18-bullseye

# 2. Install library sistem yang dibutuhin sama library stiker lo (Sharp, Canvas, FFmpeg)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Set folder kerja di dalam server
WORKDIR /app

# 4. Copy file package.json dulu biar server install library-nya
COPY package*.json ./
RUN npm install

# 5. Copy semua sisa file bot lo dari komputer ke server
COPY . .

# 6. Buka port buat pinger (Hugging Face pake port 7860)
EXPOSE 7860
ENV PORT 7860

# 7. Perintah buat nyalain bot
CMD ["node", "index.js"]