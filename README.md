# Usage

You can run this as a docker container or you can just run it locally. Either way, you will need to supply the container with a Cerebras api key (honestly though, swapping out for a different model is so easy...)

## Environment Variables

| Variable | Description                                                                |
| -------- | -------------------------------------------------------------------------- |
| API_BASE | The base URL for the provider. You can use any openai compatible provider. |
| MODEL    | The model to use.                                                          |
| API_KEY  | Your provider API key.                                                     |

I've also had really good results from Gemini 2.5 flash preview. I was disappointed with openrouter's deepseek r1 zero model. I would recommend using a thinking model. The prompts assume that the model reasons separately to the output. I had really good results with qwen-32b on Cerebras (it's got the advantage of being nice and fast), but that included prompting to use `<think />` tags and code to strip them out.

## Docker

1. Build the container

```bash
docker build -t askmac .
```

2. Run the container

```bash
docker run -d -p 8000:8000 \
    -e API_BASE=https://openrouter.ai/api/v1 \
    -e MODEL=deepseek/deepseek-r1-zero:free \
    -e API_KEY=sk-your-openrouter-key \
    askmac
```

## Local

To use locally, you will need to have the client running:

```bash
$ cd client
$ npm install
$ npm run dev
```

Then you can run the server:

1. Install dependencies

```bash
pip install -r requirements.txt
```

2. Run the app

```bash
API_BASE=https://openrouter.ai/api/v1 \
    MODEL=deepseek/deepseek-r1-zero:free \
    API_KEY=sk-your-openrouter-key \
    uvicorn app.main:app --reload
```
