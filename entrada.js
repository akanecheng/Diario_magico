const stars = document.getElementById("stars");
const dialog = document.getElementById("elementDialog");
const openButton = document.getElementById("openDiary");
const note = document.getElementById("dialogNote");
const THEME_KEY = "diarioElementalTema";
const names = {agua:"Água",fogo:"Fogo",ar:"Ar",terra:"Terra",trovao:"Trovão"};

function createStars(){
  const count = matchMedia("(max-width:560px)").matches ? 55 : 105;
  const fragment = document.createDocumentFragment();
  for(let i=0;i<count;i++){
    const star=document.createElement("span");
    star.className="star";
    star.style.left=`${Math.random()*100}%`;
    star.style.top=`${Math.random()*100}%`;
    star.style.setProperty("--duration",`${2.4+Math.random()*4.5}s`);
    star.style.setProperty("--delay",`${Math.random()*-5}s`);
    if(Math.random()>.88) star.style.width=star.style.height="3px";
    fragment.appendChild(star);
  }
  stars.replaceChildren(fragment);
}
createStars();

openButton.addEventListener("click",()=>{
  const saved=localStorage.getItem(THEME_KEY);
  note.textContent=saved && names[saved] ? `Seu elemento salvo é ${names[saved]}. Na próxima etapa, vamos conectar esta entrada à página do diário.` : "";
  dialog.showModal();
});

const diaryApp = document.getElementById("diaryApp");
const landing = document.querySelector(".landing");
const currentElement = document.getElementById("currentElement");
const changeElement = document.getElementById("changeElement");
const createPage = document.getElementById("createPage");
const pageMessage = document.getElementById("pageMessage");

function enterDiary(element) {
  if (!names[element]) return;

  // Guarda o elemento escolhido neste dispositivo
  localStorage.setItem(THEME_KEY, element);

  // Aplica o tema e atualiza o nome
  
document.body.dataset.element = element;
renderizarEfeitosElementais(element);



const elementTitles = {
  agua: "Diário das Marés",
  fogo: "Diário das Chamas",
  ar: "Diário dos Ventos",
  terra: "Diário das Raízes",
  trovao: "Diário das Tempestades"
};

const elementSymbols = {
  agua: "≈",
  fogo: "♨",
  ar: "༄",
  terra: "❖",
  trovao: "ϟ"
};

currentElement.textContent = `Seu elemento: ${names[element]}`;

document.getElementById("elementHeading").textContent =
  elementTitles[element];

document.getElementById("elementMark").textContent =
  elementSymbols[element];


  // Esconde a entrada e mostra o diário
  landing.classList.add("is-hidden");
  diaryApp.hidden = false;

  // Fecha a janela de escolha, caso esteja aberta
  if (dialog.open) {
    dialog.close();
  }
}

// Cada cartão escolhe um elemento e abre o diário
document.querySelectorAll("[data-element]").forEach(button => {
  button.addEventListener("click", () => {
    enterDiary(button.dataset.element);
  });
});

// Permite trocar o elemento dentro do diário
changeElement.addEventListener("click", () => {
  const saved = localStorage.getItem(THEME_KEY);

  note.textContent = saved && names[saved]
    ? `Seu elemento atual é ${names[saved]}. Escolha outro, se desejar.`
    : "Escolha o elemento que combina com você.";

  dialog.showModal();
});

// Botão temporário até criarmos o editor de páginas
createPage.addEventListener("click", () => {
  pageMessage.textContent =
    "Em breve, você poderá escolher o papel, adicionar textos, imagens e decorações à sua página!";
});


/* ==========================================
   EFEITOS DOS CINCO ELEMENTOS
   ========================================== */

const efeitosElementais = {
  agua: {
    cor: "#83eaff",
    quantidade: 24,
    gif: "gifs/agua.gif"
  },
  fogo: {
    cor: "#ff9b43",
    quantidade: 25,
    gif: "gifs/fogo.gif"
  },
  ar: {
    cor: "#f2f5d1",
    quantidade: 17,
    gif: "gifs/ar.gif"
  },
  terra: {
    cor: "#d5ae68",
    quantidade: 19,
    gif: "gifs/terra.gif"
  },
  trovao: {
    cor: "#c9b5ff",
    quantidade: 22,
    gif: "gifs/trovao.gif"
  }
};

function renderizarEfeitosElementais(elemento) {
  const configuracao = efeitosElementais[elemento];
  const camada = document.getElementById("elementParticles");
  const gif = document.getElementById("elementGif");

  if (!configuracao || !camada || !gif) return;

  /* Cria partículas novas para o elemento escolhido */
  camada.replaceChildren();

  const quantidade = window.matchMedia("(max-width: 560px)").matches
    ? Math.ceil(configuracao.quantidade * 0.55)
    : configuracao.quantidade;

  const fragmento = document.createDocumentFragment();

  for (let i = 0; i < quantidade; i++) {
    const particula = document.createElement("span");

    particula.className = "element-particle";

    particula.style.setProperty("--x", `${Math.random() * 100}%`);
    particula.style.setProperty("--y", `${45 + Math.random() * 60}%`);
    particula.style.setProperty(
      "--size",
      `${3 + Math.random() * 7}px`
    );
    particula.style.setProperty("--particle-color", configuracao.cor);
    particula.style.setProperty(
      "--duration",
      `${5 + Math.random() * 7}s`
    );
    particula.style.setProperty(
      "--delay",
      `${-Math.random() * 12}s`
    );
    particula.style.setProperty(
      "--drift",
      `${Math.random() * 100 - 50}px`
    );
    particula.style.setProperty(
      "--rotation",
      `${Math.random() * 240 - 120}deg`
    );

    fragmento.appendChild(particula);
  }

  camada.appendChild(fragmento);

  /* Carrega o GIF do elemento.
     Se o arquivo ainda não existir, não mostra a imagem quebrada. */

  gif.removeAttribute("src");
  gif.onerror = () => {
    gif.removeAttribute("src");
  };

  gif.onload = () => {
    gif.style.display = "block";
  };

  gif.style.display = "none";
  gif.src = configuracao.gif;
}



function espalharMagia() {
  // Evita efeitos pesados demais em celulares.
  const celular = window.matchMedia(
    "(max-width: 560px)"
  ).matches;

  const quantidade = celular ? 65 : 115;

  // Cores adaptadas ao elemento escolhido.
  const cores = {
    agua: ["#8cecff", "#d7faff", "#4e9dff"],
    fogo: ["#ffb15c", "#ff623e", "#ffe6a1"],
    ar: ["#efffd1", "#d8fff1", "#ffffff"],
    terra: ["#d9b078", "#f2d7a0", "#9b7048"],
    trovao: ["#d7b8ff", "#a98bff", "#fff0b8"]
  };

  const elemento = document.body.dataset.element || "agua";
  const paleta = cores[elemento] || cores.agua;

  const simbolos = ["✦", "✧", "⋆", "·", "✺"];

  // O centro da explosão é a posição da varinha.
  const varinha = document.getElementById("magicWand");
  const retangulo = varinha.getBoundingClientRect();

  const origemX = retangulo.left + retangulo.width / 2;
  const origemY = retangulo.top + retangulo.height / 2;

  const fragmento = document.createDocumentFragment();
  const particulas = [];

  for (let i = 0; i < quantidade; i++) {
    const particula = document.createElement("span");

    particula.className = "magic-particle";
    particula.textContent =
      simbolos[Math.floor(Math.random() * simbolos.length)];

    // Cada partícula nasce perto da varinha.
    particula.style.left = `${origemX}px`;
    particula.style.top = `${origemY}px`;

    // Direção e distância aleatórias.
    // O alcance permite que o brilho atravesse a tela.
    const angulo = Math.random() * Math.PI * 2;

    const distanciaMaxima = Math.hypot(
      window.innerWidth,
      window.innerHeight
    ) * (0.35 + Math.random() * 0.5);

    const distancia = distanciaMaxima;

    const movimentoX = Math.cos(angulo) * distancia;
    const movimentoY = Math.sin(angulo) * distancia;

    particula.style.setProperty(
      "--move-x",
      `${movimentoX}px`
    );

    particula.style.setProperty(
      "--move-y",
      `${movimentoY}px`
    );

    particula.style.setProperty(
      "--particle-color",
      paleta[Math.floor(Math.random() * paleta.length)]
    );

    particula.style.setProperty(
      "--particle-size",
      `${10 + Math.random() * 15}px`
    );

    particula.style.setProperty(
      "--particle-duration",
      `${1.2 + Math.random() * 1.2}s`
    );

    fragmento.appendChild(particula);
    particulas.push(particula);
  }

  document.body.appendChild(fragmento);

  // Remove os elementos depois da animação para não pesar o site.
  particulas.forEach((particula) => {
    particula.addEventListener("animationend", () => {
      particula.remove();
    }, { once: true });
  });
}



/* FAZER A VARINHA SOLTAR MAGIA */

const magicWand = document.getElementById("magicWand");
const magicMenu = document.getElementById("magicMenu");

if (magicWand) {
  magicWand.addEventListener("click", () => {
    espalharMagia();

    // Abre ou fecha o menu mágico, se ele existir.
    if (magicMenu) {
      magicMenu.hidden = !magicMenu.hidden;

      magicWand.setAttribute(
        "aria-expanded",
        String(!magicMenu.hidden)
      );
    }
  });
}

