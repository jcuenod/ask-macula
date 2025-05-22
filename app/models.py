from pydantic import BaseModel
from typing import List, Dict, Any


class QueryRequest(BaseModel):
    query: str


class QueryResponse(BaseModel):
    results: List[Dict[str, Any]]
    sql_query: str


class VisualizationRequest(BaseModel):
    query: str
    sql_query: str


class VisualizationResponse(BaseModel):
    js_code: str
