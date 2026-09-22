(function () {
  const lista = document.getElementById("lista-pessoas-registro");
  if (!lista) return;

  let salvando = false;

  lista.addEventListener("change", async () => {
    if (salvando) return;
    salvando = true;
    try {
      await Registro.salvar();
      Toast.mostrar("Registro salvo automaticamente.", "sucesso");
    } catch (erro) {
      Toast.mostrar("Erro ao salvar: " + erro.message, "erro");
    } finally {
      salvando = false;
    }
  });
})();