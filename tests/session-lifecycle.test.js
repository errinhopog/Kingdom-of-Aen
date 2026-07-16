const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createClassList(initial = []) {
    const values = new Set(initial);
    return {
        add: (...names) => names.forEach(name => values.add(name)),
        contains: name => values.has(name),
        remove: (...names) => names.forEach(name => values.delete(name))
    };
}

function createElement({ classes = [], innerHTML = 'content', textContent = '9' } = {}) {
    return {
        classList: createClassList(classes),
        disabled: true,
        innerHTML,
        remove() { this.removed = true; },
        removed: false,
        textContent
    };
}

function loadLifecycleHarness() {
    const root = path.resolve(__dirname, '..');
    const containers = [createElement(), createElement(), createElement()];
    const gems = [createElement({ classes: ['active'] }), createElement({ classes: ['active'] })];
    const visualElements = [
        createElement({ classes: ['passed', 'active-turn', 'weather-active-frost'] }),
        createElement({ classes: ['drag-over', 'weather-active-rain'] })
    ];
    const toast = createElement();
    const elementsById = {
        'mulligan-overlay': createElement(),
        'game-over-modal': createElement(),
        'pass-button': createElement(),
        'score-total-player': createElement(),
        'score-total-opponent': createElement(),
        'enemy-hand-count': createElement(),
        'player-deck-count': createElement()
    };

    const selectors = new Map([
        ['.row .cards-container, .hand-cards, #mulligan-cards', containers],
        ['.gem', gems],
        ['.row, .player-side, .opponent-side', visualElements],
        ['.round-toast', [toast]]
    ]);

    let nextTimerId = 1;
    const clearedTimers = [];
    const audio = { stopped: false, stopMusic() { this.stopped = true; } };
    const context = {
        audioManager: audio,
        clearTimeout(timerId) { clearedTimers.push(timerId); },
        console,
        document: {
            getElementById: id => elementsById[id] || null,
            querySelectorAll: selector => selectors.get(selector) || []
        },
        setTimeout() { return nextTimerId++; },
        updateLeaderVisuals() {}
    };
    context.globalThis = context;
    vm.createContext(context);

    const source = [
        fs.readFileSync(path.join(root, 'js/core/state.js'), 'utf8'),
        fs.readFileSync(path.join(root, 'js/core/engine.js'), 'utf8'),
        `globalThis.lifecycle = {
            cancelPendingGameTasks,
            disposeGameSession,
            pendingGameTimers,
            scheduleGameTask
        };`
    ].join('\n');
    vm.runInContext(source, context);

    return { audio, clearedTimers, containers, elementsById, gems, lifecycle: context.lifecycle, toast, visualElements };
}

test('disposeGameSession cancela timers e limpa toda a UI da partida', () => {
    const harness = loadLifecycleHarness();
    harness.lifecycle.scheduleGameTask(() => {}, 100);
    harness.lifecycle.scheduleGameTask(() => {}, 200);

    harness.lifecycle.disposeGameSession({ stopAudio: true });

    assert.deepEqual(harness.clearedTimers, [1, 2]);
    assert.equal(harness.lifecycle.pendingGameTimers.size, 0);
    harness.containers.forEach(container => assert.equal(container.innerHTML, ''));
    harness.gems.forEach(gem => assert.equal(gem.classList.contains('active'), false));
    harness.visualElements.forEach(element => {
        assert.equal(element.classList.contains('passed'), false);
        assert.equal(element.classList.contains('active-turn'), false);
        assert.equal(element.classList.contains('drag-over'), false);
    });
    assert.equal(harness.toast.removed, true);
    assert.equal(harness.elementsById['mulligan-overlay'].classList.contains('hidden'), true);
    assert.equal(harness.elementsById['game-over-modal'].classList.contains('hidden'), true);
    assert.equal(harness.elementsById['pass-button'].disabled, false);
    assert.equal(harness.elementsById['pass-button'].textContent, 'Passar Rodada');
    ['score-total-player', 'score-total-opponent', 'enemy-hand-count', 'player-deck-count']
        .forEach(id => assert.equal(harness.elementsById[id].textContent, '0'));
    assert.equal(harness.audio.stopped, true);
});
