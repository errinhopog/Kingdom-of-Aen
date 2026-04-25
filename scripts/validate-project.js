#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const strict = process.argv.includes('--strict');

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
    return fs.existsSync(path.join(root, relativePath));
}

function loadGameData() {
    const source = [
        read('js/utils/helpers.js'),
        read('js/data/cards.js'),
        `
        globalThis.__koaData = {
            CARD_COLLECTION,
            leaderCardsData,
            ABILITY_DESCRIPTIONS,
            ROW_ICONS
        };
        `
    ].join('\n');

    const context = {
        console,
        globalThis: {}
    };
    context.globalThis = context;
    vm.createContext(context);
    vm.runInContext(source, context, { filename: 'koa-data-validation.vm.js' });
    return context.__koaData;
}

function collectAudioReferences() {
    const source = read('js/core/audio.js');
    const matches = [...source.matchAll(/['"]([^'"]+\.(?:ogg|mp3))['"]/gi)];
    return [...new Set(matches.map(match => `audio/${match[1]}`))];
}

function report(kind, message, list) {
    console.log(`\n${kind}: ${message}`);
    if (list && list.length) {
        list.forEach(item => console.log(`  - ${item}`));
    }
}

const errors = [];
const warnings = [];
const data = loadGameData();
const cards = data.CARD_COLLECTION || [];
const leaders = data.leaderCardsData || [];
const abilityDescriptions = data.ABILITY_DESCRIPTIONS || {};
const rowIcons = data.ROW_ICONS || {};

const ids = new Set();
const duplicateIds = [];
cards.forEach(card => {
    if (ids.has(card.id)) duplicateIds.push(card.id);
    ids.add(card.id);
});
if (duplicateIds.length) {
    errors.push(`IDs duplicados em CARD_COLLECTION: ${duplicateIds.join(', ')}`);
}

const baseIds = new Set(cards.map(card => card.baseId).filter(Boolean));
const missingPartners = cards
    .filter(card => card.ability === 'bond_partner' && card.partner)
    .filter(card => !cards.some(candidate => candidate.name === card.partner || candidate.baseId === card.partner))
    .map(card => `${card.id} -> ${card.partner}`);
if (missingPartners.length) {
    warnings.push(`Parceiros nao encontrados: ${missingPartners.join(', ')}`);
}

const missingAbilityDescriptions = [...new Set(cards
    .map(card => card.ability)
    .filter(ability => ability && ability !== 'none' && !abilityDescriptions[ability]))];
if (missingAbilityDescriptions.length) {
    warnings.push(`Habilidades sem descricao: ${missingAbilityDescriptions.join(', ')}`);
}

const missingImages = [...cards, ...leaders]
    .filter(item => item.img && !exists(item.img))
    .map(item => `${item.id}: ${item.img}`);
if (missingImages.length) {
    warnings.push(`Imagens referenciadas ausentes (${missingImages.length}): ${missingImages.join(', ')}`);
}

const missingRowIcons = Object.values(rowIcons).filter(iconPath => !exists(iconPath));
if (missingRowIcons.length) {
    errors.push(`Icones de fileira ausentes: ${missingRowIcons.join(', ')}`);
}

const missingAudio = collectAudioReferences().filter(audioPath => !exists(audioPath));
if (missingAudio.length) {
    errors.push(`Audios referenciados ausentes: ${missingAudio.join(', ')}`);
}

if (cards.length === 0) {
    errors.push('CARD_COLLECTION esta vazia.');
}

if (leaders.length === 0) {
    errors.push('leaderCardsData esta vazio.');
}

console.log('Kingdom of Aen project validation');
console.log(`Cards: ${cards.length}`);
console.log(`Leaders: ${leaders.length}`);
console.log(`Base IDs: ${baseIds.size}`);

if (errors.length) report('ERROS', 'corrigir antes de release', errors);
if (warnings.length) report('AVISOS', 'revisar para melhorar consistencia', warnings);

if (!errors.length && !warnings.length) {
    console.log('\nOK: nenhum problema encontrado.');
}

if (errors.length || (strict && warnings.length)) {
    process.exitCode = 1;
}
