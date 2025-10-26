FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy models from API service
COPY --from=api /app/models.py /app/models.py

# Run Celery worker
CMD ["celery", "-A", "tasks.celery_app", "worker", "-l", "info", "-c", "8", "--max-tasks-per-child=100"]
