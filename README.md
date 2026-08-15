# Wine Atlas

O Wine Atlas é uma aplicação web educativa, mobile-first, para descobrir o
mundo do vinho sem complicações. Ajuda a encontrar regiões vinícolas próximas,
conhecer as castas que lhes dão identidade e aprender a provar, servir,
harmonizar e conservar vinho.

> A multilingual, privacy-friendly guide to wine regions, grape varieties and
> tasting.

**Aplicação:** [wine-atlas-eta.vercel.app](https://wine-atlas-eta.vercel.app)

## O que já é possível fazer

- Explorar regiões vinícolas de vários países e conhecer os seus estilos,
  castas, clima, gastronomia e curiosidades.
- Ver cada região num mapa interativo real (OpenStreetMap), com zoom e
  regiões vizinhas assinaladas.
- Descobrir regiões e castas próximas através da localização do dispositivo.
- Consultar uma enciclopédia de castas com aromas, estrutura, origem,
  harmonizações e nomes regionais.
- Pesquisar conteúdos em toda a aplicação.
- Guardar regiões e castas favoritas sem criar conta.
- Seguir um guia prático para provar vinho como um sommelier.
- Explorar uma roda de aromas interativa.
- Aprender com guias sobre serviço, copos, harmonização, decantação,
  conservação, rótulos e defeitos do vinho.
- Alternar entre português, inglês e alemão.
- Escolher um tema claro inspirado em vinho branco ou um tema escuro inspirado
  em vinho tinto.

## Privacidade

O Wine Atlas foi desenhado para funcionar sem conta. Todo o conteúdo
principal está incluído na própria aplicação; o backend é apenas um conjunto
mínimo de endpoints de leitura (ver abaixo), sem contas de utilizador nem
dados pessoais guardados no servidor.

- A localização é processada apenas no dispositivo e nunca é guardada.
- Favoritos, idioma, tema e consentimento analítico ficam no `localStorage`.
- O Google Analytics só pode ser carregado após consentimento explícito.
- O mapa de cada região carrega tiles do [OpenStreetMap](https://www.openstreetmap.org/copyright)
  (pedido direto ao servidor deles ao ver a página de uma região, sem chave de API).

## API de dados

Além da aplicação, os dados de regiões e castas estão disponíveis como
endpoints públicos, pensados para poderem ser reutilizados noutras
aplicações:

- `GET /api/regions` — lista todas as regiões (filtros: `?country=CH`, `?featured=true`)
- `GET /api/regions/:id` — detalhe de uma região
- `GET /api/grapes` — lista todas as castas (filtros: `?type=red`, `?region=valais`, `?heritage=native`)
- `GET /api/grapes/:id` — detalhe de uma casta

CORS aberto, sem autenticação. Implementados como Vercel Serverless
Functions em `api/`.

## Ideias para o futuro

O projeto poderá evoluir em várias direções:

- Aumentar o atlas com mais regiões, castas autóctones e traduções revistas.
- Criar percursos guiados por regiões vinícolas no mapa.
- Permitir comparar castas, regiões e estilos de vinho lado a lado.
- Adicionar um caderno de provas privado, guardado localmente no dispositivo.
- Criar sugestões de harmonização a partir de pratos e ingredientes.
- Introduzir quizzes e percursos de aprendizagem para diferentes níveis.
- Melhorar a experiência offline e instalar a aplicação como PWA.
- Tornar os conteúdos mais acessíveis com ilustrações, áudio e glossário.

Estas ideias são um roadmap aberto e não representam funcionalidades já
disponíveis.

## Tecnologia

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Leaflet + React Leaflet (mapa, com tiles do OpenStreetMap)
- Conteúdo local em JSON
- Vercel (hosting + Serverless Functions para a API)

## Desenvolvimento local

Requer uma versão recente do Node.js.

```bash
git clone https://github.com/brunorendeiro/wine-atlas.git
cd wine-atlas
npm install
npm run dev
```

## Validação e build

```bash
npm run check
npm run build
```

## Estrutura do projeto

```text
api/             # Endpoints públicos (Vercel Serverless Functions)
src/
├── components/  # Componentes de interface reutilizáveis
├── context/     # Idioma, tema, favoritos e localização
├── data/        # Regiões, castas e conteúdos editoriais
├── lib/         # Pesquisa, dados, localização, SEO e analytics
└── pages/       # Um módulo lazy-loaded por página/rota
```

## Licença

Ainda não foi definida uma licença para reutilização do código ou dos
conteúdos.
