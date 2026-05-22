FROM python:3.12-slim

WORKDIR /app

# Instala Firefox e dependências para headless
RUN apt-get update && apt-get install -y \
    firefox-esr \
    libxt6 \
    libdbus-1-3 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia código
COPY . .

# Roda testes
CMD ["pytest", "tests/", "-v"]
