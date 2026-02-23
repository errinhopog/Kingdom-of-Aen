# ⚔️ Kingdom of Aen (KoA)

> *Estratégia, Fileiras e Conquista.*

**Kingdom of Aen** é um jogo de cartas de estratégia (TCG/CCG) com temática de fantasia medieval. O projeto consiste na digitalização e evolução de um jogo de cartas físico originalmente criado e impresso manualmente, agora portado para uma experiência web interativa.

## 🎮 Sobre o Projeto

O jogo foca em duelos táticos onde o posicionamento é tão importante quanto o poder da carta. Inspirado em clássicos como *Gwent*, o objetivo é vencer rodadas através da gestão inteligente de recursos e blefes.

O nome **"Aen"** é uma homenagem às iniciais da instituição onde o conceito original nasceu (A.E.N.), recontextualizada aqui como um antigo reino de fantasia.

## ✅ Funcionalidades Implementadas

- [x] **Digitalização:** Acervo de ~35 cartas convertido para JavaScript
- [x] **Core Engine:** Lógica completa de duelo, pontuação e turnos
- [x] **Interface (UI):** Tabuleiro interativo com drag & drop
- [x] **Deck Builder:** Tela de montagem de deck com filtros e validação
- [x] **Mulligan:** Fase de troca de cartas antes da batalha
- [x] **Inteligência Artificial:** Oponente com sistema de prioridades
- [x] **Sistema de Líderes:** 4 líderes com habilidades únicas
- [x] **Áudio:** Música de fundo + SFX com variações
- [x] **Responsividade:** Media queries para desktop, tablet e mobile
- [x] **Testes:** Jest + testes automatizados (cards + engine)
- [ ] **Algoritmo de Raridade:** Sistema baseado na frequência de impressão
- [ ] **Multiplayer:** Duelo via WebSocket
- [ ] **PWA:** Service Worker para offline

## 🛠️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **HTML5 / CSS3 / JavaScript** | Stack principal (100% vanilla) |
| **LocalStorage** | Persistência de deck e preferências |
| **Audio API** | Música e efeitos sonoros |
| **Jest** | Testes automatizados |

## 🃏 Como Jogar

1. **Monte seu Deck** — Selecione cartas da coleção no Deck Builder (mín. 22 unidades)
2. **Mulligan** — Troque até 2 cartas da mão inicial
3. **Batalha** — Arraste cartas para as fileiras (Melee ⚔️ / Ranged 🏹 / Siege 🏰)
4. **Estratégia** — Use habilidades (Espião, Médico, Scorch) e saiba quando passar
5. **Vitória** — Vença 2 de 3 rodadas!

## 🚀 Como Rodar

```bash
# Opção 1: Abra index.html diretamente no navegador

# Opção 2: Servidor local
npm run dev

# Rodar testes
npm install
npm test
```

## 📖 Documentação

Veja [contexto.md](contexto.md) para documentação técnica completa, incluindo checklist de 96 funções, arquitetura e histórico de melhorias.

## 🤝 Contribuição

Este é um projeto pessoal de portfólio em desenvolvimento ativo. Sugestões sobre balanceamento e lógica de jogo são bem-vindas!

---
*Desenvolvido por Pedro Braga e Ramon*
