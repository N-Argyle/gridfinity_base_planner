# Dev container for Gridfinity Base Planner
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:latest

# Install system dependencies for node-canvas and node-gyp
RUN apt-get update && \
    apt-get install -y \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    build-essential \
    g++ \
    pkg-config \
    libpixman-1-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# [Optional] Install additional tools or dependencies here
