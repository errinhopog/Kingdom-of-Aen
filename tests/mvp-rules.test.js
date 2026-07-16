const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('coleção e validação expõem somente as regras do MVP', () => {
    const context = { console };
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext([
        read('js/utils/helpers.js'),
        read('js/domain/card.js'),
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

test('fim de rodada não mantém transições de cemitério sem consumidor', () => {
    const lifecycleSource = `${read('js/core/state.js')}\n${read('js/core/engine.js')}`;
    assert.doesNotMatch(lifecycleSource, /playerGraveyard|enemyGraveyard/);
});

test('bond_partner dobra somente parceiros presentes na mesma fileira', () => {
    const context = {};
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext([
        read('js/domain/card.js'),
        read('js/domain/game-state.js'),
        `globalThis.rowScore = calculateRowScore;`
    ].join('\n'), context);

    const daniel = { name: 'Daniel', partner: 'Gabriel', ability: 'bond_partner', power: 2 };
    const gabriel = { name: 'Gabriel', partner: 'Daniel', ability: 'bond_partner', power: 2 };
    assert.equal(context.rowScore([daniel, gabriel]), 8);
    assert.equal(context.rowScore([daniel]), 2);
});

test('IA prioriza parceiros e preserva cartas quando a rodada já está ganha', () => {
    const emptyBoard = () => ({ melee: [], ranged: [], siege: [] });
    const makeState = ({ partnerOnBoard = false, playerPassed = false } = {}) => ({
        players: {
            player: { hand: Array(5).fill({}), board: emptyBoard(), passed: playerPassed },
            opponent: {
                hand: [
                    { name: 'Gabriel', power: 2 },
                    { name: 'Daniel', power: 2, ability: 'bond_partner', partner: 'Gabriel' }
                ],
                board: { ...emptyBoard(), melee: partnerOnBoard ? [{ name: 'Gabriel' }] : [] },
                passed: false
            }
        }
    });
    const context = { console, gameState: makeState() };
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext([
        `const GAME_ROWS = ['melee', 'ranged', 'siege'];`,
        read('js/core/ai.js'),
        `globalThis.ai = {
            getCardPriority,
            shouldEnemyPass
        };`
    ].join('\n'), context);

    const card = { power: 2, ability: 'bond_partner', partner: 'Gabriel' };
    assert.equal(context.ai.getCardPriority(card, makeState()), 22);
    assert.equal(context.ai.getCardPriority(card, makeState({ partnerOnBoard: true })), 102);
    assert.equal(context.ai.shouldEnemyPass(
        { totalOpponent: 8, totalPlayer: 7 },
        makeState({ playerPassed: true })
    ), true);
});
