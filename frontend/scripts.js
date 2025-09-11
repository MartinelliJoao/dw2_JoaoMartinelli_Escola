const API_URL = "http://127.0.0.1:8000";

let turmaMap = {}; // id -> nome

function formatDateISOToBR(iso) {
  if (!iso) return "-";
  // espera yyyy-mm-dd ou yyyy-mm-ddTHH:MM:SS
  const d = iso.split("T")[0];
  const parts = d.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Função chamada pelo botão no HTML
async function adicionarAluno() {
  const nome = document.getElementById("nome").value.trim();
  const data = document.getElementById("data_nascimento").value;
  const email = document.getElementById("email").value.trim();
  const status = document.getElementById("status-aluno").value;
  const turmaVal = document.getElementById("turma-select").value;

  if (!nome || !data) {
    alert("Preencha nome e data de nascimento!");
    return;
  }

  const aluno = {
    nome: nome,
    data_nascimento: data, // yyyy-mm-dd
    email: email || null,
    status: status || "inativo",
    turma_id: turmaVal ? parseInt(turmaVal, 10) : null
  };

  try {
    const response = await fetch(`${API_URL}/alunos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aluno)
    });

    if (!response.ok) {
      let errText = response.statusText;
      try {
        const errJson = await response.json();
        errText = errJson.detail || JSON.stringify(errJson);
      } catch (e) {}
      console.error("Erro ao cadastrar aluno:", errText);
      alert(`Erro ao cadastrar: ${errText}`);
      return;
    }

    const dataResp = await response.json();
    console.log("Aluno cadastrado:", dataResp);
    // limpar campos básicos
    document.getElementById("nome").value = "";
    document.getElementById("data_nascimento").value = "";
    document.getElementById("email").value = "";
    document.getElementById("status-aluno").value = "inativo";
    document.getElementById("turma-select").value = "";

    // atualizar lista imediatamente
    listarAlunos();
  } catch (error) {
    console.error("Erro inesperado:", error);
    alert("Erro de conexão com o servidor.");
  }
}

// Mantém compatibilidade caso existam chamadas para cadastrarAluno
const cadastrarAluno = adicionarAluno;

async function carregarTurmas() {
  try {
    const res = await fetch(`${API_URL}/turmas`);
    if (!res.ok) return;
    const turmas = await res.json();
    const select = document.getElementById("turma-select");
    // remove todas opções, manter a primeira (Sem turma) se houver
    select.innerHTML = "<option value=''>Sem turma</option>";
    turmaMap = {};
    turmas.forEach(t => {
      turmaMap[t.id] = t.nome;
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.nome;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Erro ao carregar turmas', err);
  }
}

async function criarTurma() {
  const nome = document.getElementById('turma-nome').value.trim();
  const capacidade = parseInt(document.getElementById('turma-capacidade').value, 10) || 0;
  if (!nome || capacidade <= 0) {
    alert('Informe nome e capacidade válidos para a turma.');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome, capacidade: capacidade })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Erro ao criar turma: ${err.detail || res.statusText}`);
      return;
    }
    const nova = await res.json();
    // limpa campos e recarrega select
    document.getElementById('turma-nome').value = '';
    document.getElementById('turma-capacidade').value = '';
    await carregarTurmas();
    alert(`Turma ${nova.nome} criada.`);
  } catch (e) {
    console.error('Erro ao criar turma', e);
    alert('Erro de conexão ao criar turma.');
  }
}

async function listarAlunos(statusFilter = '') {
  try {
    let url = `${API_URL}/alunos`;
    if (statusFilter) {
      url += `?status=${encodeURIComponent(statusFilter)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Erro ao buscar alunos', response.statusText);
      return;
    }
    const alunos = await response.json();

    const tbody = document.getElementById('alunos-tabela');
    tbody.innerHTML = '';

    let ativos = 0;
    const porTurma = {};

    alunos.forEach(a => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td'); tdId.textContent = a.id; tr.appendChild(tdId);
      const tdNome = document.createElement('td'); tdNome.textContent = a.nome; tr.appendChild(tdNome);
      const tdData = document.createElement('td'); tdData.textContent = formatDateISOToBR(a.data_nascimento); tr.appendChild(tdData);
      const tdEmail = document.createElement('td'); tdEmail.textContent = a.email || '-'; tr.appendChild(tdEmail);
      const tdStatus = document.createElement('td'); tdStatus.textContent = a.status || '-';
      tdStatus.className = a.status === 'ativo' ? 'status-ativo' : 'status-inativo'; tr.appendChild(tdStatus);
      const tdTurma = document.createElement('td');
      const turmaNome = a.turma_id ? (turmaMap[a.turma_id] || (`ID ${a.turma_id}`)) : '-';
      tdTurma.textContent = turmaNome; tr.appendChild(tdTurma);
      const tdAcoes = document.createElement('td'); tdAcoes.innerHTML = '<button disabled>Editar</button> <button disabled>Excluir</button>'; tr.appendChild(tdAcoes);

      tbody.appendChild(tr);

    if (a.status === 'ativo') ativos += 1;
    const key = turmaNome || 'Sem turma';
    porTurma[key] = (porTurma[key] || 0) + 1;
    // ações: editar / excluir
    tdAcoes.innerHTML = '';
    const btnEdit = document.createElement('button'); btnEdit.className = 'btn btn-sm btn-outline-primary me-1'; btnEdit.textContent = 'Editar';
    btnEdit.onclick = () => abrirEdicao(a);
    const btnDel = document.createElement('button'); btnDel.className = 'btn btn-sm btn-outline-danger'; btnDel.textContent = 'Excluir';
    btnDel.onclick = () => excluirAluno(a.id);
    tdAcoes.appendChild(btnEdit);
    tdAcoes.appendChild(btnDel);
    });

    document.getElementById('contador-total').textContent = alunos.length;
    document.getElementById('contador-ativos').textContent = ativos;
    // montar string resumida para por turma
    const porTurmaParts = Object.keys(porTurma).map(k => `${k}: ${porTurma[k]}`);
    document.getElementById('contador-por-turma').textContent = porTurmaParts.length ? porTurmaParts.join(', ') : '-';

  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
  }
}

// helper: mostrar alert bootstrap
function showAlert(message, type='success', timeout=3000) {
  const id = 'alert-' + Date.now();
  const holder = document.getElementById('alert-placeholder');
  const div = document.createElement('div');
  div.id = id;
  div.className = `alert alert-${type} alert-dismissible fade show`;
  div.role = 'alert';
  div.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
  holder.appendChild(div);
  setTimeout(()=>{try{div.classList.remove('show');div.classList.add('hide');div.remove();}catch(e){}}, timeout);
}

// abrir modal de edição
function abrirEdicao(aluno) {
  // preencher modal
  document.getElementById('edit-id').value = aluno.id;
  document.getElementById('edit-nome').value = aluno.nome;
  document.getElementById('edit-data').value = aluno.data_nascimento ? aluno.data_nascimento.split('T')[0] : '';
  document.getElementById('edit-email').value = aluno.email || '';
  document.getElementById('edit-status').value = aluno.status || 'inativo';
  // popular select de turmas
  const editTurma = document.getElementById('edit-turma');
  editTurma.innerHTML = '<option value="">Sem turma</option>';
  Object.keys(turmaMap).forEach(id=>{
    const opt = document.createElement('option'); opt.value = id; opt.textContent = turmaMap[id]; editTurma.appendChild(opt);
  });
  document.getElementById('edit-turma').value = aluno.turma_id || '';

  // show modal
  const modalEl = document.getElementById('editModal');
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  // attach save handler
  const saveBtn = document.getElementById('save-edit-btn');
  saveBtn.onclick = async () => {
    const id = document.getElementById('edit-id').value;
    const nome = document.getElementById('edit-nome').value.trim();
    const data = document.getElementById('edit-data').value;
    const email = document.getElementById('edit-email').value.trim() || null;
    const status = document.getElementById('edit-status').value;
    const turma_id = document.getElementById('edit-turma').value ? parseInt(document.getElementById('edit-turma').value,10) : null;

    try {
      const res = await fetch(`${API_URL}/alunos/${id}`,{
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({nome:nome, data_nascimento:data, email:email, status:status, turma_id:turma_id})
      });
      if (!res.ok) { const e = await res.json().catch(()=>({})); showAlert(`Erro: ${e.detail||res.statusText}`,'danger'); return; }
      showAlert('Aluno atualizado','success');
      modal.hide();
      listarAlunos();
    } catch(err) { console.error(err); showAlert('Erro de conexão','danger'); }
  };
}

async function excluirAluno(id) {
  if (!confirm('Confirma exclusão do aluno?')) return;
  try {
    const res = await fetch(`${API_URL}/alunos/${id}`,{ method: 'DELETE' });
    if (!res.ok) { const e = await res.json().catch(()=>({})); showAlert(`Erro: ${e.detail||res.statusText}`,'danger'); return; }
    showAlert('Aluno excluído','success');
    listarAlunos();
  } catch(e) { console.error(e); showAlert('Erro de conexão','danger'); }
}

function filtrarAlunos() {
  const status = document.getElementById('status-select').value;
  listarAlunos(status);
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  // expõe funções para o HTML inline (onclick/onchange)
  window.adicionarAluno = adicionarAluno;
  window.filtrarAlunos = filtrarAlunos;

  carregarTurmas();
  listarAlunos();
});
