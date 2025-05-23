from fastapi.security import APIKeyHeader

#
# API Key Auth
#
api_key_scheme = APIKeyHeader(name="X-API-KEY")
