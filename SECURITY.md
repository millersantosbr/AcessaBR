# Política de Segurança

## Versões suportadas

Enquanto o projeto estiver antes da versão 1.0, somente a versão publicada mais
recente recebe correções de segurança.

## Como relatar

Use o recurso **Private vulnerability reporting** na aba Security do
repositório. Se ele não estiver disponível, contate o mantenedor por um canal
privado listado em seu perfil do GitHub.

Não abra uma issue pública contendo:

- dados pessoais;
- credenciais ou tokens;
- uma técnica de exploração ainda não corrigida;
- informações que permitam acesso indevido a terceiros.

Inclua descrição, impacto, passos de reprodução sem dados reais e, se possível,
uma proposta de mitigação.

## Escopo

São relevantes:

- injeção de conteúdo nos relatórios;
- vazamento ou coleta indevida de dados;
- dependências comprometidas;
- automações que executem código não confiável;
- alterações maliciosas na base pública;
- links ou relatórios que possam expor informações sensíveis.

O coletor deve acessar apenas páginas públicas. Ele nunca deve receber
credenciais nem tentar contornar CAPTCHA, autenticação ou controles de acesso.
