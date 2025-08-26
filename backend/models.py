from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Turma(Base):
    __tablename__ = "turmas"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)
    capacidade = Column(Integer, nullable=False)

    alunos = relationship("Aluno", back_populates="turma")


class Aluno(Base):
    __tablename__ = "alunos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(80), nullable=False)
    data_nascimento = Column(Date, nullable=False)
    email = Column(String, unique=True, nullable=True)
    status = Column(String, nullable=False, default="inativo")  # ativo / inativo
    turma_id = Column(Integer, ForeignKey("turmas.id"), nullable=True)

    turma = relationship("Turma", back_populates="alunos") .
