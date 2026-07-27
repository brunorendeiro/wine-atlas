# Wine Atlas

## Objetivo

Aplicação educativa client-side para descobrir regiões vinícolas e castas
próximas, consultar uma enciclopédia de castas e aprender boas práticas sobre
vinho.

## Regras

- React, TypeScript, Vite, Tailwind CSS e React Router.
- Manter a experiência mobile-first, acessível e utilizável sem conta.
- Todo o conteúdo vive em ficheiros JSON locais.
- Textos e conteúdos devem existir em português, inglês e alemão.
- Favoritos, idioma, tema e consentimento analítico ficam no `localStorage`.
- A localização é usada apenas no dispositivo e nunca é guardada.
- Google Analytics só pode carregar depois de consentimento explícito.
- Não adicionar backend nem dependências de APIs externas.

## Validação

```bash
npm run check
npm run build
```
