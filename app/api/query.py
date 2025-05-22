from fastapi import APIRouter, HTTPException, Body

from app.db.database import run_query
from app.models import QueryResponse, QueryRequest
from app.services.llm_service import get_sql_query


router = APIRouter()


@router.post(
    "",
    summary="Process a user query",
    description="Receives a user query and returns a SQL query and results.",
    response_model=QueryResponse,
    tags=["Query Handling"],
)
async def process_query(request: QueryRequest = Body(...)):
    """
    Handles a user query by taking a `QueryRequest` object containing the
    `query_text` and returns a `QueryResponse` with an answer.

    - **query_text**: The user's query. Must be a non-empty string.
    """
    if not request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query text cannot be empty or contain only whitespace.",
        )

    sql_query = get_sql_query(request.query)
    if not sql_query:
        raise ValueError("No results found.")
    result = run_query(sql_query)

    return QueryResponse(
        results=result,
        sql_query=sql_query,
    )


# to use:
# curl -X POST "http://localhost:8000/api/query" -H "accept: application/json" -H "Content-Type: application/json" -d '{"query": "what are the most common nouns in the pauline epistles?"}'
