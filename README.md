# AcessaBR

![AcessaBR — A internet precisa funcionar para todo mundo](site/og.png)

**Radar aberto e comunitário de barreiras de acessibilidade digital.**

[Abrir o radar](https://millersantosbr.github.io/AcessaBR/) ·
[Ler a metodologia](site/metodologia.html) ·
[Sugerir um portal](https://github.com/millersantosbr/AcessaBR/issues/new?template=sugerir-portal.yml) ·
[Contribuir](CONTRIBUTING.md)

## Por que este projeto existe

Serviços digitais públicos e essenciais fazem parte do acesso a direitos. Uma barreira de
contraste, navegação, formulário ou semântica pode impedir alguém de obter informação ou concluir
uma tarefa.

O AcessaBR transforma verificações técnicas reproduzíveis em explicações humanas. O objetivo não é
criar um ranking ou constranger equipes: é tornar problemas visíveis, facilitar correções e abrir
espaço para validação por quem vive essas barreiras.

## Primeira coleta

A versão `0.1.0` começa por seis portais de Alagoas:

- Prefeitura de Maceió;
- Portal de Serviços de Maceió;
- Alagoas Digital;
- Portal Alagoas;
- Portal da Transparência de Alagoas;
- Secretaria de Saúde de Alagoas.

Na coleta inicial, o mecanismo registrou **396 ocorrências automatizadas** relacionadas a 13 tipos
de regra. Esses números são indícios em páginas selecionadas, não uma declaração de conformidade
do portal inteiro.

## O que já funciona

- painel público filtrável;
- relatórios por portal em linguagem simples;
- dados abertos em JSON;
- coletor reproduzível com axe-core e Playwright;
- execução semanal pelo GitHub Actions;
- registro de versão, data, mecanismo e limitações;
- fluxo para sugerir portais, validar barreiras e informar correções;
- página pública de metodologia;
- experiência responsiva, navegável por teclado e com redução de movimento.

## O que o AcessaBR não faz

- não concede selo de acessibilidade;
- não calcula uma porcentagem de “site acessível”;
- não substitui auditoria manual;
- não afirma que zero achados automáticos significa ausência de barreiras;
- não tenta contornar autenticação, CAPTCHA ou proteção de acesso;
- não coleta credenciais ou dados pessoais de usuários.

## Executar localmente

Requisitos:

- Node.js 22.13 ou superior;
- npm.

```bash
npm ci
npm run dev
```

O endereço local será exibido no terminal.

### Executar uma nova coleta

```bash
npx playwright install chromium
npm run audit
```

O arquivo `site/data/audits.json` será atualizado. Revise os resultados antes de publicar.

### Validar e preparar o site

```bash
npm test
```

## Como contribuir

Há trabalho útil para diferentes experiências:

- **pessoas com deficiência e usuárias de tecnologias assistivas:** validar jornadas e linguagem;
- **comunidades locais:** sugerir serviços relevantes;
- **desenvolvedores:** melhorar o coletor, painel, testes e automações;
- **designers e especialistas em conteúdo:** revisar visualização e explicações;
- **tradutores:** ampliar o acesso ao projeto e à documentação;
- **mantenedores de portais:** informar correções e ajudar a reproduzir resultados.

Leia o [guia de contribuição](CONTRIBUTING.md) e procure tarefas marcadas como
[`good first issue`](https://github.com/millersantosbr/AcessaBR/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

## Estrutura

```text
.
├── site/                  # dashboard publicado no GitHub Pages
│   ├── data/audits.json   # base aberta atual
│   ├── index.html
│   ├── metodologia.html
│   ├── app.js
│   └── styles.css
├── scripts/
│   ├── audit.mjs          # coleta automatizada
│   ├── build.mjs
│   └── validate.mjs
├── docs/
│   └── METHODOLOGY.md
└── .github/workflows/     # qualidade, coleta e publicação
```

## Metodologia e referências

A metodologia combina:

- WCAG 2.2;
- WCAG-EM 2.0;
- eMAG 3.1;
- regras automatizadas do axe-core;
- futura validação humana documentada.

Leia [docs/METHODOLOGY.md](docs/METHODOLOGY.md) para conhecer escopo, interpretação, limitações e
processo de correção.

## Governança e segurança

- [Governança](GOVERNANCE.md)
- [Código de Conduta](CODE_OF_CONDUCT.md)
- [Política de Segurança](SECURITY.md)
- [Roadmap](ROADMAP.md)

## Licenças

O código é distribuído sob a [Licença MIT](LICENSE). A base de resultados e a documentação pública
são disponibilizadas sob [CC BY 4.0](DATA_LICENSE.md).

## Autoria

Iniciado por [Miller Santos](https://millersantosbr-id.web.app/) em Maceió, Alagoas.

O AcessaBR é um projeto independente e não representa os órgãos monitorados.
