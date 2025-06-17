
FROM python:3.12-slim

WORKDIR /app

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files
COPY pyproject.toml uv.lock ./

# RUN uv sync 
RUN uv sync --frozen --no-cache

# Copy application code
COPY . . 

# Expose port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "fastapi", "run", "--port", "8000", "--host", "0.0.0.0"]
