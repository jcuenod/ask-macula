from fastapi import APIRouter, HTTPException, Body

from app.models import VisualizationRequest, VisualizationResponse
from app.services.llm_service import get_js_code


router = APIRouter()


@router.post(
    "",
    summary="Produce the js for a visualization",
    description="Receives a user query and the associated SQL query and returns the js code for an echarts visualization.",
    response_model=VisualizationResponse,
    tags=["Query Handling"],
)
async def process_query(request: VisualizationRequest = Body(...)):
    """
    Handles a user query by taking a `VisualizationRequest` object containing the
    `query_text` and returns a `VisualizationResponse` with an answer.

    - **query_text**: The user's query. Must be a non-empty string.
    - **sql_query**: The SQL query. Must be a non-empty string.
    """
    # Pydantic's `min_length=1` handles empty strings.
    # Adding an explicit check for strings containing only whitespace.
    if not request.query.strip() or not request.sql_query.strip():
        raise HTTPException(
            status_code=400,
            detail="Query text and SQL query cannot be empty or contain only whitespace.",
        )

    # Get js code
    try:
        js_code = get_js_code(request.query, request.sql_query)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to process the query.",
        )

    # Return the result as a
    return VisualizationResponse(js_code=js_code)
