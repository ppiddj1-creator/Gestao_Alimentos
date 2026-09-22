(function () {
  const form = document.getElementById("form-login");
  const btn = document.getElementById("btn-entrar");
  const btnTexto = btn.querySelector(".login-botao-texto");
  const alerta = document.getElementById("alerta-login");

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value;

    btn.disabled = true;
    btnTexto.textContent = "Entrando...";
    alerta.classList.add("oculto");

    try {
      const usuarioLogado = await Auth.login(usuario, senha);
      window.location.href = Auth.redirecionarParaPerfil(usuarioLogado);
    } catch (erro) {
      alerta.textContent = erro.message;
      alerta.className = "alerta alerta-erro";
    } finally {
      btn.disabled = false;
      btnTexto.textContent = "Entrar";
    }
  });

  const campoSenha = document.getElementById("senha");
  const btnOlho = document.getElementById("btn-olho");

  btnOlho.addEventListener("click", () => {
    const mostrar = campoSenha.type === "password";
    campoSenha.type = mostrar ? "text" : "password";
    btnOlho.classList.toggle("ativo", mostrar);
    campoSenha.focus();
  });
})();