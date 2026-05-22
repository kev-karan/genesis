FROM python:3.12-slim

WORKDIR /app

# Instala Firefox e dependências
RUN apt-get update && apt-get install -y \
    firefox-esr \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia código
COPY . .

# Roda testes
CMD ["pytest", "tests/", "-v"]
