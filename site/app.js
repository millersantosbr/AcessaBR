const DATA_URL = "./data/audits.json";

const ruleContent = {
  "color-contrast": {
    title: "Contraste de cor insuficiente",
    why: "Textos com pouco contraste podem se tornar ilegíveis para pessoas com baixa visão, daltonismo ou que usam a tela sob muita luz.",
    review:
      "Revisar as combinações de primeiro plano e fundo e alcançar as relações mínimas indicadas pela WCAG.",
  },
  "link-name": {
    title: "Link sem nome compreensível",
    why: "Leitores de tela podem anunciar apenas “link”, sem informar para onde a ação leva.",
    review:
      "Adicionar um texto visível ou nome acessível que descreva claramente o destino do link.",
  },
  "button-name": {
    title: "Botão sem nome compreensível",
    why: "Uma pessoa que usa leitor de tela pode encontrar o controle, mas não descobrir o que ele faz.",
    review:
      "Fornecer texto visível ou um nome acessível equivalente à ação executada pelo botão.",
  },
  "target-size": {
    title: "Área de toque pequena",
    why: "Controles pequenos são mais difíceis de acionar para pessoas com mobilidade reduzida, tremores ou que usam telas pequenas.",
    review:
      "Aumentar a área interativa ou o espaço entre controles próximos, preservando pelo menos o tamanho recomendado.",
  },
  "image-alt": {
    title: "Imagem sem alternativa textual",
    why: "Pessoas que não enxergam a imagem podem perder a informação ou a função representada por ela.",
    review:
      "Adicionar uma descrição equivalente quando a imagem for informativa ou usar alternativa vazia quando for apenas decorativa.",
  },
  "role-img-alt": {
    title: "Imagem composta sem descrição",
    why: "Elementos apresentados como imagem podem ser anunciados sem qualquer significado por tecnologias assistivas.",
    review: "Fornecer um nome acessível que comunique a mesma informação visual.",
  },
  "aria-input-field-name": {
    title: "Campo sem identificação",
    why: "A pessoa pode chegar ao campo, mas não saber qual informação precisa fornecer.",
    review: "Associar um rótulo visível e programático ao campo de formulário.",
  },
  "aria-allowed-attr": {
    title: "Atributo ARIA incompatível",
    why: "Uma marcação ARIA inválida pode gerar anúncios incorretos ou inconsistentes em leitores de tela.",
    review: "Remover o atributo incompatível ou ajustar o papel semântico do elemento.",
  },
  "aria-required-children": {
    title: "Componente ARIA incompleto",
    why: "A estrutura esperada do componente está incompleta, o que pode impedir sua compreensão ou operação.",
    review: "Incluir os elementos filhos obrigatórios ou substituir por HTML semântico nativo.",
  },
  list: {
    title: "Estrutura de lista inválida",
    why: "Leitores de tela podem anunciar incorretamente a quantidade e a relação entre os itens.",
    review: "Manter apenas itens de lista dentro de listas ou usar outra estrutura semântica apropriada.",
  },
  listitem: {
    title: "Item fora de uma lista",
    why: "O item pode ser anunciado sem contexto e sem relação com os demais elementos.",
    review: "Inserir o item dentro de uma lista válida ou ajustar o elemento HTML utilizado.",
  },
  "frame-title": {
    title: "Conteúdo incorporado sem título",
    why: "Uma pessoa que usa leitor de tela pode não conseguir identificar o conteúdo ou decidir se deseja acessá-lo.",
    review: "Adicionar um título curto e específico ao frame incorporado.",
  },
  "html-has-lang": {
    title: "Idioma da página não identificado",
    why: "Leitores de tela podem pronunciar todo o conteúdo usando o idioma errado.",
    review: "Definir o atributo lang no elemento HTML com o idioma principal da página.",
  },
};

const impactLabels = {
  critical: "Crítico",
  serious: "Sério",
  moderate: "Moderado",
  minor: "Menor",
  unknown: "Não classificado",
};

const state = {
  data: null,
  filter: "all",
  search: "",
  trigger: null,
};

const portalGrid = document.querySelector("#portal-grid");
const loadingState = document.querySelector("#loading-state");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#portal-search");
const filters = [...document.querySelectorAll("[data-filter]")];
const dialog = document.querySelector("#report-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogMeta = document.querySelector("#dialog-meta");
const dialogContent = document.querySelector("#dialog-content");
const dialogClose = document.querySelector("#dialog-close");
const shareButton = document.querySelector("#share-project");
const toast = document.querySelector("#toast");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(Number(value || 0));
}

function formatDate(value, compact = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Maceio",
    day: "2-digit",
    month: compact ? "short" : "long",
    year: "numeric",
  })
    .format(date)
    .replace(".", "")
    .toUpperCase();
}

function summarize(data) {
  return data.portals.reduce(
    (acc, portal) => {
      acc.portals += 1;
      acc.nodes += portal.totals?.nodes ?? 0;
      acc.critical += portal.totals?.byImpact?.critical ?? 0;
      acc.serious += portal.totals?.byImpact?.serious ?? 0;
      if (portal.status === "audited" && (portal.totals?.nodes ?? 0) === 0) acc.clear += 1;
      return acc;
    },
    { portals: 0, nodes: 0, critical: 0, serious: 0, clear: 0 },
  );
}

function updateStats(data) {
  const totals = summarize(data);
  for (const [key, value] of Object.entries(totals)) {
    document.querySelectorAll(`[data-stat="${key}"]`).forEach((element) => {
      element.textContent = formatNumber(value);
    });
  }
  document.querySelectorAll('[data-stat="date"]').forEach((element) => {
    element.textContent = formatDate(data.generatedAt, true);
  });
}

function impactBar(portal) {
  const impacts = portal.totals?.byImpact ?? {};
  const total = portal.totals?.nodes || 1;
  return ["critical", "serious", "moderate", "minor"]
    .map((impact) => {
      const value = impacts[impact] ?? 0;
      if (!value) return "";
      const width = (value / total) * 100;
      return `<span class="${impact}" style="width:${width.toFixed(
        2,
      )}%" title="${escapeHtml(impactLabels[impact])}: ${formatNumber(value)}"></span>`;
    })
    .join("");
}

function portalCard(portal, index) {
  const nodes = portal.totals?.nodes ?? 0;
  const critical = portal.totals?.byImpact?.critical ?? 0;
  const isClear = portal.status === "audited" && nodes === 0;
  const status =
    portal.status === "unavailable"
      ? "Coleta indisponível"
      : isClear
        ? "Sem achado automático"
        : "Em observação";
  const countText =
    portal.status === "unavailable"
      ? "—"
      : formatNumber(nodes);
  const countLabel =
    portal.status === "unavailable"
      ? "tente novamente na próxima coleta"
      : nodes === 0
        ? "ocorrências automáticas; validação humana pendente"
        : `${formatNumber(portal.totals.rules)} regras com ocorrências`;

  return `
    <article
      class="portal-card"
      data-has-critical="${critical > 0}"
      data-is-clear="${isClear}"
      aria-labelledby="portal-${escapeHtml(portal.id)}"
    >
      <div class="portal-card-top">
        <span>PRT / ${String(index + 1).padStart(2, "0")}</span>
        <span class="portal-status">${escapeHtml(status)}</span>
      </div>
      <h3 id="portal-${escapeHtml(portal.id)}">${escapeHtml(portal.name)}</h3>
      <p class="portal-category">${escapeHtml(portal.category)} · ${escapeHtml(
        portal.location,
      )}</p>
      <p class="portal-count">${countText}</p>
      <p class="portal-count-label">${escapeHtml(countLabel)}</p>
      <div
        class="impact-bar"
        role="img"
        aria-label="${escapeHtml(
          `Distribuição das ocorrências: ${critical} críticas e ${
            portal.totals?.byImpact?.serious ?? 0
          } sérias`,
        )}"
      >
        ${impactBar(portal)}
      </div>
      <div class="portal-card-footer">
        <p>COLETA · ${escapeHtml(formatDate(portal.auditedAt, true))}</p>
        <button
          class="open-report"
          type="button"
          data-portal-id="${escapeHtml(portal.id)}"
          aria-label="Abrir relatório de ${escapeHtml(portal.name)}"
        >↗</button>
      </div>
    </article>
  `;
}

function visiblePortals() {
  const term = state.search.trim().toLocaleLowerCase("pt-BR");
  return state.data.portals.filter((portal) => {
    const nodes = portal.totals?.nodes ?? 0;
    const critical = portal.totals?.byImpact?.critical ?? 0;
    const matchesFilter =
      state.filter === "all" ||
      (state.filter === "critical" && critical > 0) ||
      (state.filter === "clear" && portal.status === "audited" && nodes === 0) ||
      (state.filter === "unavailable" && portal.status === "unavailable");
    const haystack = `${portal.name} ${portal.category} ${portal.location}`.toLocaleLowerCase(
      "pt-BR",
    );
    return matchesFilter && (!term || haystack.includes(term));
  });
}

function renderPortals() {
  const portals = visiblePortals();
  portalGrid.innerHTML = portals.map(portalCard).join("");
  emptyState.hidden = portals.length > 0;

  portalGrid.querySelectorAll("[data-portal-id]").forEach((button) => {
    button.addEventListener("click", () => openReport(button.dataset.portalId, button));
  });
}

function findingMarkup(finding) {
  const content = ruleContent[finding.id] ?? {
    title: finding.title,
    why: "Esta regra pode afetar a compreensão ou a operação da interface.",
    review: "Consultar a documentação técnica da regra e validar o comportamento com pessoas.",
  };
  const impact = finding.impact ?? "unknown";
  const examples = (finding.examples ?? [])
    .slice(0, 2)
    .map((example) => `<code>${escapeHtml(example.target)}</code>`)
    .join("");

  return `
    <details class="finding">
      <summary>
        <div class="finding-heading">
          <div>
            <span class="finding-impact ${escapeHtml(impact)}">${escapeHtml(
              impactLabels[impact] ?? impactLabels.unknown,
            )}</span>
            <h3>${escapeHtml(content.title)}</h3>
          </div>
          <span class="finding-count">${formatNumber(finding.nodes)} ${
            finding.nodes === 1 ? "elemento" : "elementos"
          } +</span>
        </div>
      </summary>
      <div class="finding-body">
        <h4>Quem pode ser afetado</h4>
        <p>${escapeHtml(content.why)}</p>
        <h4>O que revisar</h4>
        <p>${escapeHtml(content.review)}</p>
        ${
          examples
            ? `<h4>Exemplos observados</h4>${examples}`
            : ""
        }
        <h4>Regra reproduzível</h4>
        <p>
          <a href="${escapeHtml(finding.helpUrl)}" target="_blank" rel="noreferrer">
            ${escapeHtml(finding.id)} — documentação técnica ↗
          </a>
        </p>
      </div>
    </details>
  `;
}

function openReport(portalId, trigger) {
  const portal = state.data.portals.find((item) => item.id === portalId);
  if (!portal) return;

  state.trigger = trigger;
  dialogTitle.textContent = portal.name;
  dialogMeta.textContent = `RELATÓRIO / ${portal.location.toUpperCase()} / ${formatDate(
    portal.auditedAt,
    true,
  )}`;

  if (portal.status === "unavailable") {
    dialogContent.innerHTML = `
      <p class="report-disclaimer">
        A página não pôde ser analisada nesta coleta. Isso não informa nada sobre sua
        acessibilidade; apenas registra uma falha de acesso do coletor.
      </p>
      <div class="report-actions">
        <a class="button button-secondary" href="${escapeHtml(
          portal.url,
        )}" target="_blank" rel="noreferrer">Abrir portal ↗</a>
      </div>
    `;
    dialog.showModal();
    return;
  }

  const critical = portal.totals?.byImpact?.critical ?? 0;
  const serious = portal.totals?.byImpact?.serious ?? 0;
  const findings = portal.findings ?? [];
  dialogContent.innerHTML = `
    <div class="report-summary">
      <div><span>Ocorrências</span><strong>${formatNumber(portal.totals.nodes)}</strong></div>
      <div><span>Críticas</span><strong>${formatNumber(critical)}</strong></div>
      <div><span>Sérias</span><strong>${formatNumber(serious)}</strong></div>
      <div><span>Regras</span><strong>${formatNumber(portal.totals.rules)}</strong></div>
    </div>
    <p class="report-disclaimer">
      Verificação automatizada parcial de uma página. O resultado não é certificação,
      ranking ou declaração de conformidade WCAG.
    </p>
    ${
      findings.length
        ? `<div class="finding-list">${findings.map(findingMarkup).join("")}</div>`
        : `<div class="finding-list">
            <p>
              Nenhuma ocorrência automática foi registrada nesta página. Testes por teclado,
              zoom, leitor de tela e outras tecnologias ainda são necessários.
            </p>
          </div>`
    }
    <div class="report-actions">
      <a class="button button-primary" href="https://github.com/millersantosbr/AcessaBR/issues/new?template=validacao-manual.yml&title=${encodeURIComponent(
        `[Validação] ${portal.name}`,
      )}" target="_blank" rel="noreferrer">Validar manualmente ↗</a>
      <a class="button button-secondary" href="${escapeHtml(
        portal.url,
      )}" target="_blank" rel="noreferrer">Abrir portal ↗</a>
    </div>
  `;

  dialog.showModal();
}

function closeReport() {
  dialog.close();
  state.trigger?.focus();
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

async function shareProject() {
  const shareData = {
    title: "AcessaBR — Radar aberto de acessibilidade digital",
    text: "Conheça o projeto open source que transforma barreiras digitais em correções possíveis.",
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    showToast("Link copiado. Obrigado por compartilhar o AcessaBR!");
  } catch (error) {
    if (error?.name !== "AbortError") {
      showToast("Não foi possível compartilhar agora. Copie o endereço do navegador.");
    }
  }
}

async function init() {
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderPortals();
    });
  });

  searchInput.addEventListener("input", () => {
    state.search = searchInput.value;
    renderPortals();
  });

  dialogClose.addEventListener("click", closeReport);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeReport();
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeReport();
  });
  shareButton.addEventListener("click", shareProject);

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    updateStats(state.data);
    renderPortals();
    loadingState.hidden = true;
  } catch {
    loadingState.textContent =
      "A base de dados não pôde ser carregada. Tente novamente ou consulte o repositório.";
  }
}

init();
