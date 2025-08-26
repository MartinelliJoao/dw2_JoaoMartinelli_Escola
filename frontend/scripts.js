const API_URL = "http://127.0.0.1:8000";

// Elementos do DOM
const alunosTable = document.getElementById("alunos-tbody");
const formAluno = document.getElementById("form-aluno");
const turmaSelect = document.getElementById("turma-select");
const filtroStatus = document.getElementById("filtro-status");

// Variável de controle (edição)
let editandoId = null;

// =========================
// FUNÇÕES AUXILIARES
// =========================
async function carregarAlunos() {
  alunosTable.innerHTML = "";
  let response = await fetch(`${API_URL}/alunos`);
  let alunos = await response.json();

  // Aplicar filtros
  let statusFiltro = filtroStatus.value;
  let turmaFiltro = turmaSelect.value;

  alunos = alunos.filter(a => {
    if (statusFiltro && a.status !== statusFiltro) return false;
    if (turmaFiltro && a.turma_id != turmaFiltro) return false;
    return true;
  });

  alunos.forEach(aluno => {
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${aluno.id}</td>
      <td>${aluno.nome}</td>
      <td>${aluno.data_nascimento}</td>
      <td>${aluno.email ?? "-"}</td>
      <td>${aluno.status}</td>
      <td>${aluno.turma_id ?? "-"}</td>
      <td>
        <button onclick="editarAluno(${aluno.id})">✏️ Editar</button>
        <button onclick="deletarAluno(${aluno.id})">🗑️ Excluir</button>
      </td>
    `;
    alunosTable.appendChild(row);
  });
}

async function carregarTurmas() {
  turmaSelect.innerHTML = `<option value="">Sem turma</option>`;
  let response = await fetch(`${API_URL}/turmas`);
  let turmas = await response.json();

  turmas.forEach(t => {
    let option = document.createElement("option");
    option.value = t.id;
    option.textContent = `${t.nome} (cap: ${t.capacidade})`;
    turmaSelect.appendChild(option);
  });
}

// =========================
// EVENTOS
// =========================
formAluno.addEventListener("submit", async (e) => {
  e.preventDefault();

  const aluno = {
    nome: document.getElementById("nome").value,
    data_nascimento: document.getElementById("data_nascimento").value,
    email: document.getElementById("email").value || null,
    status: document.getElementById("status").value,
    turma_id: turmaSelect.value || null
  };

  let url = `${API_URL}/alunos`;
  let method = "POST";

  if (editandoId) {
    url = `${API_URL}/alunos/${editandoId}`;
    method = "PUT";
  }

  let response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(aluno)
  });

  if (response.ok) {
    alert(editandoId ? "Aluno atualizado!" : "Aluno cadastrado!");
    formAluno.reset();
    editandoId = null;
    carregarAlunos();
  } else {
    alert("Erro ao salvar aluno!");
  }
});

filtroStatus.addEventListener("change", carregarAlunos);
turmaSelect.addEventListener("change", carregarAlunos);

// =========================
// AÇÕES DE EDITAR/EXCLUIR
// =========================
async function editarAluno(id) {
  let response = await fetch(`${API_URL}/alunos`);
  let alunos = await response.json();
  let aluno = alunos.find(a => a.id === id);

  if (!aluno) return alert("Aluno não encontrado!");

  document.getElementById("nome").value = aluno.nome;
  document.getElementById("data_nascimento").value = aluno.data_nascimento;
  document.getElementById("email").value = aluno.email ?? "";
  document.getElementById("status").value = aluno.status;
  turmaSelect.value = aluno.turma_id ?? "";

  editandoId = aluno.id;
  alert("Editando aluno ID " + aluno.id);
}

async function deletarAluno(id) {
  if (!confirm("Deseja realmente excluir este aluno?")) return;

  let response = await fetch(`${API_URL}/alunos/${id}`, { method: "DELETE" });
  if (response.ok) {
    alert("Aluno excluído!");
    carregarAlunos();
  } else {
    alert("Erro ao excluir!");
  }
}

// =========================
// INICIALIZAÇÃO
// =========================
window.onload = async () => {
  await carregarTurmas();
  await carregarAlunos();
};
