## 📌 Visão Geral

Este projeto consiste em uma aplicação web completa de gerenciamento de tarefas, com suporte a tarefas pessoais e colaborativas por organização.

A aplicação permite que usuários realizem cadastro, autenticação e organizem suas atividades em dois contextos principais: tarefas individuais e tarefas compartilhadas dentro de organizações. O sistema foi projetado com foco em produtividade, organização e escalabilidade, simulando um ambiente real de gestão de tarefas em equipe.

---

## 🎯 Objetivo

O principal objetivo do projeto é desenvolver um sistema eficiente de gerenciamento de tarefas, permitindo que usuários controlem suas atividades pessoais e colaborem em equipe dentro de organizações.

Além disso, o projeto busca:

- Aplicar conceitos de desenvolvimento fullstack (React + FastAPI)
- Implementar autenticação segura com JWT
- Estruturar um sistema multiusuário com organizações
- Permitir colaboração entre usuários
- Servir como base para evolução em um sistema SaaS de produtividade

---

## 🧠 Funcionalidades

- 🔐 Autenticação de usuários (Login / Register)
- 👤 Gerenciamento de sessão (JWT)
- 🏢 Criação e gerenciamento de organizações
- 👥 Adição de membros por e-mail
- ✅ Criação de tarefas pessoais
- 📂 Criação de tarefas por organização
- 📅 Definição de prazo (due date)
- 🔄 Controle de status (to_do, doing, done)
- ⚡ Carregamento dinâmico (lazy loading) de membros
- 🖥️ Interface moderna com React + Tailwind

---

## 🛠️ Tecnologias utilizadas

### Frontend

- React (Vite)
- TypeScript
- TailwindCSS
- React Router
- Axios

### Backend

- FastAPI
- Python
- JWT (Autenticação)
- MongoDB
- Pydantic

---

## ⚙️ Como rodar o projeto

> O projeto já está disponível online no link abaixo:  
https://projeto-to-do-list-xi-gold.vercel.app/

> Caso queira executar localmente, siga os passos abaixo.

---

### 🔙 Backend (FastAPI)

```bash

cd backend

python -m venv .venv

source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate     # Windows

pip install -r requirements.txt

uvicorn app.main:app --reload

```

Servidor disponível em: http://127.0.0.1:8000

### 🔜 Frontend (React)

```bash

cd backend

cd frontend

npm install
npm run dev

```

App disponível em: http://localhost:5173


## 🔄 Fluxo de funcionamento

1. O usuário acessa a aplicação via navegador.

2. Na tela inicial, pode:
   - Fazer login
   - Criar uma conta

3. Ao se cadastrar:
   - Informa nome, e-mail e senha
   - O sistema registra o usuário

4. Após login:
   - O usuário acessa o dashboard

5. No sistema, o usuário pode:
   - Criar tarefas pessoais
   - Criar organizações
   - Adicionar membros via e-mail

6. Dentro de uma organização:
   - Os membros podem visualizar informações
   - O dono pode adicionar novos membros
   - As tarefas podem ser compartilhadas

7. As tarefas possuem:
   - Título
   - Descrição
   - Prazo
   - Status (`to_do`, `doing`, `done`)

8. O sistema organiza as tarefas:
   - Prioriza prazos mais próximos
   - Mantém tarefas concluídas ao final

9. O usuário pode:
   - Criar, atualizar e visualizar tarefas
   - Participar de múltiplas organizações

10. Ao sair:
    - A sessão é encerrada
    - O usuário retorna para a tela de login