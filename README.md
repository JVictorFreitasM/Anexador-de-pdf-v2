# PDF Local

Uma ferramenta pequena para juntar e organizar PDFs sem enviar documentos a um servidor. Todo o processamento acontece localmente no navegador: os arquivos permanecem no dispositivo do usuário.

## Recursos

- Juntar PDFs com ordenação natural por nome (`arquivo2.pdf` vem antes de `arquivo10.pdf`), seleção de ordenação e reordenação manual.
- Prévia da primeira página, quantidade de páginas e tamanho de cada arquivo.
- Organizar páginas: arrastar, remover, girar, extrair intervalos, adicionar marca d’água e numeração configuráveis.
- Dividir PDFs por intervalos ou a cada quantidade de páginas.
- Criar um PDF a partir de imagens JPG ou PNG, com reordenação manual.
- Downloads locais com nome de arquivo personalizável, avisos para arquivos grandes e carregamento gradual das miniaturas.

## Rodar localmente

Não há dependências Node nem servidor de processamento. Basta servir a pasta `public` como arquivos estáticos. Por exemplo, com qualquer servidor estático instalado na máquina:

```bash
npx serve public
```

Abra o endereço informado pelo comando. Para que as bibliotecas de PDF e as fontes sejam carregadas, o navegador precisa de acesso à internet na primeira utilização, pois elas são obtidas de CDNs públicos.

## Deploy no Render

1. Crie um **Static Site** e conecte este repositório.
2. Use `public` como **Publish Directory**.
3. Deixe o **Build Command** vazio.
4. Faça o deploy.

Não configure um Start Command: esta aplicação não possui backend, banco de dados, armazenamento persistente ou endpoints de upload.

## Privacidade

Os PDFs, imagens, nomes de arquivos e metadados são lidos e manipulados somente no contexto do navegador. Nada é enviado pelo aplicativo ao Render ou a outro servidor para processar documentos.

## Estrutura

```text
public/
├── index.html
├── style.css
├── advanced.css      # controles avançados e visualização ampliada
└── js/
    ├── app.js          # estado e interface
    ├── pdf-tools.js    # operações com pdf-lib
    ├── preview.js      # prévias com PDF.js
    └── utils.js
```

As bibliotecas [pdf-lib](https://pdf-lib.js.org/) e [PDF.js](https://mozilla.github.io/pdf.js/) são carregadas no browser. O projeto não usa Express, Multer ou `pdf-merger-js`.

## Qualidade e CI/CD

Instale as dependências de desenvolvimento e execute todas as verificações localmente:

```bash
npm ci
npm run check
```

O workflow [CI/CD](.github/workflows/ci-cd.yml) é executado em cada `push` e pull request para `main`. Ele executa o ESLint e os testes automatizados antes do deploy.

Para permitir que o GitHub Actions dispare o deploy no Render depois que essas verificações passarem:

1. No painel do Render, crie um **Deploy Hook** para o Static Site.
2. No GitHub, em **Settings → Secrets and variables → Actions**, crie o secret `RENDER_DEPLOY_HOOK_URL` com a URL do hook.
3. No Render, desative o Auto-Deploy para evitar dois deploys para o mesmo commit.

Sem esse secret, o job de deploy termina sem publicar nada; nesse caso, você pode manter o Auto-Deploy nativo do Render ativado.
