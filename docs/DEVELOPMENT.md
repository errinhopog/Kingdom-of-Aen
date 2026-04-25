# Guia de Desenvolvimento

Este projeto atualmente nao usa framework, bundler ou dependencias de npm. A aplicacao depende da ordem de scripts em `index.html` e de variaveis globais.

## Rodando Localmente

Abrir diretamente:

```powershell
Start-Process .\index.html
```

Com servidor local:

```powershell
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Onde Mexer

| Tarefa | Arquivos principais |
| --- | --- |
| Adicionar cartas | `js/data/cards.js` |
| Ajustar regra de deck | `js/data/cards.js`, `js/deckbuilder.js` |
| Criar habilidade | `js/core/abilities.js`, `js/utils/helpers.js`, `js/core/ai.js` |
| Ajustar IA | `js/core/ai.js` |
| Ajustar pontuacao | `js/core/engine.js` |
| Ajustar visual das cartas | `js/ui/render.js`, `css/style.css` |
| Ajustar deck builder | `js/deckbuilder.js`, `css/style.css` |
| Ajustar audio | `js/core/audio.js`, `audio/` |

## Adicionando uma Carta

1. Adicione um objeto em `CARD_COLLECTION`.
2. Use um `id` unico para cada copia.
3. Use o mesmo `baseId` para copias da mesma carta.
4. Confirme que `type` e `category` estao corretos.
5. Se tiver arte, coloque a imagem em `img/personagens/` ou atualize o caminho.
6. Se usar habilidade nova, adicione a descricao em `ABILITY_DESCRIPTIONS`.
7. Teste no deck builder, no mulligan e no tabuleiro.

Exemplo:

```js
{
  id: 'nova_carta_1',
  baseId: 'nova_carta',
  name: 'Nova Carta',
  type: 'melee',
  power: 4,
  img: 'img/personagens/Nova Carta.png',
  ability: 'bond_partner',
  partner: 'Outra Carta',
  category: 'unit'
}
```

## Adicionando uma Habilidade

1. Defina o identificador da habilidade no objeto da carta.
2. Adicione uma descricao em `ABILITY_DESCRIPTIONS`.
3. Adicione um `case` em `triggerAbility()`.
4. Implemente a funcao em `js/core/abilities.js`.
5. Se a IA puder usar essa habilidade, inclua a prioridade em `js/core/ai.js`.
6. Garanta que `updateScore()` reflita qualquer efeito persistente.

## Checklist Manual de Teste

Antes de considerar uma alteracao pronta:

- O deck builder abre sem erro no console.
- Filtros de colecao funcionam.
- O deck salva e recarrega ao atualizar a pagina.
- A validacao impede iniciar com deck invalido.
- O mulligan permite no maximo 2 trocas.
- Cartas so entram em fileiras validas.
- Espantalho troca com alvo valido e volta a carta para a mao.
- O botao de passar encerra a rodada quando os dois lados passam.
- O placar e as gemas atualizam corretamente.
- O modal final aparece ao atingir 2 vitorias.
- O botao de audio alterna mute sem quebrar a partida.

## Validacao Automatizada

Rode o validador para conferir dados, referencias de assets e audios:

```powershell
node .\scripts\validate-project.js
```

Para tratar avisos como erro:

```powershell
node .\scripts\validate-project.js --strict
```

## Debug Util

Limpar deck salvo:

```js
localStorage.removeItem('kingdomOfAen_playerDeck')
```

Limpar mute salvo:

```js
localStorage.removeItem('audioMuted')
```

Ver deck salvo:

```js
JSON.parse(localStorage.getItem('kingdomOfAen_playerDeck') || '[]')
```

## Cuidados

- Nao altere a ordem dos scripts sem migrar para ES Modules ou outro sistema de modulos.
- Evite criar novas globais quando uma funcao existente ja cobre o fluxo.
- Sempre verifique caminhos de imagens e audios.
- Se uma carta especial deve ser removida apos uso, alinhe `category`, `kind` e a logica de drop antes.
- Se uma regra muda a pontuacao, revise `updateScore()`.
