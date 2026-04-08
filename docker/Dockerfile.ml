FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY apps/ml/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY apps/ml/src ./src
COPY apps/ml/main.py ./

# Create models directory
RUN mkdir -p /app/models

# Set environment variables
ENV PORT=3003
ENV PYTHONUNBUFFERED=1

EXPOSE 3003

CMD ["python", "main.py"]