const GITHUB_USER = "Evelynsuzarte";
const PAGE_SIZE = 6;

const projectsGrid = document.getElementById("projects-grid");
const projectsStatus = document.getElementById("projects-status");
const paginationNav = document.getElementById("projects-pagination");
const funAnimateBtn = document.getElementById("fun-animate-btn");
const funBtnLabel = document.getElementById("fun-btn-label");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeBtnLabel = document.getElementById("theme-btn-label");
const curtainOverlay = document.getElementById("curtain-overlay");
const curtainReopenBtn = document.getElementById("curtain-reopen-btn");

let isCurtainOpen = false;
const THEME_STORAGE_KEY = "evelyn-portfolio-theme";

let allRepos = [];
let currentPage = 1;

/**
 * Ordena os repositórios priorizando os que possuem mais estrelas
 * e, em seguida, os atualizados mais recentemente.
 */
function sortReposByStarsAndDate(repos) {
  return [...repos].sort((a, b) => {
    if (b.stargazers_count !== a.stargazers_count) {
      return b.stargazers_count - a.stargazers_count;
    }
    return new Date(b.pushed_at) - new Date(a.pushed_at);
  });
}

/**
 * Cria o card de um repositório de forma segura usando elementos DOM.
 */
function createProjectCard(repo) {
  const card = document.createElement("article");
  card.className = "project-card";

  const header = document.createElement("div");
  header.className = "project-header";

  const title = document.createElement("h3");
  title.className = "project-title";
  title.textContent = repo.name;

  const stars = document.createElement("span");
  stars.className =
    repo.stargazers_count > 0
      ? "project-stars has-stars"
      : "project-stars";
  stars.textContent = `★ ${repo.stargazers_count}`;
  stars.setAttribute(
    "aria-label",
    `${repo.stargazers_count} estrela(s) no GitHub`
  );

  header.append(title, stars);

  const description = document.createElement("p");
  description.className = "project-desc";
  description.textContent =
    repo.description || "Projeto sem descrição cadastrada no GitHub.";

  const footer = document.createElement("div");
  footer.className = "project-footer";

  const lang = document.createElement("span");
  lang.className = "project-lang";
  lang.textContent = repo.language || "Outro";

  const link = document.createElement("a");
  link.className = "project-link";
  link.href = repo.html_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Ver código ↗";

  footer.append(lang, link);
  card.append(header, description, footer);

  return card;
}

/**
 * Cria um botão de paginação reutilizável.
 */
function createPageButton(label, targetPage, { disabled = false, active = false } = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = active ? "page-btn is-active" : "page-btn";
  button.textContent = label;
  button.disabled = disabled;

  if (active) {
    button.setAttribute("aria-current", "page");
  }

  button.addEventListener("click", () => {
    currentPage = targetPage;
    renderProjects();
  });

  return button;
}

/**
 * Renderiza os controles de paginação (Anterior, números das páginas e Próxima).
 */
function renderPagination(totalPages) {
  paginationNav.innerHTML = "";

  if (totalPages <= 1) {
    paginationNav.hidden = true;
    return;
  }

  paginationNav.hidden = false;

  paginationNav.appendChild(
    createPageButton("← Anterior", currentPage - 1, {
      disabled: currentPage === 1,
    })
  );

  for (let page = 1; page <= totalPages; page += 1) {
    paginationNav.appendChild(
      createPageButton(String(page), page, {
        active: page === currentPage,
      })
    );
  }

  paginationNav.appendChild(
    createPageButton("Próxima →", currentPage + 1, {
      disabled: currentPage === totalPages,
    })
  );
}

/**
 * Renderiza os 6 cards da página atual em grade de 2 colunas.
 */
function renderProjects() {
  projectsGrid.innerHTML = "";

  const totalPages = Math.ceil(allRepos.length / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRepos = allRepos.slice(start, start + PAGE_SIZE);

  pageRepos.forEach((repo) => {
    projectsGrid.appendChild(createProjectCard(repo));
  });

  renderPagination(totalPages);
}

/**
 * Busca os repositórios públicos do usuário na API do GitHub.
 */
async function loadGitHubProjects() {
  const endpoint = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Erro na API do GitHub (${response.status})`);
    }

    const repos = await response.json();
    allRepos = sortReposByStarsAndDate(repos);

    if (allRepos.length === 0) {
      projectsStatus.textContent =
        "Nenhum repositório público encontrado no momento.";
      return;
    }

    projectsStatus.hidden = true;
    renderProjects();
  } catch (error) {
    projectsStatus.textContent =
      "Não foi possível carregar os projetos automaticamente agora. ";

    const fallbackLink = document.createElement("a");
    fallbackLink.href = `https://github.com/${GITHUB_USER}?tab=repositories`;
    fallbackLink.target = "_blank";
    fallbackLink.rel = "noopener noreferrer";
    fallbackLink.className = "project-link";
    fallbackLink.textContent = "Acessar repositórios no GitHub ↗";

    projectsStatus.appendChild(fallbackLink);
  }
}

/**
 * Atualiza o estado visual e de acessibilidade da cortina e do botão.
 */
function setCurtainState(open) {
  if (!curtainOverlay) return;

  isCurtainOpen = open;
  curtainOverlay.classList.toggle("is-open", open);
  curtainOverlay.setAttribute("aria-hidden", String(open));

  if (funAnimateBtn && funBtnLabel) {
    funBtnLabel.textContent = open ? "Fechar cortina" : "Abrir cortina";
    funAnimateBtn.setAttribute("aria-pressed", String(!open));
  }
}

/**
 * Dispara uma animação divertida em cascata nos selos, etapas e estrelas.
 */
function triggerFunAnimation() {
  const targets = document.querySelectorAll(
    ".keyword-tag, .section-step, .tech-item, .project-stars"
  );

  targets.forEach((el, index) => {
    el.classList.remove("is-fun-animating");
    el.style.animationDelay = `${350 + Math.min(index * 35, 600)}ms`;
    void el.offsetWidth;
    el.classList.add("is-fun-animating");

    el.addEventListener(
      "animationend",
      () => {
        el.classList.remove("is-fun-animating");
        el.style.animationDelay = "";
      },
      { once: true }
    );
  });
}

function toggleCurtain() {
  if (isCurtainOpen) {
    setCurtainState(false);
  } else {
    setCurtainState(true);
    triggerFunAnimation();
  }
}

if (funAnimateBtn) {
  funAnimateBtn.addEventListener("click", toggleCurtain);
}

if (curtainReopenBtn) {
  curtainReopenBtn.addEventListener("click", () => {
    setCurtainState(true);
    triggerFunAnimation();
  });
}

/**
 * Aplica e salva o tema claro ou escuro.
 */
function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  if (themeToggleBtn && themeBtnLabel) {
    themeBtnLabel.textContent = isDark ? "Tema claro" : "Tema escuro";
    themeToggleBtn.setAttribute("aria-pressed", String(isDark));
  }
}

if (themeToggleBtn) {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    setCurtainState(true);
  });
});

loadGitHubProjects();
