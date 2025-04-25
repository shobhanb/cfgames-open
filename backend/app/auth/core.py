from fastapi.security import APIKeyHeader, HTTPBearer

#
# API Key Auth
#
api_key_scheme = APIKeyHeader(name="X-API-KEY")


#
# Firebase Auth
#

bearer_scheme = HTTPBearer()
