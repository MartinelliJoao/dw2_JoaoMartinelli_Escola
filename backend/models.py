from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import Aluno, Turma
from datetime import date
from typing import List, Optional

from pydantic import BaseModel, EmailStr

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestão Escolar")


# ---------- SCHEMAS ----------
class AlunoBase(BaseModel):
    nome: str
    data_nascimento: date
    email: Optional[EmailStr] = None
    status: str = "inativo"
    turma_id: Optional[int] = None


class AlunoCreate(AlunoBase):
    pass


class AlunoResponse(AlunoBase):
    id: int

    class Config:
        orm_mode = True


class TurmaBase(BaseModel):
    nome: str
    capacidade: int


class TurmaCreate(TurmaBase):
    pass


class TurmaResponse(TurmaBase):
    id: int
    alunos: List[AlunoResponse] = []

    class Config:
        orm_mode = True


# ---------- ENDPOINTS ----------
@app.get("/alunos", response_model=List[AlunoResponse])
def listar_alunos(
    search: Optional[str] = None,
    turma_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Aluno)
    if search:
        query = query.filter(Aluno.nome.ilike(f"%{search}%"))
    if turma_id:
        query = query.filter(Aluno.turma_id == turma_id)
    if status:
        query = query.filter(Aluno.status == status)
    return query.all()


@app.post("/alunos", response_model=AlunoResponse)
def criar_aluno(aluno: AlunoCreate, db: Session = Depends(get_db)):
    novo = Aluno(**aluno.dict())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@app.put("/alunos/{id}", response_model=AlunoResponse)
def atualizar_aluno(id: int, dados: AlunoCreate, db: Session = Depends(get_db)):
    aluno = db.query(Aluno).get(id)
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    for key, value in dados.dict().items():
        setattr(aluno, key, value)
    db.commit()
    db.refresh(aluno)
    return aluno


@app.delete("/alunos/{id}")
def deletar_aluno(id: int, db: Session = Depends(get_db)):
    aluno = db.query(Aluno).get(id)
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    db.delete(aluno)
    db.commit()
    return {"message": "Aluno deletado com sucesso"}


@app.get("/turmas", response_model=List[TurmaResponse])
def listar_turmas(db: Session = Depends(get_db)):
    return db.query(Turma).all()


@app.post("/turmas", response_model=TurmaResponse)
def criar_turma(turma: TurmaCreate, db: Session = Depends(get_db)):
    nova = Turma(**turma.dict())
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova


@app.post("/matriculas")
def matricular(aluno_id: int, turma_id: int, db: Session = Depends(get_db)):
    aluno = db.query(Aluno).get(aluno_id)
    turma = db.query(Turma).get(turma_id)

    if not aluno or not turma:
        raise HTTPException(status_code=404, detail="Aluno ou turma não encontrado")

    if len(turma.alunos) >= turma.capacidade:
        raise HTTPException(status_code=400, detail="Turma cheia")

    aluno.turma_id = turma_id
    aluno.status = "ativo"
    db.commit()
    return {"message": f"Aluno {aluno.nome} matriculado na turma {turma.nome}"}
