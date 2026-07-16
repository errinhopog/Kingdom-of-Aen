const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadDomain() {
    const root = path.resolve(__dirname, '..');
    const context = {};
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext([
        fs.readFileSync(path.join(root, 'js/domain/card.js'), 'utf8'),
        fs.readFileSync(path.join(root, 'js/domain/game-state.js'), 'utf8'),
        `globalThis.domain = {
            CARD_ZONES,
            GAME_SIDES,
            calculateGameScore,
            createCardDefinition,
            createCardInstance,
            createGameState,
            gameReducer
        };`
    ].join('\n'), context);
    return context.domain;
}

function makeDeck(domain, ownerId, count = 12) {
    return Array.from({ length: count }, (_, index) => {
        const partner = index === 0 ? 'Gabriel' : index === 1 ? 'Daniel' : undefined;
        const name = index === 0 ? 'Daniel' : index === 1 ? 'Gabriel' : `Unit ${index}`;
        const definition = domain.createCardDefinition({
            id: `${ownerId}_${index}`,
            name,
            type: 'melee',
            power: 2,
            ability: partner ? 'bond_partner' : undefined,
            partner
        });
        return domain.createCardInstance(definition, { ownerId });
    });
}

test('reducer executa sessão, mulligan, jogada e pontuação sem DOM', () => {
    const domain = loadDomain();
    let state = domain.createGameState();
    state = domain.gameReducer(state, {
        type: 'INITIALIZE_GAME',
        playerDeck: makeDeck(domain, 'player'),
        opponentDeck: makeDeck(domain, 'opponent')
    });

    assert.equal(state.phase, 'mulligan');
    assert.equal(state.players.player.hand.length, 10);
    assert.equal(state.players.player.deck.length, 2);
    assert.equal(state.players.player.hand[0].zone, domain.CARD_ZONES.MULLIGAN);

    const returnedId = state.players.player.hand[2].instanceId;
    state = domain.gameReducer(state, { type: 'MULLIGAN_REDRAW', handIndex: 2 });
    assert.notEqual(state.players.player.hand[2].instanceId, returnedId);
    assert.equal(state.players.player.deck.at(-1).instanceId, returnedId);
    assert.equal(state.players.player.deck.at(-1).ownerId, 'player');

    state = domain.gameReducer(state, { type: 'START_BATTLE' });
    const first = state.players.player.hand.find(card => card.name === 'Gabriel');
    const second = state.players.player.hand.find(card => card.name === 'Daniel');
    state = domain.gameReducer(state, {
        type: 'PLAY_CARD', side: 'player', instanceId: first.instanceId, row: 'melee'
    });
    state = domain.gameReducer(state, {
        type: 'PLAY_CARD', side: 'player', instanceId: second.instanceId, row: 'melee'
    });

    assert.equal(domain.calculateGameScore(state).totalPlayer, 8);
    assert.equal(state.players.player.board.melee.length, 2);
    assert.equal(Object.isFrozen(state), true);
});

test('estado pode ser serializado e recriado sem consultar document', () => {
    const domain = loadDomain();
    let state = domain.gameReducer(domain.createGameState(), {
        type: 'INITIALIZE_GAME',
        playerDeck: makeDeck(domain, 'player'),
        opponentDeck: makeDeck(domain, 'opponent')
    });
    state = domain.gameReducer(state, { type: 'START_BATTLE' });

    const snapshot = JSON.parse(JSON.stringify(state));
    assert.equal(snapshot.players.player.hand.length, 10);
    assert.equal(snapshot.players.opponent.deck.length, 2);
    assert.equal(snapshot.phase, 'battle');
});

test('domínio e decisões da IA não dependem de DOM ou dataset', () => {
    const root = path.resolve(__dirname, '..');
    ['js/domain/card.js', 'js/domain/game-state.js', 'js/core/ai.js'].forEach(relativePath => {
        const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
        assert.doesNotMatch(source, /\b(?:document|dataset)\b/, relativePath);
    });
});
