
const $ = s => document.querySelector(s);

const corpo = document.body;
const campoTitulo = $("#titulo");
const campoData = $("#data");
const campoElemento = $("#elemento");
const campoTexto = $("#texto");
const campoImagem = $("#imagem");
const areaImagem = $("#areaImagem");
const adesivosFolha = $("#adesivosFolha");
const folha = $("#folha");
const painel = $("#painelMagico");
const aviso = $("#avisoSalvamento");

const CHAVE = "diarioElementalMemoriasV1";
const TEMA = "diarioElementalTema";

const elementos = {
  agua: { nome:"Água", icone:"💧", simbolo:"◉", cor:"#418fc4", adesivos:["💧","🌊","🐚","🫧","🌙"] },
  fogo: { nome:"Fogo", icone:"🔥", simbolo:"♨", cor:"#c85e52", adesivos:["🔥","🕯️","☀️","❤️","✨"] },
  ar: { nome:"Ar", icone:"🍃", simbolo:"❧", cor:"#788e56", adesivos:["🍃","🦋","🌬️","☁️","🌼"] },
  terra: { nome:"Terra", icone:"🌿", simbolo:"❦", cor:"#7e8b4e", adesivos:["🌿","🍄","🌱","🌻","🌷"] },
  trovao: { nome:"Trovão", icone:"⚡", simbolo:"ϟ", cor:"#7771ce", adesivos:["⚡","🌩️","🌌","💜","⭐"] }
};

let memorias = carregar();
let filtro = "todas";
let editando = null;
let imagem = "";
let historico = [];
let posHistorico = -1;

function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function gravar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(memorias));
    return true;
  } catch {
    mostrarAviso("Armazenamento cheio. Tente remover alguma imagem.");
    return false;
  }
}

function dataHoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function mostrarAviso(texto) {
  aviso.textContent = texto;
}

function elemento() {
  return elementos[campoElemento.value] || elementos.agua;
}

function trocarTema() {
  const chave = campoElemento.value;
  const e = elemento();

  corpo.dataset.elemento = chave;
  $("#iconeElemento").textContent = e.icone;
  $("#iconeTrocar").textContent = e.icone;
  $("#simboloMarca").textContent = e.simbolo;
  $("#seloElemento").textContent = `✧ ${e.nome.toUpperCase()} ✧`;

  localStorage.setItem(TEMA, chave);
}

function criarVagalumes() {
  const ceu = $("#ceuMagico");
  ceu.replaceChildren();

  for (let i = 0; i < 22; i++) {
    const luz = document.createElement("span");
    luz.className = "vagalume";
    luz.style.left = Math.random() * 100 + "%";
    luz.style.top = Math.random() * 100 + "%";
    luz.style.setProperty("--duracao", 6 + Math.random()*8 + "s");
    luz.style.setProperty("--atraso", -Math.random()*8 + "s");
    luz.style.setProperty("--movimento", Math.random()*40-20 + "px");
    ceu.appendChild(luz);
  }
}

function atualizarContador() {
  $("#contador").textContent = campoTexto.innerText.length;
}

function registrarHistorico() {
  const texto = campoTexto.innerHTML;
  if (historico[posHistorico] === texto) return;
  historico = historico.slice(0, posHistorico + 1);
  historico.push(texto);
  if (historico.length > 30) historico.shift();
  posHistorico = historico.length - 1;
}

function restaurarHistorico(pos) {
  if (pos < 0 || pos >= historico.length) return;
  posHistorico = pos;
  campoTexto.innerHTML = historico[pos];
  atualizarContador();
  atualizarBotoesHistorico();
}

function atualizarBotoesHistorico() {
  $('[data-action="desfazer"]').disabled = posHistorico <= 0;
  $('[data-action="refazer"]').disabled = posHistorico >= historico.length - 1;
}

function renderizarImagem() {
  areaImagem.replaceChildren();
  if (!imagem) return;

  const caixa = document.createElement("div");
  caixa.className = "imagem-memoria";

  const img = document.createElement("img");
  img.src = imagem;
  img.alt = "Imagem da memória";

  const remover = document.createElement("button");
  remover.className = "remover-imagem";
  remover.type = "button";
  remover.textContent = "×";
  remover.setAttribute("aria-label", "Remover imagem");
  remover.onclick = () => {
    imagem = "";
    renderizarImagem();
  };

  caixa.append(img, remover);
  areaImagem.append(caixa);
}

campoImagem.onchange = () => {
  const arquivo = campoImagem.files[0];
  if (!arquivo) return;

  if (!arquivo.type.startsWith("image/") || arquivo.size > 12*1024*1024) {
    mostrarAviso("Escolha uma imagem válida de até 12 MB.");
    campoImagem.value = "";
    return;
  }

  const leitor = new FileReader();
  leitor.onload = () => {
    const img = new Image();

    img.onload = () => {
      const escala = Math.min(1, 1000 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      imagem = canvas.toDataURL("image/jpeg", 0.75);
      renderizarImagem();
      mostrarAviso("Imagem adicionada!");
    };

    img.onerror = () => mostrarAviso("Não foi possível abrir essa imagem.");
    img.src = leitor.result;
  };

  leitor.onerror = () => mostrarAviso("Erro ao ler a imagem.");
  leitor.readAsDataURL(arquivo);
  campoImagem.value = "";
};

function adicionarAdesivo(emoji) {
  const item = document.createElement("span");
  item.className = "adesivo";
  item.textContent = emoji;
  adesivosFolha.append(item);
}

function abrirPainel(titulo, opcoes, acao) {
  painel.replaceChildren();
  painel.hidden = false;

  const h = document.createElement("h3");
  h.textContent = titulo;

  const grupo = document.createElement("div");
  grupo.className = "opcoes-painel";

  opcoes.forEach(op => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opcao-magica";
    b.textContent = op.nome;
    b.onclick = () => acao(op.valor);
    grupo.append(b);
  });

  const fechar = document.createElement("button");
  fechar.type = "button";
  fechar.className = "opcao-magica";
  fechar.textContent = "Fechar";
  fechar.onclick = fecharPainel;

  painel.append(h, grupo, fechar);
}

function fecharPainel() {
  painel.hidden = true;
  painel.replaceChildren();
}

function mostrarFundos() {
  abrirPainel("Escolha o papel", [
    {nome:"Pontilhado",valor:"pontilhado"},
    {nome:"Papel liso",valor:"fundo-liso"},
    {nome:"Céu estrelado",valor:"fundo-noite"},
    {nome:"Pó de fadas",valor:"fundo-flores"}
  ], valor => {
    folha.classList.remove("fundo-liso","fundo-noite","fundo-flores");
    if (valor !== "pontilhado") folha.classList.add(valor);
    fecharPainel();
  });
}

function mostrarAdesivos() {
  const opcoes = elemento().adesivos.map(e => ({nome:e,valor:e}));
  opcoes.push({nome:"✧",valor:"✧"},{nome:"♡",valor:"♡"});

  abrirPainel("Adesivos mágicos", opcoes, valor => {
    adicionarAdesivo(valor);
    fecharPainel();
  });
}

function limparFormulario() {
  editando = null;
  campoTitulo.value = "";
  campoData.value = dataHoje();
  campoTexto.innerHTML = "";
  $("#favorita").checked = false;
  imagem = "";
  areaImagem.replaceChildren();
  adesivosFolha.replaceChildren();
  folha.classList.remove("fundo-liso","fundo-noite","fundo-flores");

  campoElemento.value = localStorage.getItem(TEMA) || "agua";
  if (!elementos[campoElemento.value]) campoElemento.value = "agua";

  $("#botaoSalvar").innerHTML = "<span>♡</span> Salvar memória";
  historico = [];
  posHistorico = -1;
  registrarHistorico();
  trocarTema();
  atualizarContador();
}

function salvarMemoria() {
  const texto = campoTexto.innerText.trim();
  const adesivos = [...adesivosFolha.children].map(a => a.textContent);

  if (!texto && !imagem && !adesivos.length) {
    mostrarAviso("Escreva algo ou adicione uma imagem antes de salvar.");
    return;
  }

  const memoria = {
    id: editando || String(Date.now()),
    titulo: campoTitulo.value.trim() || "Memória sem título",
    data: campoData.value || dataHoje(),
    elemento: campoElemento.value,
    texto,
    htmlTexto: campoTexto.innerHTML,
    imagem,
    adesivos,
    favorita: $("#favorita").checked
  };

  const indice = memorias.findIndex(m => m.id === memoria.id);
  if (indice >= 0) memorias[indice] = memoria;
  else memorias.unshift(memoria);

  if (!gravar()) return;

  renderizarMemorias();
  limparFormulario();
  mostrarAviso("✧ Memória salva com sucesso!");
}

function editarMemoria(id) {
  const m = memorias.find(item => item.id === id);
  if (!m) return;

  editando = m.id;
  campoTitulo.value = m.titulo;
  campoData.value = m.data || dataHoje();
  campoElemento.value = elementos[m.elemento] ? m.elemento : "agua";
  campoTexto.innerHTML = m.htmlTexto || m.texto || "";
  $("#favorita").checked = Boolean(m.favorita);
  imagem = m.imagem || "";

  renderizarImagem();
  adesivosFolha.replaceChildren();
  (m.adesivos || []).forEach(adicionarAdesivo);

  trocarTema();
  atualizarContador();
  historico = [];
  posHistorico = -1;
  registrarHistorico();

  $("#botaoSalvar").innerHTML = "<span>✧</span> Atualizar memória";
  window.scrollTo({top:0, behavior:"smooth"});
}

function excluirMemoria(id) {
  if (!confirm("Deseja excluir esta memória?")) return;
  memorias = memorias.filter(m => m.id !== id);
  if (editando === id) limparFormulario();
  if (gravar()) renderizarMemorias();
}

function favoritarMemoria(id) {
  const m = memorias.find(item => item.id === id);
  if (!m) return;
  m.favorita = !m.favorita;
  if (gravar()) renderizarMemorias();
}

function renderizarMemorias() {
  const lista = $("#listaMemorias");
  lista.replaceChildren();

  const filtradas = memorias.filter(m =>
    filtro === "todas" ||
    (filtro === "favoritas" && m.favorita) ||
    m.elemento === filtro
  );

  $("#totalMemorias").textContent =
    `${memorias.length} ${memorias.length === 1 ? "memória" : "memórias"}`;
  $("#mensagemVazia").hidden = filtradas.length > 0;

  filtradas.forEach(m => {
    const e = elementos[m.elemento] || elementos.agua;
    const cartao = document.createElement("article");
    cartao.className = "cartao-memoria";

    const topo = document.createElement("div");
    topo.className = "cartao-topo";

    const icone = document.createElement("span");
    icone.className = "cartao-icone";
    icone.textContent = e.icone;

    const titulo = document.createElement("strong");
    titulo.className = "cartao-titulo";
    titulo.textContent = m.titulo;

    const estrela = document.createElement("span");
    estrela.textContent = m.favorita ? "★" : "";
    estrela.style.color = "var(--cor)";
    topo.append(icone, titulo, estrela);

    const data = document.createElement("div");
    data.className = "cartao-data";
    data.textContent = `${e.nome} · ${m.data ? m.data.split("-").reverse().join("/") : "Sem data"}`;
    cartao.append(topo, data);

    if (m.texto) {
      const texto = document.createElement("p");
      texto.className = "cartao-texto";
      texto.textContent = m.texto;
      cartao.append(texto);
    }

    if (m.imagem) {
      const img = document.createElement("img");
      img.className = "cartao-imagem";
      img.src = m.imagem;
      img.alt = "Imagem da memória";
      cartao.append(img);
    }

    if (m.adesivos?.length) {
      const adesivos = document.createElement("p");
      adesivos.textContent = m.adesivos.join(" ");
      adesivos.style.fontSize = "21px";
      cartao.append(adesivos);
    }

    const acoes = document.createElement("div");
    acoes.className = "cartao-acoes";

    [
      ["✎ Editar", () => editarMemoria(m.id)],
      [m.favorita ? "★ Desfavoritar" : "☆ Favoritar", () => favoritarMemoria(m.id)],
      ["× Excluir", () => excluirMemoria(m.id)]
    ].forEach(([texto, acao]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = texto;
      b.onclick = acao;
      acoes.append(b);
    });

    cartao.append(acoes);
    lista.append(cartao);
  });
}

/* BOTÕES E FERRAMENTAS */

document.querySelectorAll("[data-action]").forEach(botao => {
  botao.onclick = () => {
    switch (botao.dataset.action) {
      case "desfazer":
        if (posHistorico > 0) {
          restaurarHistorico(posHistorico - 1);
        }
        break;

      case "refazer":
        if (posHistorico < historico.length - 1) {
          restaurarHistorico(posHistorico + 1);
        }
        break;

      case "imagem":
        campoImagem.click();
        break;

      case "favorito":
        $("#favorita").checked = !$("#favorita").checked;
        break;

      case "fundos":
        mostrarFundos();
        break;

      case "adesivos":
      case "emoji":
        mostrarAdesivos();
        break;

      case "texto":
        abrirPainel("Tamanho do texto", [
          {nome:"Pequeno",valor:"13px"},
          {nome:"Normal",valor:"15px"},
          {nome:"Grande",valor:"19px"},
          {nome:"Título",valor:"24px"}
        ], valor => {
          campoTexto.style.fontSize = valor;
          fecharPainel();
        });
        break;

      case "cor":
        abrirPainel("Cor da escrita", [
          {nome:"Cor do elemento",valor:elemento().cor},
          {nome:"Dourado",valor:"#c49a45"},
          {nome:"Rosa",valor:"#d78bb5"},
          {nome:"Azul",valor:"#4e93d2"},
          {nome:"Verde",valor:"#608b59"},
          {nome:"Violeta",valor:"#8a72cc"}
        ], valor => {
          campoTexto.style.color = valor;
          fecharPainel();
        });
        break;

      case "borracha":
        abrirPainel("Borracha mágica", [
          {nome:"Apagar texto",valor:"texto"},
          {nome:"Apagar imagem",valor:"imagem"},
          {nome:"Apagar adesivos",valor:"adesivos"},
          {nome:"Limpar tudo",valor:"tudo"}
        ], valor => {
          if (valor === "texto" || valor === "tudo") campoTexto.innerHTML = "";
          if (valor === "imagem" || valor === "tudo") {
            imagem = "";
            areaImagem.replaceChildren();
          }
          if (valor === "adesivos" || valor === "tudo") adesivosFolha.replaceChildren();
          atualizarContador();
          registrarHistorico();
          fecharPainel();
        });
        break;

      case "desenhar":
        mostrarAviso("Para desenhar, use os adesivos mágicos nesta versão.");
        mostrarAdesivos();
        break;
    }
  };
});

$("#botaoSalvar").onclick = salvarMemoria;
$("#cancelarEdicao").onclick = () => {
  if (confirm("Deseja limpar a página atual?")) limparFormulario();
};

campoElemento.onchange = trocarTema;
campoTexto.addEventListener("input", () => {
  atualizarContador();
  registrarHistorico();
  atualizarBotoesHistorico();
});

campoTexto.addEventListener("keydown", evento => {
  if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "z") {
    evento.preventDefault();
    restaurarHistorico(posHistorico + (evento.shiftKey ? 1 : -1));
  }
});

$("#trocarElemento").onclick = () => {
  const modal = $("#modalElemento");
  if (modal.showModal) modal.showModal();
  else {
    const escolha = prompt("Digite: agua, fogo, ar, terra ou trovao");
    if (elementos[escolha]) {
      campoElemento.value = escolha;
      trocarTema();
    }
  }
};

$("#fecharModal").onclick = () => $("#modalElemento").close();

document.querySelectorAll("[data-escolher]").forEach(botao => {
  botao.onclick = () => {
    campoElemento.value = botao.dataset.escolher;
    trocarTema();
    $("#modalElemento").close();
  };
});

document.querySelectorAll("[data-filtro]").forEach(botao => {
  botao.onclick = () => {
    filtro = botao.dataset.filtro;
    document.querySelectorAll("[data-filtro]").forEach(b =>
      b.classList.toggle("ativo", b === botao)
    );
    renderizarMemorias();
  };
});

/* INICIAR */

campoData.value = dataHoje();
campoElemento.value = elementos[localStorage.getItem(TEMA)]
  ? localStorage.getItem(TEMA)
  : "agua";

criarVagalumes();
trocarTema();
atualizarContador();
registrarHistorico();
atualizarBotoesHistorico();
renderizarMemorias();
