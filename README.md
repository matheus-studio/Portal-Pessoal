# Portal pessoal · Matheus Studio

Página estática de links e vitrine. HTML, CSS e JavaScript puros, sem build e sem framework.

## Estrutura

```
portal/
├── index.html      estrutura da página
├── styles.css      visual (cores e tamanhos no topo, em :root)
├── script.js       monta a página a partir do content.json
├── content.json    todos os textos, links e números: é aqui que você troca tudo
└── images/         fotos (crie esta pasta, veja abaixo)
```

## Como trocar o conteúdo

Edite apenas o `content.json`. Principais campos:

| Campo | O que é |
|---|---|
| `profile` | nome, rótulo e foto de perfil (`images/perfil.jpg`) |
| `social` | links do Instagram e do TikTok (troque `SEUPERFIL`) |
| `portal.items` | cartões da seção Portal (WhatsApp, afiliados, produto) |
| `projects.items` | sites criados, com nome, endereço exibido, link e miniatura |
| `product` | cartão do produto, com o link "Entrar na lista" |
| `about` | história e os três números |
| `journey.items` | etapas da jornada |
| `footer` | copyright e link do WhatsApp |

### Placeholders para trocar

- `https://wa.me/55SEUNUMERO`: seu número do WhatsApp, com DDI e DDD (ex.: `5511999999999`). Aparece em 4 lugares do arquivo: dois cartões do Portal, o cartão do produto e o rodapé.
- `https://www.tiktok.com/@SEUPERFIL`: seu perfil do TikTok.
- `"href": "#"`: links dos afiliados. Troque pelo seu link de afiliado.
- `[TROQUE PELA HISTÓRIA REAL]` e `[TROQUE]`: textos de exemplo.
- Projetos: "Cliente exemplo" e links `#`. Troque pelo nome, pelo endereço e pelo link real.

### Imagens

Coloque os arquivos na pasta `images/` com estes nomes:

- `perfil.jpg` (foto de perfil, usada no topo e em "Quem sou eu")
- `card-1.jpg` a `card-4.jpg` (miniaturas quadradas dos cartões do Portal)
- `projeto-1.jpg`, `projeto-2.jpg` (capturas dos sites, de preferência em proporção 4:3)
- `produto.jpg` (miniatura do produto)

Se um arquivo não existir, a página mostra um bloco dourado com a letra "M" (fotos e cartões) ou um bloco cinza (projetos). Assim a página nunca fica com imagem quebrada.

## Testar no seu computador

Não abra o `index.html` com duplo clique: o navegador bloqueia a leitura do `content.json` nesse modo. Use um servidor local. Na pasta `portal`, rode:

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador.

## Hospedar no GitHub Pages

1. Crie um repositório no GitHub, por exemplo `portal`. Pode ser público.
2. Envie os arquivos da pasta `portal` para a raiz do repositório (`index.html`, `styles.css`, `script.js`, `content.json`, `images/`).
3. No repositório, vá em **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`. Clique em **Save**.
5. Em alguns minutos, o endereço aparece no topo da mesma tela, no formato `https://SEUUSUARIO.github.io/portal/`.

Para usar um domínio próprio, adicione-o na mesma tela, em **Custom domain**.

**Alternativa: Netlify.** Arraste a pasta `portal` para a área de deploy em app.netlify.com/drop. Você recebe um link na hora.

## Ao publicar

- Teste os links em um celular de verdade antes de divulgar.
- Os links de afiliado devem seguir as regras do programa de cada parceiro, incluindo a indicação de que são links de parceria (já há uma linha sobre isso na seção Portal).
