(function () {
  const Toast = {
    _icone(tipo) {
      const marcador = tipo === "sucesso" ? "M20 6 9 17l-5-5" : tipo === "erro" ? "M12 8v4M12 16h.01" : "M12 16v-4M12 8h.01";
      const cor = tipo === "sucesso" ? "#FFFFFF" : tipo === "erro" ? "#FFFFFF" : "#4A3400";
      return "<svg class='toast-icone' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='" + cor + "' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='12' cy='12' r='9'/><path d='" + marcador + "'/></svg>";
    },
    mostrar(msg, tipo) {
      let raiz = document.getElementById("toast-root");
      if (!raiz) {
        raiz = document.createElement("div");
        raiz.id = "toast-root";
        raiz.className = "toast-root";
        document.body.appendChild(raiz);
      }
      const el = document.createElement("div");
      el.className = "toast " + (tipo || "info");
      el.innerHTML = this._icone(tipo) + "<span>" + msg + "</span>";
      raiz.appendChild(el);
      setTimeout(() => {
        el.classList.add("saindo");
        setTimeout(() => el.remove(), 300);
      }, 2800);
    }
  };

  window.Toast = Toast;

  function iniciais(nome) {
    const partes = String(nome || "?").trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return "?";
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  const usuario = window.Auth ? Auth.getUsuarioLogado() : null;

  const avatarNav = document.getElementById("avatar-usuario");
  const nomeNav = document.getElementById("usuario-nome");
  if (avatarNav && nomeNav) {
    avatarNav.textContent = iniciais(nomeNav.textContent);
  }

  const saudacao = document.getElementById("saudacao-nome");
  if (saudacao && usuario) {
    saudacao.textContent = usuario.nome;
  }

  const btnMenu = document.getElementById("btn-menu");
  const menu = document.getElementById("navbar-menu");
  if (btnMenu && menu) {
    btnMenu.addEventListener("click", () => {
      const aberto = menu.classList.toggle("aberto");
      btnMenu.setAttribute("aria-expanded", String(aberto));
    });
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => menu.classList.remove("aberto"));
    });
  }

  function atualizarCampos() {
    document.querySelectorAll(".campo-fla select").forEach((sel) => {
      sel.closest(".campo-fla").classList.toggle("preenchido", !!sel.value);
    });
    document.querySelectorAll(".campo-fla input, .campo-fla textarea").forEach((el) => {
      el.closest(".campo-fla").classList.toggle("preenchido", el.value.trim().length > 0);
    });
  }

  const campos = document.querySelectorAll(".campo-fla input, .campo-fla select, .campo-fla textarea");
  campos.forEach((el) => {
    const campo = el.closest(".campo-fla");
    if (!campo) return;

    const atualizar = () => {
      campo.classList.toggle("preenchido", el.value.trim().length > 0);
      campo.classList.remove("invalido", "valido");
    };

    el.addEventListener("input", atualizar);
    el.addEventListener("change", () => {
      campo.classList.toggle("preenchido", !!el.value);
      campo.classList.remove("invalido");
    });
    el.addEventListener("blur", () => {
      if (el.required && !el.value.trim()) {
        campo.classList.add("invalido");
        campo.classList.remove("valido");
      } else if (el.value.trim()) {
        campo.classList.add("valido");
        campo.classList.remove("invalido");
      }
    });
  });

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", () => {
      form.querySelectorAll(".campo-fla").forEach((campo) => {
        const el = campo.querySelector("input, select, textarea");
        if (el && el.required && !el.value.trim()) {
          campo.classList.add("invalido");
          campo.classList.remove("valido");
        }
      });
    });
    form.addEventListener("reset", atualizarCampos);
  });

  atualizarCampos();
  setTimeout(atualizarCampos, 700);
  setInterval(atualizarCampos, 1500);

  function aplicarAvatares(container) {
    if (!container) return;
    const ehUsuario = container.id === "tabela-usuarios";
    let alterado = false;

    container.querySelectorAll("table.tabela").forEach((tabela) => {
      if (tabela.hasAttribute("data-avatarizado")) return;
      tabela.setAttribute("data-avatarizado", "1");
      alterado = true;

      if (container.id === "lista-pessoas-registro") {
        tabela.classList.add("registro-tabela");
      }

      tabela.querySelectorAll("tbody tr").forEach((linha) => {
        const primeira = linha.querySelector("td");
        if (primeira) {
          const av = document.createElement("span");
          av.className = "avatar-tabela";
          av.textContent = iniciais(primeira.textContent);
          primeira.prepend(av);
        }
        if (ehUsuario && !linha.hasAttribute("data-status")) {
          linha.setAttribute("data-status", "1");
          const perfil = linha.children[2];
          if (perfil) {
            perfil.insertAdjacentHTML("afterend", "<td><span class='badge badge-ativo'>Ativo</span></td>");
          }
        }
      });
    });

    if (alterado && ehUsuario) {
      container.querySelectorAll("table.tabela tbody tr").forEach((linha) => {
        const primeira = linha.querySelector("td");
        if (primeira && !primeira.querySelector(".avatar-tabela")) {
          const av = document.createElement("span");
          av.className = "avatar-tabela";
          av.textContent = iniciais(primeira.textContent);
          primeira.prepend(av);
        }
      });
    }
  }

  ["tabela-pessoas", "lista-pessoas-registro", "tabela-usuarios"].forEach((id) => {
    const alvo = document.getElementById(id);
    if (!alvo) return;
    aplicarAvatares(alvo);
    const observer = new MutationObserver(() => aplicarAvatares(alvo));
    observer.observe(alvo, { childList: true, subtree: true });
  });
})();