# Assets

Este documento registra os assets usados e as lacunas encontradas na revisao atual.

## Estrutura Atual

```text
audio/
assets/
img/
├── icons/
└── personagens/
```

A pasta `assets/` contem as novas ilustracoes geradas para as cartas e lideres que antes usavam fallback.

## Imagens Existentes

Icones:

- `img/icons/icon-melee.png`
- `img/icons/icon-ranged.png`
- `img/icons/icon-siege.png`

Personagens referenciados por cartas e encontrados:

- `img/personagens/Adriano.png`
- `img/personagens/Corredores.png`
- `img/personagens/Cozinheiros.png`
- `img/personagens/Daniel.png`
- `img/personagens/Espantalho.png`
- `img/personagens/Gabriel.png`
- `img/personagens/Geleia.png`
- `img/personagens/Suelly.png`
- `img/personagens/Thiago.png`
- `img/personagens/Wellington.png`

Personagens existentes, mas ainda nao referenciados diretamente na colecao atual:

- `img/personagens/Ana Rita.png`
- `img/personagens/Carol.png`
- `img/personagens/Ciça.png`
- `img/personagens/Marco.png`
- `img/personagens/Paty.png`
- `img/personagens/Renata.png`

## Ilustracoes Adicionadas

As 15 imagens abaixo resolvem 26 referencias do catalogo, pois varias cartas compartilham a mesma arte:

- `assets/anderson.png`
- `assets/clarice.png`
- `assets/eliel.png`
- `assets/jacy.png`
- `assets/jassyhara.png`
- `assets/kariel.png`
- `assets/leader_archmage.png`
- `assets/leader_general.png`
- `assets/leader_usurper.png`
- `assets/leader_warlord.png`
- `assets/marcelo.png`
- `assets/marcus.png`
- `assets/pattenberg.png`
- `assets/ritatril.png`
- `assets/vanessa.png`

## Audio

Audios usados pelo `AudioManager`:

- `audio/card-place-1.ogg`
- `audio/card-place-2.ogg`
- `audio/card-place-3.ogg`
- `audio/card-place-4.ogg`
- `audio/card-slide-1.ogg`
- `audio/card-slide-2.ogg`
- `audio/card-fan-1.ogg`
- `audio/card-fan-2.ogg`
- `audio/card-shuffle.ogg`
- `audio/dice-throw-3.ogg`
- `audio/die-throw-3.ogg`
- `audio/switch4.ogg`
- `audio/mouseclick1.ogg`
- `audio/card-shove-1.ogg`
- `audio/music_bg.mp3`

Tambem existe:

- `audio/Medieval_Way__Knight_Mix_Original - Copia.mp3`

Esse arquivo parece ser uma copia da musica de fundo e pode ser removido ou documentado como alternativa, se a duplicacao for intencional.

## Convencoes Recomendadas

- Manter `assets/` para as artes novas ja referenciadas pelo catalogo e `img/personagens/` para o acervo original.
- Usar `img/icons/` para icones de fileira e UI.
- Preferir nomes sem acentos em novos arquivos para reduzir risco em sistemas diferentes.
- Manter o caminho do `img` igual ao valor usado em `CARD_COLLECTION`.
- Ao renomear uma imagem, atualizar `js/data/cards.js` na mesma mudanca.
