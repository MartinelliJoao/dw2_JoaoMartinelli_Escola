from database import SessionLocal, engine, Base
from models import Aluno, Turma
from datetime import date

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Criar turmas
turmas = [
    Turma(nome="Turma A", capacidade=5),
    Turma(nome="Turma B", capacidade=10),
    Turma(nome="Turma C", capacidade=8),
]
db.add_all(turmas)
db.commit()

# Criar alunos
alunos = [
    Aluno(nome="João Silva", data_nascimento=date(2010, 5, 20), email="joao@example.com"),
    Aluno(nome="Maria Souza", data_nascimento=date(2011, 3, 15), email="maria@example.com"),
    Aluno(nome="Pedro Costa", data_nascimento=date(2009, 8, 12), email="pedro@example.com"),
]

db.add_all(alunos)
db.commit()

print("Seed inserido com sucesso!")
