# Como contribuir com o AcessaBR

Obrigado por ajudar a construir serviços digitais melhores. Contribuições de
código, experiência, pesquisa, conteúdo, design, documentação e articulação
comunitária são bem-vindas.

## Antes de começar

1. Leia o [Código de Conduta](CODE_OF_CONDUCT.md).
2. Consulte a [metodologia](docs/METHODOLOGY.md).
3. Procure uma issue existente antes de abrir outra.
4. Em mudanças maiores, abra uma discussão antes de implementar.

## Formas de contribuição

### Sugerir um portal

Use o formulário **Sugerir um portal**. Explique por que o serviço é importante
e informe apenas URLs públicas. Não envie credenciais, documentos ou dados
pessoais.

### Validar uma barreira

Relatos manuais devem informar:

- página e tarefa;
- navegador e sistema operacional;
- tecnologia assistiva, quando aplicável;
- comportamento esperado;
- comportamento observado;
- passos mínimos para reprodução.

Evite compartilhar dados pessoais. Use informações fictícias ao descrever
formulários.

### Informar uma correção

Mantenedores dos portais podem apontar mudanças, falsos positivos ou novos
endereços. O resultado será revisado e uma nova coleta poderá ser executada.
Resultados anteriores permanecem no histórico para transparência.

### Contribuir com código

1. Escolha uma issue e comente que deseja trabalhar nela.
2. Faça um fork e crie uma branch pequena e descritiva.
3. Execute `npm ci` e `npm test`.
4. Mantenha a interface acessível por teclado e responsiva.
5. Abra um pull request explicando problema, solução e validação.

## Regras de escopo

- uma contribuição deve resolver um problema principal;
- novos textos devem ser escritos em linguagem simples;
- novas regras precisam de referência e limitação documentadas;
- não aceitaremos ranking simplista ou “nota de acessibilidade”;
- não aceitaremos técnicas que contornem autenticação ou proteção de acesso;
- dependências novas exigem justificativa;
- dados de auditoria não devem ser editados para melhorar ou piorar um portal.

## Padrão de commits

Prefira mensagens curtas:

```text
feat: adiciona filtro por território
fix: preserva foco ao fechar relatório
docs: explica validação manual
data: atualiza coleta automatizada
```

## Revisão

Pull requests são avaliados por:

- coerência com a missão;
- segurança e privacidade;
- acessibilidade da solução;
- clareza e manutenção;
- testes ou evidência de validação;
- qualidade da comunicação.

O objetivo da revisão é melhorar a contribuição, não testar conhecimento.
