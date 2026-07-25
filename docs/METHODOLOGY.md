# Metodologia do AcessaBR

Versão: `0.1.0`

## 1. Objetivo

Identificar barreiras potenciais em páginas públicas, explicar seus possíveis
efeitos e oferecer evidência reproduzível para priorização e correção.

O AcessaBR não realiza certificação e não declara conformidade integral com as
WCAG.

## 2. Referências

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WCAG-EM 2.0](https://www.w3.org/TR/wcag-em-2/)
- [eMAG 3.1](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/modelo-de-acessibilidade)
- [axe-core](https://github.com/dequelabs/axe-core)

## 3. Unidade de observação

Cada resultado corresponde a uma URL e a uma execução datada. A observação de
uma URL não representa todas as páginas, estados, documentos, jornadas ou
aplicativos mantidos pela mesma instituição.

## 4. Coleta automatizada

O script `scripts/audit.mjs`:

1. abre a página em Chromium;
2. aguarda o carregamento inicial;
3. executa axe-core com tags WCAG de níveis A e AA;
4. registra regra, impacto, quantidade de elementos e até três seletores;
5. grava mecanismo, versão, URL final, título, data e duração;
6. registra falhas de acesso sem inferir acessibilidade.

O user agent identifica o AcessaBR. O coletor não contorna autenticação,
CAPTCHA, paywall ou proteção de acesso.

## 5. Níveis de impacto

Os níveis `critical`, `serious`, `moderate` e `minor` são fornecidos pelo
axe-core. Eles ajudam na triagem, mas não substituem contexto humano. A
quantidade de elementos afetados não é uma porcentagem de acessibilidade.

## 6. Comunicação

Cada regra recebe:

- título em linguagem simples;
- explicação de quem pode ser afetado;
- orientação de revisão;
- link para a documentação técnica;
- exemplos limitados de seletores.

O projeto evita usar “aprovado”, “reprovado” ou “nota”.

## 7. Validação manual

Validações comunitárias devem registrar:

- URL e tarefa;
- data e ambiente;
- tecnologia assistiva, quando aplicável;
- comportamento esperado e observado;
- passos de reprodução;
- possível solução, quando conhecida.

Validações automáticas e manuais permanecem separadas na base.

## 8. Limitações

- automação encontra apenas parte das barreiras;
- conteúdo dinâmico pode variar;
- uma página não representa um portal;
- alguns critérios exigem julgamento especializado;
- tecnologias assistivas têm comportamentos diferentes;
- resultados envelhecem quando a página muda;
- falsos positivos e falsos negativos são possíveis.

## 9. Correções e contestação

Uma instituição ou contribuidor pode abrir uma issue com evidências. A equipe
revisa a regra, o escopo e a versão. Quando apropriado, executa-se uma nova
coleta. O histórico anterior permanece no GitHub.

## 10. Versionamento

Mudanças que alteram significado, escopo, interpretação ou estrutura dos dados
incrementam a versão da metodologia. A base inclui a versão utilizada.
