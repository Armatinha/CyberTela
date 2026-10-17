# CyberTela

Vitrine de produtos digitais com catálogo interativo, filtros, busca, planos, carrinho local e demonstração visual de entrega automática.

## Prévia

O site é publicado pelo GitHub Pages em https://armatinha.github.io/CyberTela/.
O estado da publicação fica disponível em **Settings → Pages** e na execução **Publicar CyberTela no GitHub Pages**, em **Actions**.

## Desenvolvimento local

Requer Node.js. Execute `npm run dev` e abra `http://localhost:4600`.
O servidor local não depende da skill e serve somente os arquivos públicos.

Para repetir os testes de navegador, instale as dependências com `npm ci`, mantenha o servidor local aberto e execute `npm test`.
O roteiro de testes usa o Microsoft Edge instalado no Windows. O verificador visual roda com `npm run verificar` e também detecta instalações do Chrome.

## Publicação

Cada atualização da branch `main` executa `.github/workflows/pages.yml`.
O fluxo publica somente `index.html`, `sites-incriveis.css`, `sites-incriveis.js`, `.nojekyll` e a licença do motor. Dependências, backups, ferramentas e documentos de trabalho não são servidos no site.

## Estado da loja

O conteúdo ainda é demonstrativo. Os links de checkout e suporte, descrições dos produtos e dados do vendedor precisam ser configurados antes de operar vendas reais.
O painel guarda alterações neste navegador; para publicá-las é necessário exportar o HTML e atualizar o repositório.

## Autoria do motor

O motor Sites Incríveis conserva os avisos de © 2026 Enzo Barbatto — SPARO AUTOMACOES LTDA. Consulte `LICENCA.md`.
A skill completa não é distribuída neste repositório.
