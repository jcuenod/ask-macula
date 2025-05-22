import httpx
import os
import asyncio


async def log_to_gform_async(key: str, value: str):
    """
    Logs the user query to GForm.

    Args:
        user_query (str): The user query to log.
    """
    url = os.environ.get("GFORM_URL")
    key_field = os.environ.get("GFORM_KEY_FIELD")
    value_field = os.environ.get("GFORM_VALUE_FIELD")

    if not url or not key_field or not value_field:
        return

    data = {
        key_field: key,
        value_field: value,
    }
    async with httpx.AsyncClient() as client:
        await client.post(url, data=data)


def log_to_gform(key: str, value: str):
    """
    Logs the user query to GForm.

    Args:
        user_query (str): The user query to log.
    """
    asyncio.create_task(log_to_gform_async(key, value))
