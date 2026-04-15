FROM python:3.9

RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Instalar dependencias
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copiar todo nuestro código (incluyendo modelo_ia y pesos)
COPY --chown=user . /app

# Iniciar nuestro FastAPI en el puerto 7860 (requerido por HuggingFace)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
