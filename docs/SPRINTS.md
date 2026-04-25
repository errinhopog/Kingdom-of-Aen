# Plano de Sprints

Este plano transforma `docs/IMPROVEMENTS.md` em entregas menores. A ideia e estabilizar primeiro, depois melhorar experiencia e so entao fazer refatores maiores.

## Sprint 1 - Estabilizacao da Base

Objetivo: corrigir inconsistencias simples que podem virar bugs enquanto o jogo cresce.

Tasks:

- [x] Criar plano de sprints e tasks.
- [x] Corrigir `createDefaultDeck()` para usar `category === 'unit'`.
- [x] Remover duplicacao de `shuffleArray()`.
- [x] Alinhar a logica de especiais one-shot para usar `category`, nao `kind`.
- [x] Mostrar imagens reais no deck builder quando `card.img` existir.
- [x] Adicionar script de validacao de dados/assets.

## Sprint 2 - Assets e Conteudo Jogavel

Objetivo: reduzir placeholders e tornar a colecao mais consistente visualmente.

Tasks:

- [ ] Decidir estrategia para `assets/*.png`: criar pasta, migrar caminhos ou substituir por imagens existentes.
- [ ] Criar placeholders oficiais para cartas sem arte.
- [ ] Associar artes existentes nao usadas a cartas futuras ou remover sobras.
- [ ] Documentar convencao final de nomes de arquivos.
- [ ] Validar audio duplicado e decidir se `Medieval_Way__Knight_Mix_Original - Copia.mp3` fica ou sai.

## Sprint 3 - Habilidades e Balanceamento

Objetivo: fechar o contrato das habilidades implementadas e planejar expansao de cartas.

Tasks:

- [ ] Decidir se `weather_*`, `scorch`, `spy` e `tight_bond` entram na colecao atual.
- [ ] Criar cartas de teste para habilidades ja implementadas.
- [ ] Revisar regras de cemiterio para cartas especiais e cartas revividas.
- [ ] Criar documento inicial de balanceamento.
- [ ] Revisar prioridades da IA apos novas cartas.

## Sprint 4 - Qualidade e Testes

Objetivo: criar seguranca para mexer no motor sem quebrar fluxo basico.

Tasks:

- [ ] Extrair validacao de deck para funcoes mais testaveis.
- [ ] Adicionar testes para composicao e validacao de deck.
- [ ] Adicionar testes para dados da colecao.
- [ ] Criar flag `DEBUG` para logs de desenvolvimento.
- [ ] Criar checklist de release manual.

## Sprint 5 - Arquitetura e Acessibilidade

Objetivo: preparar o projeto para crescer sem depender tanto de globais e drag and drop.

Tasks:

- [ ] Planejar migracao gradual para ES Modules.
- [ ] Separar dados de cartas, lideres e regras em arquivos menores.
- [ ] Adicionar alternativa por clique para jogar carta.
- [ ] Melhorar estados de foco e labels acessiveis.
- [ ] Revisar layout responsivo do deck builder e da batalha.
