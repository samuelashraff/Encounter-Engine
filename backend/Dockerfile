# Backend Dockerfile
FROM python:3.11-slim

# Set the working directory inside the container.
# From this point onward, all paths (for COPY, RUN, CMD, etc.) are relative to /app inside the container.
WORKDIR /app

# Copy the dependency list first (requirements.txt) before copying the rest of the code.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend source code into the container's /app directory.
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
