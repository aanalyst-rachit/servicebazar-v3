FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ffmpeg \
       python3 \
       python3-pip \
       ca-certificates \
       curl \
       unzip \
    && pip3 install --no-cache-dir --break-system-packages yt-dlp \
    && curl -fsSL https://deno.land/install.sh | sh \
    && ln -s /root/.deno/bin/deno /usr/local/bin/deno \
    && yt-dlp --version \
    && deno --version \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY factory/coaching-studio/backend ./factory/coaching-studio/backend

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "factory/coaching-studio/backend/server.js"]
