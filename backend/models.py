
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


# SQLAlchemy ORM models: Aluno e Turma
class Turma(Base):
    __tablename__ = 'turmas'

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    capacidade = Column(Integer, nullable=False, default=0)

    alunos = relationship('Aluno', back_populates='turma', cascade='all, delete-orphan')


class Aluno(Base):
    __tablename__ = 'alunos'

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    data_nascimento = Column(Date, nullable=False)
    email = Column(String, nullable=True)
    status = Column(String, nullable=False, default='inativo')
    turma_id = Column(Integer, ForeignKey('turmas.id'), nullable=True)

    turma = relationship('Turma', back_populates='alunos')
