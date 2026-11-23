# Desentope Já — Desentupidora 24h (SP e ABC)

Site estático em Astro, baseado na estrutura do site da Dutra Hidráulica, com o visual do logo (preto, amarelo, vermelho e cromado).

## Onde mudar cada coisa

| O quê | Arquivo |
|---|---|
| Nome, telefone/WhatsApp, domínio, ID do Google Tag Manager | `src/data/site.ts` |
| Serviços (textos, FAQ) | `src/data/servicos.ts` |
| Bairros e cidades atendidos | `src/data/bairros.ts` |
| Texto das fotos | `src/data/fotos.ts` |
| Cores e visual | `src/styles/global.css` |
| Artigos do blog | `src/content/blog/` |

## Fotos

Suba as fotos reais em `fotos/<serviço>/`. No próximo build elas entram no site já otimizadas
(card do serviço, página do serviço e galeria "Trabalhos realizados").

## Comandos

```bash
npm install
npm run dev      # ver no navegador
npm run build    # gerar o site em dist/
```
