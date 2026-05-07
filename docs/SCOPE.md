# Escopo - Kingdom of Aen

Este documento define o que **e** e o que **nao e** Kingdom of Aen, dentro do escopo planejado pelo time. Serve como filtro de decisao quando aparecer uma ideia nova: se nao se encaixa aqui, vira backlog ou e descartada.

## 1. Visao em Uma Frase

Um jogo de cartas tatico de navegador, inspirado em Gwent (The Witcher 3), onde dois jogadores disputam uma melhor de 3 rodadas usando decks personalizados, fileiras de combate e habilidades especiais.

## 2. Pilares do Produto

Tres pilares orientam todas as decisoes de design:

1. **Tatico, nao reflexo.** O jogo recompensa planejamento e gestao de recursos (cartas na mao, vitorias acumuladas) em vez de reflexos rapidos.
2. **Acessivel pelo navegador.** Jogador entra pelo browser, sem instalar nada. Mobile e bem-vindo, mas o foco primario e desktop.
3. **Tematica propria.** A ambientacao e inspirada em Gwent, mas o universo, faccoes, lideres e personagens sao originais (Alfredolandia, Reinos Sombrios, Torre Arcana, Horda Selvagem).

## 3. Publico-Alvo

- Jogadores casuais que gostam de cartas tipo Gwent, Hearthstone, Slay the Spire.
- Amigos do circulo proximo dos autores (a colecao tem personagens com nomes reais como homenagem).
- Curiosos por jogos web leves, sem login, sem download.

## 4. MVP (Minimo Produto Viavel)

O MVP atual ja existe em codigo. Esta listado aqui para servir de baseline de regressao:

- [x] Deck Builder com filtros, validacao e persistencia local.
- [x] Mulligan com ate 2 trocas.
- [x] Tabuleiro com 3 fileiras por lado, mais cartas agile.
- [x] Pontuacao automatica com clima, vinculo, vinculo por parceiro e boost de lider.
- [x] Habilidades: `bond_partner`, `medic`, `spy_medic`, `decoy`, `hero`.
- [x] Habilidades implementadas mas sem cartas na colecao atual: `tight_bond`, `spy`, `scorch`, `weather_frost`, `weather_fog`, `weather_rain`, `weather_clear`.
- [x] 4 lideres com habilidades distintas.
- [x] IA por prioridades (passa, joga combos, usa lider, evita fogo amigo).
- [x] Audio com mute persistido.
- [x] Modal de fim de jogo, gemas de vitoria, animacoes basicas.
- [x] Validador de dados em `scripts/validate-project.js`.

## 5. Dentro do Escopo (Caminho ate 1.0)

Esses itens estao **dentro** da visao do produto, com prioridades em [ROADMAP.md](ROADMAP.md):

### 5.1. Conteudo

- Completar arte de todas as cartas (eliminar fallbacks).
- Cartas para as habilidades ja implementadas (`scorch`, `weather_*`, `spy`, `tight_bond`).
- Mais lideres (no minimo 1 por faccao planejada).
- Faccoes com passivas distintas (hoje so `alfredolandia` esta implementada).

### 5.2. Modos de Jogo

- **Single-player vs IA** (existe).
- **Multiplayer local** (hot-seat no mesmo navegador, com tela de "passe o controle"). E o caminho mais barato para validar PvP antes de servidor.
- **Multiplayer online** entre dois jogadores remotos (PvP 1v1). E o destino final do jogo. Ver [MULTIPLAYER.md](MULTIPLAYER.md).

### 5.3. Experiencia do Jogador

- Tutorial inicial curto (uma partida guiada explicando regras basicas).
- Acessibilidade: jogar carta com clique alem do drag-and-drop, foco visivel, atalhos de teclado.
- Responsivo: layout decente em telas pequenas (tablet e celular em paisagem).
- Feedback visual e sonoro consistente em todos os efeitos (clima, scorch, decoy, etc.).

### 5.4. Qualidade

- Migracao gradual para ES Modules e build step (Vite ou similar).
- Testes automatizados de funcoes puras (validacao de deck, calculo de pontuacao, prioridades da IA).
- Flag `DEBUG` para reduzir ruido de console em producao.
- Validador de dados rodando no CI.

## 6. Fora de Escopo

Esses itens **nao** sao Kingdom of Aen. Mesmo que parecam tentadores, recusar evita inflar o projeto.

- **Mundo aberto, RPG, exploracao.** O jogo e exclusivamente de duelo de cartas em mesa.
- **Macroprogressao tipo MMORPG** (XP, leveling de personagem, equipamentos). Nao ha meta-game pesado planejado.
- **Loot boxes, gacha, monetizacao real.** O projeto e gratuito e sem moeda paga.
- **PvE longo (campanha com dezenas de horas).** Pode existir uma campanha curta como tutorial, mas nao e o foco.
- **Suporte oficial a mais de 2 jogadores na mesma partida.** O design e estritamente 1v1.
- **App nativo (iOS, Android, Steam).** Deve continuar sendo um jogo de navegador. PWA e aceitavel se for barato.
- **Editor publico de cartas customizadas.** A colecao e curada pelos autores.
- **Sistema de chat livre entre jogadores.** Pode haver emotes pre-definidos, mas nao chat aberto (custo de moderacao alto demais para o projeto).
- **Compatibilidade com IE/navegadores legados.** Foco em navegadores modernos (ultimos 2 anos).

## 7. Restricoes Tecnicas Auto-Impostas

Sao escolhas conscientes para manter o projeto pequeno e divertido de manter:

- Codigo continua em JavaScript puro ate ser justificado o contrario (online, testes, mobile).
- Sem dependencias pesadas (React, Vue, Angular). Bibliotecas pequenas e bem escolhidas sao bem-vindas.
- Hospedagem deve ser barata ou gratuita (GitHub Pages, Vercel, Netlify). Para online, backend leve (Node + Cloudflare Workers, Supabase realtime, ou similar).
- Nao salvar dados sensiveis. Sem login completo no MVP online (so um nickname).

## 8. Criterios de Sucesso

Como saberemos que o jogo "esta pronto"? Tres niveis:

1. **MVP estavel:** rodar uma partida completa contra a IA sem bugs visiveis em todos os navegadores modernos.
2. **Conteudo completo:** todas as cartas com arte, todas as habilidades com ao menos uma carta na colecao, todas as faccoes com passiva.
3. **Online jogavel:** dois amigos conseguem entrar em uma sala pelo navegador, jogar uma partida ate o fim sem desincronizar e ver o resultado.

Atingir os tres = versao 1.0. O que vem depois vira backlog de pos-1.0.

## 9. Glossario Curto

- **Fileira:** linha do tabuleiro onde a carta e colocada (`melee`, `ranged`, `siege`).
- **Agile:** carta que pode ser jogada em qualquer fileira valida (`row: "all"`).
- **Heroi:** carta imune a clima e a scorch (`isHero: true`).
- **Especial:** carta de feitico ou efeito (`category: "special"`); contagem maxima 10 por deck.
- **Mulligan:** fase inicial onde o jogador pode trocar ate 2 cartas da mao.
- **Decoy / Espantalho:** especial que troca com uma unidade do proprio lado e devolve essa unidade para a mao.
- **Bond:** vinculo. Pode ser por nome (`tight_bond`) ou por parceiro (`bond_partner`).
- **Faccao:** tema do deck. Define lider e passiva. Hoje so `alfredolandia` esta implementada como passiva.
