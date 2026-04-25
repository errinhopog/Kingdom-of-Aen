# Melhorias Recomendadas

Esta lista foi criada a partir da leitura dos arquivos do projeto em 2026-04-24. Ela prioriza melhorias que reduzem bugs, facilitam expansao e deixam o jogo mais consistente.

## Prioridade Alta

### Corrigir referencias de imagens ausentes

Varias cartas e todos os lideres apontam para `assets/*.png`, mas essa pasta nao existe. Opcoes:

- Mover as imagens esperadas para `assets/`.
- Atualizar `CARD_COLLECTION` para usar imagens ja existentes em `img/personagens/`.
- Criar placeholders oficiais para cartas sem arte.

Impacto: cartas aparecem sem arte real durante a batalha.

### Alinhar `category`, `type` e `kind`

Hoje as cartas usam `category: 'unit' | 'special'`, mas a logica de drop verifica `card.dataset.kind === 'special'`. Como `createCardElement()` define `dataset.category`, essa regra nao dispara.

Sugestao: usar apenas `category` como fonte de verdade ou definir `dataset.kind` explicitamente por compatibilidade.

### Corrigir `createDefaultDeck()`

`createDefaultDeck()` usa `card.type === 'unit'`, mas o dado correto e `card.category === 'unit'`. A funcao provavelmente retornaria um deck vazio se fosse chamada.

### Remover duplicacao de `shuffleArray()`

`shuffleArray()` existe em `js/utils/helpers.js` e em `js/data/cards.js`. Como os scripts rodam no escopo global, isso pode gerar confusao sobre qual versao esta ativa.

Sugestao: manter a funcao apenas em `helpers.js`.

## Prioridade Media

### Mostrar imagens reais no deck builder

`createBuilderCard()` cria um placeholder visual, mas nao usa `card.img` como background. A batalha e o mulligan ja usam imagem de carta.

Impacto: a colecao fica menos clara para o jogador.

### Separar dados de regras

`js/data/cards.js` contem dados, validacao, busca e shuffle. Seria melhor separar:

- dados de cartas;
- dados de lideres;
- validacao de deck;
- helpers de colecao.

Isso facilita adicionar expansoes e testes.

### Criar uma validacao automatica de assets

Um script simples poderia conferir:

- todo `img` referenciado por carta existe;
- todo audio referenciado pelo `AudioManager` existe;
- toda habilidade usada por carta tem descricao;
- todo parceiro de `bond_partner` existe na colecao.

### Reduzir logs de debug em producao

Ha varios `console.debug()` e mensagens com `[DEBUG]`. Eles sao uteis durante desenvolvimento, mas podem poluir o console do jogador.

Sugestao: criar uma flag global `DEBUG = true/false`.

### Formalizar habilidades planejadas

O motor ja tem `weather_*`, `scorch`, `spy` e `tight_bond`, mas a colecao atual nao possui cartas para essas habilidades.

Sugestao: decidir se entram na proxima expansao ou se devem ser removidas ate serem usadas.

## Prioridade Baixa

### Migrar para ES Modules

Trocar scripts globais por `type="module"` ajudaria a:

- declarar dependencias explicitamente;
- evitar colisao de nomes globais;
- testar funcoes isoladas;
- crescer o codigo com menos fragilidade.

### Adicionar testes automatizados

Comecar por funcoes puras:

- validacao de deck;
- contagem de composicao;
- calculo de prioridade da IA, se extraido;
- resolucao de habilidades, se desacoplada do DOM.

### Melhorar acessibilidade

Hoje a interacao principal depende de drag and drop. Melhorias possiveis:

- alternativa por clique para jogar carta;
- labels melhores em botoes de icone;
- estados de foco visiveis;
- suporte basico a teclado.

### Revisar responsividade

O CSS tem bastante trabalho para desktop, mas a experiencia em telas pequenas provavelmente precisa de uma versao propria:

- deck builder com paineis empilhados;
- mao do jogador com rolagem mais confortavel;
- placar compacto;
- cartas com tamanho adaptativo.

### Documentar balanceamento

Criar um documento futuro para:

- custo/poder esperado por fileira;
- limite de copias por raridade;
- peso das habilidades;
- criterios para cartas heroicas;
- curva ideal do deck inicial.
