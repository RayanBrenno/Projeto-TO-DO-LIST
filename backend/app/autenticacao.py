from fastapi import HTTPException
from app.utils_auth import get_user_by_email, create_user, get_user_by_id
from app.utils_jwt import hash_password, verify_password, create_access_token

# Função para serializar os dados do usuário, convertendo o ID para string
def serialize_user(user):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }

# Função para registrar um novo usuário, verificando se o e-mail já existe e criando um token de acesso
def register_user(data):
    existing_user = get_user_by_email(data.email.lower())
    if existing_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    new_user = {
        "name": data.name,
        "email": data.email.lower(),
        "password": hash_password(data.password),
    }

    created_user = create_user(new_user)
    token = create_access_token({"sub": str(created_user["_id"])})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(created_user),
    }

# Função para autenticar um usuário, verificando o e-mail e a senha, e retornando um token de acesso se as credenciais forem válidas
def login_user(data):
    user = get_user_by_email(data.email.lower())

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    token = create_access_token({"sub": str(user["_id"])})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }