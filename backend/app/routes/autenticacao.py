from fastapi import APIRouter, Header, HTTPException
from app.schemas.autenticacao import RegisterSchema, LoginSchema
from app.autenticacao import register_user, login_user
from backend.app.utils.utils_jwt import decode_access_token
from backend.app.utils.utils_auth import get_user_by_id

router = APIRouter(prefix="/auth", tags=["Auth"])

# Rota para registrar um novo usuário, verificando se o e-mail já existe e criando um token de acesso
@router.post("/register")
def register(data: RegisterSchema):
    return register_user(data)

# Rota para autenticar um usuário, verificando o e-mail e a senha, e retornando um token de acesso se as credenciais forem válidas
@router.post("/login")
def login(data: LoginSchema):
    return login_user(data)

# Rota para obter os dados do usuário autenticado, decodificando o token de acesso e retornando as informações do usuário
@router.get("/me")
def me(authorization: str = Header(default=None)):
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

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }