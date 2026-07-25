import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

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
];

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
      "AcessaBR/0.1 accessibility-research (+https://github.com/millersantosbr/AcessaBR)",
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
await writeFile(
  "site/data/audits.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      methodologyVersion: "0.1.0",
      disclaimer:
        "Resultados automatizados indicam barreiras potenciais e não constituem certificação ou declaração de conformidade.",
      portals: collected,
    },
    null,
    2,
  ),
);
