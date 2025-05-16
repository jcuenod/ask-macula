# Usage

You can run this as a docker container or you can just run it locally. Either way, you will need to supply the container with a Cerebras api key (honestly though, swapping out for a different model is so easy...)

## Docker

1. Build the container

```bash
docker build -t cerebras-api .
```

2. Run the container

```bash
docker run -d -p 8000:8000 \
    -e CEREBRAS_API_KEY=csk-your-cerebras-key \
    cerebras-api
```

## Local

1. Install dependencies

```bash
pip install -r requirements.txt
```

2. Run the app

```bash
CEREBRAS_API_KEY=csk-your-cerebras-key uvicorn app.main:app --reload
```
