const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

function classList(...initial) {
    const values = new Set(initial);
    return {
        add: (...names) => names.forEach(name => values.add(name)),
        contains: name => values.has(name),
        remove: (...names) => names.forEach(name => values.delete(name))
    };
}

test('coleção e validação expõem somente as regras do MVP', () => {
    const context = { console };
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext([
        read('js/utils/helpers.js'),
        read('js/data/cards.js'),
        `globalThis.rules = { CARD_COLLECTION, validateDeck };`
    ].join('\n'), context);

    const abilities = new Set(context.rules.CARD_COLLECTION.map(card => card.ability).filter(Boolean));
    assert.deepEqual([...abilities].sort(), ['bond_partner', 'hero']);
    assert.ok(context.rules.CARD_COLLECTION.every(card => card.category === 'unit'));

    const ids = context.rules.CARD_COLLECTION.map(card => card.id);
    assert.equal(context.rules.validateDeck(ids.slice(0, 21)).valid, false);
    assert.equal(context.rules.validateDeck(ids.slice(0, 22)).valid, true);
});

test('bond_partner dobra somente parceiros presentes na mesma fileira', () => {
    const scoreElements = {
        'score-total-player': { textContent: '' },
        'score-total-opponent': { textContent: '' }
    };
    const makeCard = (name, partner) => {
        const badge = { classList: classList(), textContent: '' };
        return {
            dataset: {
                ability: 'bond_partner',
                basePower: '2',
                isHero: 'false',
                name,
                partner,
                power: '2'
            },
            querySelector: () => badge
        };
    };
    const playerCards = [makeCard('Daniel', 'Gabriel'), makeCard('Gabriel', 'Daniel')];
    const opponentCards = [makeCard('Daniel', 'Gabriel')];
    const makeRow = (cards, side) => {
        const score = { textContent: '' };
        return {
            classList: classList(side),
            querySelector: selector => selector === '.row-score' ? score : null,
            querySelectorAll: () => cards,
            score
        };
    };
    const rows = [makeRow(playerCards, 'player'), makeRow(opponentCards, 'opponent')];
    const context = {
        clearTimeout() {},
        console,
        document: {
            createElement: () => ({ classList: classList() }),
            getElementById: id => scoreElements[id],
            querySelectorAll: selector => selector === '.row' ? rows : []
        },
        setTimeout() { return 1; }
    };
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext([
        read('js/core/state.js'),
        read('js/core/engine.js'),
        `globalThis.score = updateScore;`
    ].join('\n'), context);

    assert.deepEqual({ ...context.score() }, { totalPlayer: 8, totalOpponent: 2 });
    assert.equal(playerCards[0].dataset.power, 4);
    assert.equal(opponentCards[0].dataset.power, 2);
});

test('IA prioriza parceiros e preserva cartas quando a rodada já está ganha', () => {
    let partnerOnBoard = false;
    const context = {
        console,
        document: {
            querySelector: selector => selector.includes('Gabriel') && partnerOnBoard ? {} : null,
            querySelectorAll: () => Array(5).fill({})
        }
    };
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext([
        `let enemyHand = []; let playerPassed = false;`,
        read('js/core/ai.js'),
        `globalThis.ai = {
            getCardPriority,
            shouldEnemyPass,
            setHand: cards => { enemyHand = cards; },
            setPlayerPassed: value => { playerPassed = value; }
        };`
    ].join('\n'), context);

    context.ai.setHand([
        { name: 'Gabriel', power: 2 },
        { name: 'Daniel', power: 2, ability: 'bond_partner', partner: 'Gabriel' }
    ]);
    assert.equal(context.ai.getCardPriority({ power: 2, ability: 'bond_partner', partner: 'Gabriel' }), 22);

    partnerOnBoard = true;
    assert.equal(context.ai.getCardPriority({ power: 2, ability: 'bond_partner', partner: 'Gabriel' }), 102);

    context.ai.setPlayerPassed(true);
    assert.equal(context.ai.shouldEnemyPass({ totalOpponent: 8, totalPlayer: 7 }), true);
});
