FROM python:3.12-slim

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install UV
RUN pip install uv

# Install dependencies using UV
RUN uv pip install -r <(uv pip freeze)

# Copy application code
COPY app/ ./app/
COPY templates/ ./templates/

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]