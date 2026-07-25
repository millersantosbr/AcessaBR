import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const DATA_PATH = "site/data/audits.json";
const CSV_PATH = "site/data/audits.csv";
const HISTORY_PATH = "site/data/history";

const targets = [
  {
    id: "prefeitura-maceio",
    name: "Prefeitura de Maceió",
    category: "Governo municipal",
    location: "Maceió · AL",
    url: "https://maceio.al.gov.br/",
  },
  {
    id: "servicos-maceio",
    name: "Portal de Serviços de Maceió",
    category: "Serviços ao cidadão",
    location: "Maceió · AL",
    url: "https://www.servicos.maceio.al.gov.br/",
  },
  {
    id: "alagoas-digital",
    name: "Alagoas Digital",
    category: "Serviços digitais",
    location: "Alagoas",
    url: "https://alagoasdigital.al.gov.br/",
  },
  {
    id: "portal-alagoas",
    name: "Portal Alagoas",
    category: "Governo estadual",
    location: "Alagoas",
    url: "https://ai.al.gov.br/servicos",
  },
  {
    id: "transparencia-al",
    name: "Transparência de Alagoas",
    category: "Transparência pública",
    location: "Alagoas",
    url: "https://transparencia.al.gov.br/",
  },
  {
    id: "saude-al",
    name: "Secretaria de Saúde de Alagoas",
    category: "Saúde",
    location: "Alagoas",
    url: "https://www.saude.al.gov.br/",
  },
  {
    id: "detran-al",
    name: "Detran Alagoas",
    category: "Mobilidade e trânsito",
    location: "Alagoas",
    url: "https://mais.detran.al.gov.br/",
  },
  {
    id: "educacao-al",
    name: "Secretaria de Educação de Alagoas",
    category: "Educação",
    location: "Alagoas",
    url: "https://escolaweb.educacao.al.gov.br/",
  },
  {
    id: "defensoria-al",
    name: "Defensoria Pública de Alagoas",
    category: "Acesso à Justiça",
    location: "Alagoas",
    url: "https://defensoria.al.def.br/",
  },
  {
    id: "tjal",
    name: "Tribunal de Justiça de Alagoas",
    category: "Justiça",
    location: "Alagoas",
    url: "https://tjal.jus.br/",
  },
];

function collectionSummary(data) {
  return {
    generatedAt: data.generatedAt,
    methodologyVersion: data.methodologyVersion,
    portals: data.portals.length,
    audited: data.portals.filter((portal) => portal.status === "audited").length,
    unavailable: data.portals.filter((portal) => portal.status === "unavailable").length,
    occurrences: data.portals.reduce((total, portal) => total + (portal.totals?.nodes ?? 0), 0),
    critical: data.portals.reduce(
      (total, portal) => total + (portal.totals?.byImpact?.critical ?? 0),
      0,
    ),
    serious: data.portals.reduce(
      (total, portal) => total + (portal.totals?.byImpact?.serious ?? 0),
      0,
    ),
  };
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function createCsv(data) {
  const columns = [
    "collection_date",
    "methodology_version",
    "portal_id",
    "portal_name",
    "category",
    "location",
    "portal_url",
    "status",
    "http_status",
    "final_url",
    "rule_id",
    "impact",
    "occurrences",
    "rule_title",
    "help_url",
  ];
  const rows = [columns];

  for (const portal of data.portals) {
    const findings = portal.findings?.length ? portal.findings : [null];
    for (const finding of findings) {
      rows.push([
        data.generatedAt,
        data.methodologyVersion,
        portal.id,
        portal.name,
        portal.category,
        portal.location,
        portal.url,
        portal.status,
        portal.httpStatus,
        portal.finalUrl,
        finding?.id,
        finding?.impact,
        finding?.nodes ?? 0,
        finding?.title,
        finding?.helpUrl,
      ]);
    }
  }

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

async function readPreviousData() {
  try {
    return JSON.parse(await readFile(DATA_PATH, "utf8"));
  } catch {
    return null;
  }
}

const previousData = await readPreviousData();
const browser = await chromium.launch({
  ...(process.env.CI ? {} : { channel: "chrome" }),
  headless: true,
});
const collected = [];

for (const target of targets) {
  const context = await browser.newContext({
    locale: "pt-BR",
    reducedMotion: "reduce",
    userAgent:
      "AcessaBR/0.2 accessibility-research (+https://github.com/millersantosbr/AcessaBR)",
  });
  const page = await context.newPage();
  const startedAt = Date.now();

  try {
    const response = await page.goto(target.url, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.waitForTimeout(2_000);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const findings = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact ?? "unknown",
      title: violation.help,
      description: violation.description,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.length,
      examples: violation.nodes.slice(0, 3).map((node) => ({
        target: node.target.flat().join(" → "),
        summary: node.failureSummary ?? "",
      })),
      tags: violation.tags.filter((tag) => tag.startsWith("wcag")),
    }));

    const totals = findings.reduce(
      (acc, finding) => {
        acc.rules += 1;
        acc.nodes += finding.nodes;
        acc.byImpact[finding.impact] =
          (acc.byImpact[finding.impact] ?? 0) + finding.nodes;
        return acc;
      },
      { rules: 0, nodes: 0, byImpact: {} },
    );

    collected.push({
      ...target,
      status: "audited",
      httpStatus: response?.status() ?? null,
      finalUrl: page.url(),
      pageTitle: await page.title(),
      auditedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      standard: "WCAG 2.2 A/AA — verificação automatizada parcial",
      engine: "axe-core 4.10.2",
      totals,
      findings,
    });
    console.log(`${target.name}: ${totals.rules} regras, ${totals.nodes} ocorrências`);
  } catch (error) {
    collected.push({
      ...target,
      status: "unavailable",
      auditedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
      totals: { rules: 0, nodes: 0, byImpact: {} },
      findings: [],
    });
    console.error(`${target.name}: indisponível`);
  } finally {
    await context.close();
  }
}

await browser.close();

const previousHistory = Array.isArray(previousData?.history) ? previousData.history : [];
const history = [...previousHistory];
if (
  previousData?.generatedAt &&
  !history.some((entry) => entry.generatedAt === previousData.generatedAt)
) {
  history.push(collectionSummary(previousData));
}

const dataset = {
  generatedAt: new Date().toISOString(),
  methodologyVersion: "0.2.0",
  schemaVersion: "1.1.0",
  disclaimer:
    "Resultados automatizados indicam barreiras potenciais e não constituem certificação ou declaração de conformidade.",
  history: history.slice(-24),
  portals: collected,
};

if (previousData?.generatedAt) {
  await mkdir(HISTORY_PATH, { recursive: true });
  const snapshotName = previousData.generatedAt.replaceAll(":", "-");
  await writeFile(
    `${HISTORY_PATH}/${snapshotName}.json`,
    `${JSON.stringify(previousData, null, 2)}\n`,
  );
}

await writeFile(DATA_PATH, `${JSON.stringify(dataset, null, 2)}\n`);
await writeFile(CSV_PATH, createCsv(dataset));

const summary = collectionSummary(dataset);
console.log(
  `Coleta concluída: ${summary.audited}/${summary.portals} portais analisados e ${summary.occurrences} ocorrências registradas.`,
);
