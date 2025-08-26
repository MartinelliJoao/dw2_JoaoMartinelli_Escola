from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, Base, engine
from models import Turma, Aluno

app = FastAPI(title="Escola API")

# Garantir que as tabelas existam
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/turmas")
def list_turmas(db: Session = Depends(get_db)):
    turmas = db.query(Turma).all()
    return [{"id": t.id, "nome": t.nome, "capacidade": t.capacidade} for t in turmas]

@app.get("/alunos")
def list_alunos(db: Session = Depends(get_db)):
    alunos = db.query(Aluno).all()
    result = []
    for a in alunos:
        result.append({
            "id": a.id,
            "nome": a.nome,
            "data_nascimento": a.data_nascimento.isoformat() if a.data_nascimento else None,
            "email": a.email,
            "status": a.status,
            "turma_id": a.turma_id,
        })
    return result
