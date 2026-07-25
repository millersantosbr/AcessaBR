import { readFile } from "node:fs/promises";

const files = {
  index: await readFile("site/index.html", "utf8"),
  methodology: await readFile("site/metodologia.html", "utf8"),
  css: await readFile("site/styles.css", "utf8"),
  script: await readFile("site/app.js", "utf8"),
  data: JSON.parse(await readFile("site/data/audits.json", "utf8")),
};

const failures = [];

function requireText(source, pattern, message) {
  if (!pattern.test(source)) failures.push(message);
}

for (const [name, html] of [
  ["index.html", files.index],
  ["metodologia.html", files.methodology],
]) {
  requireText(html, /<html lang="pt-BR">/, `${name}: idioma principal ausente`);
  requireText(html, /class="skip-link"/, `${name}: link de salto ausente`);
  requireText(html, /<main\b/, `${name}: região principal ausente`);
  requireText(html, /<h1\b/, `${name}: título H1 ausente`);
  requireText(html, /<title>[^<]+<\/title>/, `${name}: título da página ausente`);

  const blankLinks = html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? [];
  for (const link of blankLinks) {
    if (!/rel="[^"]*noreferrer[^"]*"/.test(link)) {
      failures.push(`${name}: link externo sem rel="noreferrer"`);
    }
  }
}

requireText(files.index, /id="portal-search"[^>]*type="search"/, "Busca sem tipo search");
requireText(files.index, /aria-live="polite"/, "Região de atualização sem aria-live");
requireText(files.index, /<dialog\b/, "Relatório não usa diálogo semântico");
requireText(files.css, /:focus-visible/, "Estilo de foco visível ausente");
requireText(
  files.css,
  /prefers-reduced-motion/,
  "Preferência por movimento reduzido não contemplada",
);
requireText(files.script, /escapeHtml/, "Conteúdo dinâmico sem escape explícito");

if (!Array.isArray(files.data.portals) || files.data.portals.length < 1) {
  failures.push("Base de auditorias não contém portais");
}

for (const portal of files.data.portals ?? []) {
  for (const field of ["id", "name", "url", "status", "auditedAt"]) {
    if (!portal[field]) failures.push(`Portal sem campo obrigatório: ${field}`);
  }
  if (!portal.totals || typeof portal.totals.nodes !== "number") {
    failures.push(`Portal ${portal.id ?? "desconhecido"} sem totais válidos`);
  }
}

if (!files.data.disclaimer?.includes("não constituem certificação")) {
  failures.push("Aviso metodológico obrigatório ausente da base");
}

if (failures.length) {
  console.error("Validação falhou:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Validação concluída: 2 páginas e ${files.data.portals.length} portais na base aberta.`,
);
