(function () {
  const lista = document.getElementById("lista-pessoas-registro");
  if (!lista || typeof Registro === "undefined" || typeof Toast === "undefined") return;

  let salvando = false;
  let pendente = false;
  let timer = null;

  async function salvarAgora() {
    if (salvando) {
      pendente = true;
      return;
    }
    salvando = true;
    try {
      await Registro.salvar();
      Toast.mostrar("Registro salvo automaticamente.", "sucesso");
    } catch (erro) {
      Toast.mostrar("Erro ao salvar: " + erro.message, "erro");
    } finally {
      salvando = false;
      if (pendente) {
        pendente = false;
        salvarAgora();
      }
    }
  }

  // Debounce: agrupa alterações rápidas em uma única chamada de salvamento
  lista.addEventListener("change", () => {
    clearTimeout(timer);
    timer = setTimeout(salvarAgora, 400);
  });
})();
