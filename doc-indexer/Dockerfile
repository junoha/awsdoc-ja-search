FROM python:3.8-slim-buster as builder

COPY ./app /app
WORKDIR /app

ENV PYTHONPATH=${PYTHONPATH}:${PWD} 

RUN pip3 install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

FROM builder as runner

WORKDIR /app

RUN apt update \
  && apt install -y libpq5 libxml2 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -r -s /bin/false indexer
USER indexer

CMD ["python", "indexer.py"]