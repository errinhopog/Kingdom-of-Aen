# Kingdom of Aen

Kingdom of Aen e um jogo de cartas tatico inspirado em duelos por fileiras, com deck builder, mulligan, efeitos de cartas, lideres e uma IA simples para o oponente.

O projeto e uma aplicacao web estatica feita com HTML, CSS e JavaScript puro. Nao ha etapa de build, bundler ou framework no estado atual.

## Estado Atual

- Deck builder com persistencia em `localStorage`.
- Colecao com 43 cartas: 39 unidades e 4 especiais.
- 4 lideres com habilidades proprias.
- Partida em melhor de 3 rodadas.
- Tabuleiro com fileiras `melee`, `ranged` e `siege`.
- IA baseada em prioridades para passar, usar lideres, jogar combos, medicos, espiões e espantalhos.
- Audio de fundo e efeitos sonoros locais.

## Como Rodar

Opcao simples:

```powershell
Start-Process .\index.html
```

Opcao recomendada para simular melhor um ambiente web:

```powershell
python -m http.server 8080
```

Depois abra:

```text
http://localhost:8080
```

## Como Jogar

1. Monte um deck no deck builder.
2. O deck precisa ter pelo menos 22 unidades e no maximo 10 especiais.
3. Inicie a batalha e troque ate 2 cartas no mulligan.
4. Jogue cartas nas fileiras corretas ou passe a rodada.
5. Vence a rodada quem tiver a maior pontuacao total no tabuleiro.
6. Vence a partida quem ganhar 2 rodadas.

## Estrutura

```text
.
|-- index.html
|-- css/
|   `-- style.css
|-- js/
|   |-- core/
|   |-- data/
|   |-- ui/
|   |-- utils/
|   |-- deckbuilder.js
|   `-- main.js
|-- img/
|-- audio/
`-- docs/
```

## Documentacao

- [Arquitetura](docs/ARCHITECTURE.md)
- [Regras e Sistemas](docs/GAME_RULES.md)
- [Guia de Desenvolvimento](docs/DEVELOPMENT.md)
- [Assets](docs/ASSETS.md)
- [Melhorias Recomendadas](docs/IMPROVEMENTS.md)
- [Plano de Sprints](docs/SPRINTS.md)

## Observacoes Importantes

Cartas sem arte cadastrada usam o visual de fallback do proprio componente. Nenhum caminho de imagem inexistente deve ser mantido nos dados; as convencoes e a lista de artes disponiveis estao em [Assets](docs/ASSETS.md).

Algumas habilidades ja estao implementadas no motor, mas ainda nao existem cartas usando elas na colecao atual. Isso esta documentado em [Regras e Sistemas](docs/GAME_RULES.md) e ajuda a orientar a proxima fase de expansao.

## Autoria

Desenvolvido por Pedro Braga e Ramon.
