import os
import httpx

API_BASE = os.environ.get("PROVIDER_URL")
MODEL = os.environ.get("MODEL")
API_KEY = os.environ.get("API_KEY")


with open("app/assets/sql_system_prompt.md", "r") as f:
    sql_system_prompt = f.read()

with open("app/assets/js_system_prompt.md", "r") as f:
    js_system_prompt = f.read()

if not sql_system_prompt or not js_system_prompt:
    raise ValueError("System prompts are empty. Please check the files.")


async def get_llm_response(
    messages: list,
    provider_url: str = API_BASE,
    model: str = MODEL,
    api_key: str = API_KEY,
    stream: bool = False,
    temperature: float = 0.7,
    max_tokens: int = 8000,
    timeout_seconds: float = 60.0,
):
    """
    Get a response from the LLM asynchronously using httpx.
    """
    url = f"{provider_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    data = {
        "model": model,
        "messages": messages,
        "stream": stream,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    async with httpx.AsyncClient(timeout=timeout_seconds) as client:
        try:
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()  # Raise an exception for HTTP 4xx/5xx errors
            r = response.json()
            # print("LLM Raw Response:", r) # For debugging
            return r
        except httpx.HTTPStatusError as e:
            # Handle HTTP errors (e.g., 401, 429, 500 from the API)
            error_content = e.response.text
            try:
                # Try to parse error as JSON for more details
                error_details = e.response.json()
            except Exception:
                error_details = error_content
            print(f"HTTP error {e.response.status_code} from LLM API: {error_details}")
            raise
        except httpx.RequestError as e:
            # Handle network errors, timeouts, etc.
            print(f"Request error connecting to LLM API: {str(e)}")
            raise
        except Exception as e:
            # Catch any other unexpected errors
            print(f"An unexpected error occurred during LLM call: {str(e)}")
            raise


def get_code_fence_from_response(response: str, code_kind: str) -> str:
    """
    This function extracts the SQL query from the response string.
    It assumes the SQL query is enclosed in triple backticks (```).
    """
    # Find the start and end of the code block
    code_start = response.find(f"```{code_kind}") + len(f"```{code_kind}")
    code_end = response.find("```", code_start)

    code_block = response[code_start:code_end].strip()

    if not code_block:
        raise ValueError("No code query found in the response.")

    return code_block


async def get_sql_query(user_query: str) -> str:
    """
    This function generates a SQL query to find the most common nouns in the Pauline Epistles.
    It uses the Cerebras API to get the SQL query based on the provided system prompt.
    """
    response = await get_llm_response(
        messages=[
            {"role": "system", "content": sql_system_prompt},
            {"role": "user", "content": user_query},
        ],
    )

    response = response["choices"][0]["message"]["content"]
    return get_code_fence_from_response(response, "sql")


async def get_js_code(user_query: str, sql_query: str) -> str:
    """
    This function generates a JavaScript code snippet to visualize the results of the SQL query.
    """
    query = f"# User query:\n\n{user_query}\n\n# SQL:\n\n```sql\n{sql_query}\n```"

    response = await get_llm_response(
        messages=[
            {"role": "system", "content": js_system_prompt},
            {"role": "user", "content": query},
        ],
    )

    response = response["choices"][0]["message"]["content"]

    return get_code_fence_from_response(response, "javascript")
