# Backend — Gestão Escolar

Este diretório contém o backend da aplicação (FastAPI + SQLAlchemy).

Requisitos
- Python 3.8+ (recomenda-se 3.11)
- Docker (opcional)

Como usar (PowerShell)
1. Abra PowerShell na pasta `backend`.
2. Execute o helper (cria `.venv`, instala dependências, popula DB e inicia o servidor):

   .\start-backend.ps1

   Se houver bloqueio de execução:

   powershell -ExecutionPolicy Bypass -File .\start-backend.ps1

3. Endpoints disponíveis após subir o servidor (http://127.0.0.1:8000):
- `/` — status
- `/docs` — Swagger UI
- `/alunos` — GET/POST/PUT/DELETE
- `/turmas` — GET/POST
- `/matriculas` — POST (matricular aluno)

Executar manualmente (sem helper)
```powershell
py -3 -m venv .venv
. .\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python seed.py
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Docker
- Construir imagem:

  docker build -t gestao-escolar .

- Rodar container (mapear porta):

  docker run --rm -p 8000:8000 gestao-escolar python -m uvicorn app:app --host 0.0.0.0 --port 8000

(ou use o docker-compose incluído: `docker-compose up --build`)

Observações
- O banco padrão é SQLite (`backend/app.db`). Se usar Docker, o `docker-compose.yml` mapeia esse arquivo para persistência.
- Se o Python não estiver no PATH, instale-o e marque "Add to PATH" no instalador.

Problemas comuns
- Erro ao ativar `.venv`: rode PowerShell como administrador ou use `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.
- `docker` não encontrado: instale Docker Desktop.

