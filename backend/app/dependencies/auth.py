from fastapi import Header, HTTPException
from app.utils.utils_jwt import decode_access_token
from app.utils.utils_auth import get_user_by_id


def get_current_user(authorization: str = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token não informado")

    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")

    user_id = payload.get("sub")
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return user