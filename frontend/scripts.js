// Modal
const modal = document.getElementById("modalNovoAluno");
const btnAbrir = document.getElementById("abrirModal");
const btnFechar = document.querySelector(".fechar");

btnAbrir.addEventListener("click", () => {
  modal.style.display = "flex";
});

btnFechar.addEventListener("click", () => {
  modal.style.display = "none";
});

// Fechar modal ao clicar fora do conteúdo
window.addEventListener("click", (e) => {
  if(e.target === modal) modal.style.display = "none";
});

// Tecla de atalho Alt+N
document.addEventListener("keydown", (e) => {
  if(e.altKey && e.key.toLowerCase() === "n") {
    modal.style.display = "flex";
  }
});
