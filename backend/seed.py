from database import Base, engine, SessionLocal
from models import Aluno, Turma
from datetime import date
import random

Base.metadata.create_all(bind=engine)

# usar SessionLocal para criar sessão
db = SessionLocal()

try:
    # Criar turmas se ainda não existirem
    if db.query(Turma).count() == 0:
        turmas = [
            Turma(nome="1A", capacidade=30),
            Turma(nome="2A", capacidade=25),
            Turma(nome="3B", capacidade=20),
        ]
        db.add_all(turmas)
        db.commit()
        print("Turmas criadas com sucesso.")
    else:
        print("Turmas já populadas. Pulando criação de turmas.")

    # Criar alunos se ainda não existirem
    if db.query(Aluno).count() == 0:
        nomes = ["Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda",
                 "Gabriel", "Helena", "Igor", "Juliana", "Lucas", "Marina",
                 "Nicolas", "Olivia", "Paulo", "Rafaela", "Sofia", "Thiago",
                 "Valentina", "Yasmin"]

        for i, nome in enumerate(nomes):
            aluno = Aluno(
                nome=f"{nome} Silva",
                data_nascimento=date(2005 + (i % 3), (i % 12) + 1, (i % 28) + 1),
                email=f"{nome.lower()}@escola.com",
                status="ativo" if i % 2 == 0 else "inativo",
                turma_id=random.choice([1, 2, 3])
            )
            db.add(aluno)

        db.commit()
        print("Alunos criados com sucesso.")
    else:
        print("Alunos já populados. Pulando criação de alunos.")

    print("Seed concluído com sucesso!")
except Exception as e:
    db.rollback()
    print("Erro ao popular DB:", e)
finally:
    db.close()
