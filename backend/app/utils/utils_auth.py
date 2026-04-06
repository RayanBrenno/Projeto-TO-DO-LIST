from app.database import users_collection

# Função para obter um usuário pelo e-mail, usada para verificar se o e-mail já existe durante o registro e para autenticar durante o login
def get_user_by_email(email: str):
    return users_collection.find_one({"email": email})

# Função para obter um usuário pelo ID, usada para retornar os dados do usuário autenticado
def get_user_by_id(user_id):
    from bson import ObjectId
    return users_collection.find_one({"_id": ObjectId(user_id)})

# Função para criar um novo usuário no banco de dados, usada durante o registro
def create_user(data: dict):
    result = users_collection.insert_one(data)
    return users_collection.find_one({"_id": result.inserted_id})