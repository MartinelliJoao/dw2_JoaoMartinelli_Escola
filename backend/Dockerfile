FROM python:3.11-slim

WORKDIR /app

# Copia apenas requirements e instala antes para aproveitar cache
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto do backend
COPY . .

# Comando padrão: roda o seed (pode ser sobrescrito no docker run)
CMD ["python", "seed.py"]
