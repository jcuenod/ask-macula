from fastapi import APIRouter, HTTPException, Body, Request
from app.db.database import run_query
from app.models import QueryResponse, QueryRequest
from app.services.gform import log_to_gform
from app.services.llm_service import get_sql_query
from app.services.rate_limiter import limiter

router = APIRouter()


@router.post(
    "",
    summary="Process a user query",
    description="Receives a user query and returns a SQL query and results.",
    response_model=QueryResponse,
    tags=["Query Handling"],
)
@limiter.limit("50/day")
async def process_query(request: Request, request_query: QueryRequest = Body(...)):
    """
    Handles a user query by taking a `QueryRequest` object containing the
    `query_text` and returns a `QueryResponse` with an answer.

    - **query_text**: The user's query. Must be a non-empty string.
    """
    if not request_query.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query text cannot be empty or contain only whitespace.",
        )

    log_to_gform(
        key="text_to_sql_query",
        value=request_query.query,
    )
    sql_query = await get_sql_query(request_query.query)
    if not sql_query:
        raise ValueError("No results found.")
    result = await run_query(sql_query)

    return QueryResponse(
        results=result,
        sql_query=sql_query,
    )


# to use:
# curl -X POST "http://localhost:8000/api/query" -H "accept: application/json" -H "Content-Type: application/json" -d '{"query": "what are the most common nouns in the pauline epistles?"}'
