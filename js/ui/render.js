// ============================================
// ===       RENDERIZAÇÃO DE ELEMENTOS     ===
// ============================================

/**
 * Renderiza a mão do jogador usando allCardsData
 */
function renderHand() {
    const handContainer = document.querySelector('.hand-cards');
    if (!handContainer) return;

    handContainer.innerHTML = '';

    allCardsData.forEach(definition => {
        const card = createCardInstance(definition, { ownerId: 'player', zone: CARD_ZONES.HAND });
        const cardElement = createCardElement(card);
        handContainer.appendChild(cardElement);
    });
}

/**
 * Renderiza a mão do jogador a partir de um array de cartas
 * @param {Array} cards - Array de objetos de carta
 */
function renderHandFromCards(cards) {
    const handContainer = document.querySelector('.hand-cards');
    if (!handContainer) return;

    handContainer.innerHTML = '';

    cards.forEach(card => {
        const handCard = moveCardInstance(card, { zone: CARD_ZONES.HAND });
        const cardElement = createCardElement(handCard);
        handContainer.appendChild(cardElement);
    });
}

/**
 * Atualiza o contador de cartas na mão do inimigo
 */
function updateEnemyHandUI() {
    const el = document.getElementById('enemy-hand-count');
    if (el) {
        el.textContent = enemyHand.length;
    }
}

/**
 * Atualiza o contador de cartas no deck do jogador
 */
function updateDeckCountUI() {
    const deckCountEl = document.getElementById('player-deck-count');
    if (deckCountEl) {
        deckCountEl.textContent = playerDeck.length;
    }
}

// ============================================
// ===       CRIAÇÃO DE ELEMENTOS DE CARTA ===
// ============================================

/**
 * Cria um elemento DOM para uma carta
 * @param {Object} card - Dados da carta
 * @returns {HTMLElement} Elemento da carta
 */
function createCardElement(card) {
    const el = document.createElement('div');
    el.classList.add('card');
    el.draggable = true;

    syncCardElementInstance(el, card);

    // Data attributes usados somente pela apresentação durante a migração do estado.
    el.dataset.type = card.type;
    el.dataset.category = card.category || "unit";
    el.dataset.power = card.power;
    el.dataset.basePower = card.power;
    el.dataset.name = card.name;
    el.dataset.ability = card.ability || "none";
    el.dataset.isHero = card.isHero || "false";
    if (card.partner) el.dataset.partner = card.partner;
    if (card.row === 'all') el.dataset.agile = "true";

    // Classes especiais
    if (card.isHero) el.classList.add('hero-card');
    if (card.row === 'all') el.classList.add('agile-card');

    // Imagem de fundo do personagem
    if (card.img) {
        el.style.backgroundImage = `url('${card.img}')`;
    }

    // Overlay escuro para legibilidade
    const overlay = document.createElement('div');
    overlay.classList.add('card-overlay');
    el.appendChild(overlay);

    // Badge de Força
    const strengthBadge = document.createElement('div');
    strengthBadge.classList.add('card-strength-badge');
    strengthBadge.textContent = card.power;
    el.appendChild(strengthBadge);

    // Container de informações
    const infoContainer = document.createElement('div');
    infoContainer.classList.add('card-info-container');

    // Nome da carta
    const nameDiv = document.createElement('div');
    nameDiv.classList.add('card-name');
    nameDiv.textContent = card.name;
    infoContainer.appendChild(nameDiv);

    // Descrição/Habilidade
    const descDiv = document.createElement('div');
    descDiv.classList.add('card-desc');
    if (card.ability && card.ability !== 'none') {
        let descText = ABILITY_DESCRIPTIONS[card.ability] || '';
        if (card.ability === 'bond_partner' && card.partner) {
            descText = `Bond: ${card.partner}`;
        }
        descDiv.textContent = descText;
    } else {
        descDiv.textContent = card.type.charAt(0).toUpperCase() + card.type.slice(1);
    }
    infoContainer.appendChild(descDiv);

    el.appendChild(infoContainer);

    // Ícone da Fileira
    const rowIconImg = document.createElement('img');
    rowIconImg.classList.add('card-row-icon-img');

    let iconKey = card.type;
    if (card.row === 'all') {
        iconKey = 'agile';
    }
    rowIconImg.src = ROW_ICONS[iconKey] || ROW_ICONS['melee'];
    rowIconImg.alt = `Ícone ${iconKey}`;
    rowIconImg.draggable = false;
    el.appendChild(rowIconImg);

    // Drag Events
    el.addEventListener('dragstart', dragStart);
    el.addEventListener('dragend', dragEnd);

    return el;
}

/** Mantém a referência canônica da instância associada ao elemento visual. */
function syncCardElementInstance(element, instance) {
    element.cardInstance = instance;
    element.dataset.id = instance.instanceId;
    element.dataset.definitionId = instance.definitionId;
    element.dataset.ownerId = instance.ownerId;
    element.dataset.controllerId = instance.controllerId;
    element.dataset.zone = instance.zone;
    element.dataset.currentRow = instance.currentRow || '';
}
