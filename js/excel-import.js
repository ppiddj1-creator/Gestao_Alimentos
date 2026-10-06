// excel-import.js — Importação em lote de pessoas via planilha (Excel/CSV)
// Requer: SheetJS (XLSX) via CDN, Database (database-supabase.js) e Cadastro (cadastro.js)

const ImportadorExcel = {
  linhas: [],
  arquivoNome: "",

  analisarDoInput() {
    const input = document.getElementById("arquivo-excel");
    const arquivo = input && input.files ? input.files[0] : null;
    if (!arquivo) {
      this._alerta("Selecione um arquivo .xlsx, .xls ou .csv.", "erro");
      return;
    }
    this.analisarArquivo(arquivo);
  },

  async analisarArquivo(arquivo) {
    const buffer = await arquivo.arrayBuffer();
    this.processarBuffer(buffer, arquivo.name);
  },

  processarBuffer(buffer, nomeArquivo) {
    this.arquivoNome = nomeArquivo || "";
    const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const wb = XLSX.read(uint8, { type: "array", cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const dados = XLSX.utils.sheet_to_json(ws, { defval: "" });

    this.linhas = dados.map((linha, i) => this.validarLinha(linha, i + 2));
    this.renderizarPreview();

    if (this.linhas.length === 0) {
      this._alerta("A planilha não tem linhas de dados.", "erro");
    }
    return this.linhas;
  },

  // Chave de coluna sem acento/maiúsculas (aceita "Data de Nascimento", "dataNascimento"...)
  _normalizar(texto) {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  },

  _pegar(row, ...chaves) {
    const alvo = chaves.map((c) => this._normalizar(c));
    for (const k of Object.keys(row)) {
      if (alvo.includes(this._normalizar(k))) return row[k];
    }
    return "";
  },

  validarLinha(row, numLinha) {
    const nome = String(this._pegar(row, "nome", "nome completo") || "").trim();
    const categoria = this._normalizar(this._pegar(row, "categoria"));
    const turmaSetor = String(this._pegar(row, "turmasetor", "turma", "setor") || "").trim();
    const matricula = String(this._pegar(row, "matricula") || "").trim();
    const dataNascimento = this.converterData(
      this._pegar(row, "datanascimento", "nascimento", "datadenascimento")
    );

    const resultado = {
      linha: numLinha,
      nome,
      categoria,
      turmaSetor,
      matricula,
      login: Cadastro._gerarLogin(nome),
      dataNascimento,
      senha: dataNascimento ? Cadastro._nascimentoParaSenha(dataNascimento) : "",
      ok: true,
      erro: "",
      importada: false
    };

    if (!nome) {
      resultado.ok = false;
      resultado.erro = "Falta o nome";
      return resultado;
    }
    if (!["aluno", "professor", "funcionario"].includes(categoria)) {
      resultado.ok = false;
      resultado.erro = 'Categoria inválida: "' + (categoria || "(vazio)") + '" — use aluno, professor ou funcionario';
      return resultado;
    }
    if (!dataNascimento) {
      resultado.ok = false;
      resultado.erro = "Data de nascimento vazia ou inválida (use dd/mm/aaaa)";
      return resultado;
    }
    if (dataNascimento > new Date().toISOString().split("T")[0]) {
      resultado.ok = false;
      resultado.erro = "Data de nascimento no futuro";
      return resultado;
    }
    return resultado;
  },

  // Aceita Date do Excel, serial numérico ou texto "dd/mm/aaaa" | "aaaa-mm-dd" -> "aaaa-mm-dd"
  converterData(valor) {
    if (valor === "" || valor === null || valor === undefined) return "";

    let ano, mes, dia;
    if (valor instanceof Date && !isNaN(valor)) {
      ano = valor.getFullYear();
      mes = valor.getMonth() + 1;
      dia = valor.getDate();
    } else if (typeof valor === "number" && isFinite(valor)) {
      const d = new Date(Date.UTC(1899, 11, 30) + Math.round(valor) * 86400000);
      ano = d.getUTCFullYear();
      mes = d.getUTCMonth() + 1;
      dia = d.getUTCDate();
    } else {
      const s = String(valor).trim();
      let m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
      if (m) {
        ano = Number(m[3]);
        mes = Number(m[2]);
        dia = Number(m[1]);
      } else {
        m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (m) {
          ano = Number(m[1]);
          mes = Number(m[2]);
          dia = Number(m[3]);
        } else {
          return "";
        }
      }
    }

    // Valida data real (rejeita 31/02 etc.)
    const d = new Date(ano, mes - 1, dia);
    if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return "";

    const mm = String(mes).padStart(2, "0");
    const dd = String(dia).padStart(2, "0");
    return ano + "-" + mm + "-" + dd;
  },

  renderizarPreview() {
    const container = document.getElementById("preview-excel");
    const acao = document.getElementById("acao-importar");
    const btn = document.getElementById("btn-importar-excel");
    if (!container) return;

    if (this.linhas.length === 0) {
      container.innerHTML = "";
      if (acao) acao.style.display = "none";
      return;
    }

    const validas = this.linhas.filter((l) => l.ok).length;
    const erros = this.linhas.length - validas;

    let html = '<p style="font-size:13px; color:#6b8299; margin-bottom:10px;">';
    html += "Arquivo: <strong>" + this._escapar(this.arquivoNome) + "</strong> · ";
    html += this.linhas.length + " linha(s) · <strong style='color:#0f7a35;'>" + validas + " válida(s)</strong>";
    if (erros > 0) html += " · <strong style='color:#c0392b;'>" + erros + " com erro</strong>";
    html += "</p>";

    html += '<table class="tabela"><thead><tr>';
    html += "<th>Linha</th><th>Nome</th><th>Login</th><th>Categoria</th><th>Nascimento</th><th>Turma/Setor</th><th>Matrícula</th><th>Status</th>";
    html += "</tr></thead><tbody>";

    this.linhas.forEach((l) => {
      html += "<tr>";
      html += "<td>" + l.linha + "</td>";
      html += "<td>" + this._escapar(l.nome) + "</td>";
      html += "<td>" + this._escapar(l.login || "-") + "</td>";
      html += "<td>" + this._escapar(l.categoria) + "</td>";
      html += "<td>" + this._escapar(l.dataNascimento) + "</td>";
      html += "<td>" + this._escapar(l.turmaSetor || "-") + "</td>";
      html += "<td>" + this._escapar(l.matricula || "(gerar)") + "</td>";
      if (l.importada) {
        html += "<td style='color:#0f7a35; font-weight:600;'>Importada ✓</td>";
      } else if (l.ok) {
        html += "<td style='color:#0f7a35;'>Pronta</td>";
      } else {
        html += "<td style='color:#c0392b;'>" + this._escapar(l.erro) + "</td>";
      }
      html += "</tr>";
    });
    html += "</tbody></table>";

    container.innerHTML = html;

    if (acao) {
      const pendentes = this.linhas.filter((l) => l.ok).length;
      acao.style.display = pendentes > 0 ? "flex" : "none";
      if (btn) btn.textContent = "Importar " + pendentes + " pessoa(s)";
    }
  },

  async confirmarImportacao() {
    const validas = this.linhas.filter((l) => l.ok);
    if (validas.length === 0) {
      this._alerta("Nenhuma linha válida para importar.", "erro");
      return;
    }

    const usadas = new Set();
    let seq = parseInt(await Cadastro._gerarMatricula(), 10);
    const hoje = new Date().toISOString().split("T")[0];
    let importadas = 0;
    let falhas = 0;

    for (const l of validas) {
      try {
        let matricula = l.matricula;
        if (!matricula) {
          while (usadas.has(String(seq))) seq++;
          matricula = String(seq);
          seq++;
        }
        if (usadas.has(matricula)) {
          throw new Error("Matrícula repetida na planilha: " + matricula);
        }
        const dup = await Database.buscarPorCampo("pessoas", "matricula", matricula);
        if (dup.length > 0) {
          throw new Error("Matrícula já existe no sistema: " + matricula);
        }
        usadas.add(matricula);

        const login = await Cadastro._loginUnico(l.login || Cadastro._gerarLogin(l.nome));

        await Database.adicionar("pessoas", {
          nome: l.nome,
          categoria: l.categoria,
          turmaSetor: l.turmaSetor,
          matricula,
          login,
          dataNascimento: l.dataNascimento,
          senha: l.senha,
          criadoEm: hoje
        });
        l.matricula = matricula;
        l.login = login;
        l.importada = true;
        importadas++;
      } catch (erro) {
        l.ok = false;
        l.erro = erro.message;
        falhas++;
      }
    }

    this.renderizarPreview();

    if (falhas === 0) {
      this._alerta("Importação concluída: " + importadas + " pessoa(s) cadastrada(s)!", "sucesso", 10000);
    } else {
      this._alerta("Importadas: " + importadas + " · Falhas: " + falhas + " (veja a tabela).", "erro", 10000);
    }

    if (importadas > 0) {
      await Cadastro.carregar();
    }
  },

  limpar() {
    this.linhas = [];
    this.arquivoNome = "";
    const input = document.getElementById("arquivo-excel");
    if (input) input.value = "";
    const container = document.getElementById("preview-excel");
    if (container) container.innerHTML = "";
    const acao = document.getElementById("acao-importar");
    if (acao) acao.style.display = "none";
    this._alerta("Análise limpa.", "sucesso");
  },

  baixarModelo() {
    const ws = XLSX.utils.aoa_to_sheet([
      ["nome", "categoria", "dataNascimento", "turmaSetor"],
      ["Maria Silva", "aluno", "15/03/2010", "3º Ano A"],
      ["Carlos Souza", "professor", "10/07/1985", "Matemática"]
    ]);
    ws["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 16 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pessoas");
    XLSX.writeFile(wb, "modelo-cadastro.xlsx");
  },

  _escapar(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  },

  _alerta(msg, tipo, duracao = 6000) {
    const alerta = document.getElementById("alerta-importacao");
    if (!alerta) return;
    alerta.textContent = msg;
    alerta.className = "alerta alerta-" + tipo;
    setTimeout(() => alerta.classList.add("oculto"), duracao);
  }
};
