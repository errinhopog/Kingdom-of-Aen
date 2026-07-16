const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadCardModel() {
    const source = fs.readFileSync(
        path.resolve(__dirname, '../js/domain/card.js'),
        'utf8'
    );
    const context = {};
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext(`${source}\nglobalThis.cardModel = {
        CARD_ZONES,
        createCardDefinition,
        createCardInstance,
        moveCardInstance
    };`, context);
    return context.cardModel;
}

test('CardDefinition e CardInstance são imutáveis e possuem identidade única', () => {
    const model = loadCardModel();
    const definition = model.createCardDefinition({
        id: 'daniel_1',
        baseId: 'daniel',
        name: 'Daniel',
        type: 'melee',
        power: 2,
        partner: 'Gabriel',
        img: 'img/personagens/Daniel.png'
    });
    const first = model.createCardInstance(definition, { ownerId: 'player' });
    const second = model.createCardInstance(definition, { ownerId: 'player' });

    assert.equal(Object.isFrozen(definition), true);
    assert.equal(Object.isFrozen(first), true);
    assert.notEqual(first.instanceId, second.instanceId);
    assert.equal(first.definition, definition);
    assert.equal(first.definitionId, 'daniel_1');
    assert.equal(first.ownerId, 'player');
    assert.equal(first.controllerId, 'player');
});

test('transições preservam definição, identidade e ownership separando controle', () => {
    const model = loadCardModel();
    const definition = model.createCardDefinition({
        id: 'cozinheiros_1',
        baseId: 'cozinheiros',
        name: 'Cozinheiros',
        type: 'melee',
        row: 'all',
        power: 3,
        img: 'img/personagens/Cozinheiros.png',
        category: 'unit'
    });
    const deckCard = model.createCardInstance(definition, {
        instanceId: 'player:cozinheiros_1:test',
        ownerId: 'player'
    });
    const controlled = model.moveCardInstance(deckCard, {
        controllerId: 'opponent',
        currentRow: 'ranged',
        zone: model.CARD_ZONES.BOARD
    });

    assert.equal(controlled.instanceId, deckCard.instanceId);
    assert.equal(controlled.definition, definition);
    assert.equal(controlled.ownerId, 'player');
    assert.equal(controlled.controllerId, 'opponent');
    assert.equal(controlled.zone, 'board');
    assert.equal(controlled.currentRow, 'ranged');
    assert.equal(controlled.row, 'all');
    assert.equal(controlled.img, definition.img);
    assert.equal(controlled.category, definition.category);
});
