const API_URL = "http://127.0.0.1:8000";

// ---------- ESTADO GLOBAL ----------
let alunosCache = [];
let turmasCache = [];

// ---------- UTILIDADES ----------
function showAlert(message, type = "info") {
  // type: info, success, error
  const alerta = document.createElement("div");
  alerta.textContent = message;
  alerta.className = `alert ${type}`;
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 3000);
}

function criarLinhaAluno(aluno) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${aluno.id}</td>
    <td>${aluno.nome}</td>
    <td>${aluno.data_nascimento}</td>
    <td>${aluno.email || "-"}</td>
    <td>${aluno.status}</td>
    <td>${aluno.turma_id || "-"}</td>
    <td>
      <button class="btn-edit" onclick="editarAluno(${aluno.id})">✏️</button>
      <button class="btn-delete" onclick="deletarAluno(${aluno.id})">🗑️</button>
    </td>
  `;
  return row;
}

// ---------- CARREGAR ALUNOS ----------
async function carregarAlunos() {
  try {
    const res = await fetch(`${API_URL}/alunos`);
    alunosCache = await res.json();
    mostrarAlunos(alunosCache);
  } catch (err) {
    showAlert("Erro ao carregar alunos", "error");
    console.error(err);
  }
}

function mostrarAlunos(alunos) {
  const tabela = document.getElementById("alunos-tabela");
  tabela.innerHTML = "";
  alunos.forEach(aluno => tabela.appendChild(criarLinhaAluno(aluno)));
  atualizarContadores(alunos);
}

// ---------- CARREGAR TURMAS ----------
async function carregarTurmas() {
  try {
    const res = await fetch(`${API_URL}/turmas`);
    turmasCache = await res.json();

    const select = document.getElementById("turma-select");
    select.innerHTML = "<option value=''>-- Todas --</option>";
    turmasCache.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.nome} (cap: ${t.capacidade})`;
      select.appendChild(opt);
    });
  } catch (err) {
    showAlert("Erro ao carregar turmas", "error");
    console.error(err);
  }
}

// ---------- ADICIONAR ALUNO ----------
async function adicionarAluno() {
  const nome = document.getElementById("nome").value.trim();
  const data_nascimento = document.getElementById("data_nascimento").value;
  const email = document.getElementById("email").value.trim();

  if (!nome || !data_nascimento) {
    showAlert("Nome e data de nascimento são obrigatórios!", "error");
    return;
  }

  const aluno = { nome, data_nascimento, email, status: "inativo" };

  try {
    const res = await fetch(`${API_URL}/alunos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aluno),
    });

    if (res.ok) {
      showAlert("Aluno cadastrado!", "success");
      carregarAlunos();
      document.getElementById("nome").value = "";
      document.getElementById("data_nascimento").value = "";
      document.getElementById("email").value = "";
    } else {
      showAlert("Erro ao cadastrar aluno", "error");
    }
  } catch (err) {
    showAlert("Erro ao cadastrar aluno", "error");
    console.error(err);
  }
}

// ---------- DELETAR ALUNO ----------
async function deletarAluno(id) {
  if (!confirm("Tem certeza que deseja excluir este aluno?")) return;
  try {
    const res = await fetch(`${API_URL}/alunos/${id}`, { method: "DELETE" });
    if (res.ok) {
      showAlert("Aluno excluído!", "success");
      carregarAlunos();
    } else {
      showAlert("Erro ao excluir aluno", "error");
    }
  } catch (err) {
    showAlert("Erro ao excluir aluno", "error");
    console.error(err);
  }
}

// ---------- EDITAR ALUNO ----------
async function editarAluno(id) {
  const aluno = alunosCache.find(a => a.id === id);
  if (!aluno) return;

  const novoNome = prompt("Editar nome:", aluno.nome);
  if (!novoNome) return;

  try {
    const res = await fetch(`${API_URL}/alunos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...aluno, nome: novoNome }),
    });

    if (res.ok) {
      showAlert("Aluno atualizado!", "success");
      carregarAlunos();
    } else {
      showAlert("Erro ao atualizar aluno", "error");
    }
  } catch (err) {
    showAlert("Erro ao atualizar aluno", "error");
    console.error(err);
  }
}

// ---------- FILTRO ----------
function filtrarAlunos() {
  const turmaId = document.getElementById("turma-select").value;
  const status = document.getElementById("status-select").value;

  let filtrados = [...alunosCache];
  if (turmaId) filtrados = filtrados.filter(a => String(a.turma_id) === turmaId);
  if (status) filtrados = filtrados.filter(a => a.status === status);

  mostrarAlunos(filtrados);
}

// ---------- EXPORTAR ----------
function exportarCSV() {
  const linhas = ["ID,Nome,Data Nasc.,Email,Status,Turma"];
  alunosCache.forEach(a => {
    linhas.push([a.id, a.nome, a.data_nascimento, a.email || "-", a.status, a.turma_id || "-"].join(","));
  });

  const blob = new Blob([linhas.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "alunos.csv";
  link.click();
}

function exportarJSON() {
  const blob = new Blob([JSON.stringify(alunosCache, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "alunos.json";
  link.click();
}

// ---------- CONTADORES ----------
function atualizarContadores(alunos) {
  const total = alunos.length;
  const ativos = alunos.filter(a => a.status === "ativo").length;

  const porTurma = turmasCache.map(t => {
    const count = alunos.filter(a => String(a.turma_id) === String(t.id)).length;
    return `${t.nome}: ${count}`;
  }).join(" | ");

  document.getElementById("contador-total").textContent = total;
  document.getElementById("contador-ativos").textContent = ativos;
  document.getElementById("contador-por-turma").textContent = porTurma;
}

// ---------- INICIAR ----------
window.onload = () => {
  carregarAlunos();
  carregarTurmas();
};
