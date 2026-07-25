import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.ACESSABR_TEST_URL ?? "http://127.0.0.1:5173";
const pages = [
  { name: "Radar", path: "/" },
  { name: "Metodologia", path: "/metodologia.html" },
];

const browser = await chromium.launch({
  ...(process.env.CI ? {} : { channel: "chrome" }),
  headless: true,
});

let failed = false;

for (const target of pages) {
  const context = await browser.newContext({
    locale: "pt-BR",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}${target.path}`, {
    waitUntil: "networkidle",
    timeout: 30_000,
  });

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  if (results.violations.length) {
    failed = true;
    console.error(`${target.name}: ${results.violations.length} regras com ocorrências`);
    for (const violation of results.violations) {
      console.error(
        `- ${violation.id} (${violation.impact ?? "sem impacto"}): ${violation.nodes.length}`,
      );
      violation.nodes.slice(0, 3).forEach((node) => {
        console.error(`  ${node.target.flat().join(" → ")}`);
      });
    }
  } else {
    console.log(`${target.name}: nenhuma ocorrência automática A/AA.`);
  }

  await context.close();
}

await browser.close();

if (failed) process.exit(1);
