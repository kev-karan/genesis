FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py loaddata fluxogramas/fixtures/protocolos.json casos/fixtures/caso_dengue.json casos/fixtures/caso_sedacao.json calculadora/fixtures/medicamentos_sedacao.json && python manage.py runserver 0.0.0.0:8000"]
