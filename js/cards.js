const allCardsData = [
    // --- FILEIRA MELEE (Curta) ---
    {
        id: 'daniel',
        name: 'Daniel',
        type: 'melee',
        power: 2,
        img: 'assets/daniel.png',
        ability: 'bond_partner',
        partner: 'Gabriel'
    },
    {
        id: 'gabriel',
        name: 'Gabriel',
        type: 'melee',
        power: 2,
        img: 'assets/gabriel.png',
        ability: 'bond_partner',
        partner: 'Daniel'
    },
    {
        id: 'anderson',
        name: 'Anderson',
        type: 'melee',
        power: 4,
        img: 'assets/anderson.png'
    },
    {
        id: 'wellington',
        name: 'Wellington O Gigante',
        type: 'melee',
        power: 6,
        img: 'assets/wellington.png'
    },
    {
        id: 'pattenberg',
        name: 'Pattenberg',
        type: 'melee',
        power: 6,
        img: 'assets/pattenberg.png'
    },
    {
        id: 'vanessa',
        name: 'Vanessa',
        type: 'melee',
        power: 3,
        img: 'assets/vanessa.png'
    },

    // --- FILEIRA RANGED (Média) ---
    {
        id: 'marcelo',
        name: 'Marcelo',
        type: 'ranged',
        power: 5,
        img: 'assets/marcelo.png',
        ability: 'bond_partner',
        partner: 'Suelly'
    },
    {
        id: 'suelly',
        name: 'Suelly',
        type: 'ranged',
        power: 2,
        img: 'assets/suelly.png',
        ability: 'bond_partner',
        partner: 'Marcelo'
    },
    {
        id: 'adr14no',
        name: 'Adr14no',
        type: 'ranged',
        power: 5,
        img: 'assets/adr14no.png'
    },
    {
        id: 'clarice',
        name: 'Clarice',
        type: 'ranged',
        power: 4,
        img: 'assets/clarice.png'
    },
    {
        id: 'jacy',
        name: 'Jacy',
        type: 'ranged',
        power: 3,
        img: 'assets/jacy.png'
    },
    {
        id: 'thiago',
        name: 'Thiago',
        type: 'ranged',
        power: 2,
        img: 'assets/thiago.png'
    },
    {
        id: 'kariel',
        name: 'Kariel',
        type: 'ranged',
        power: 2,
        img: 'assets/kariel.png'
    },
    {
        id: 'jassyhara',
        name: 'Jassyhara',
        type: 'ranged',
        power: 4,
        img: 'assets/jassyhara.png'
    },

    // --- FILEIRA SIEGE (Longa) ---
    {
        id: 'marcus',
        name: 'Sir Marcus O Rei',
        type: 'siege',
        power: 9,
        img: 'assets/marcus.png',
        ability: 'hero',
        description: 'O rei da alfredolândia...',
        isHero: true
    },
    {
        id: 'eliel',
        name: 'Eliel',
        type: 'siege',
        power: 6,
        img: 'assets/eliel.png'
    },
    {
        id: 'ritatril',
        name: 'Ritatril',
        type: 'siege',
        power: 3,
        img: 'assets/ritatril.png',
        ability: 'medic'
    },

    // --- AGILE / MULTI-FILEIRA (Row: 'all') ---
    {
        id: 'geleia',
        name: 'Geleia Espião',
        type: 'melee', // Default type, but row: 'all' overrides placement
        row: 'all',
        power: 3,
        img: 'assets/geleia.png',
        ability: 'spy_medic'
    },
    {
        id: 'corredores',
        name: 'Corredores Espião',
        type: 'melee', // Default type
        row: 'all',
        power: 5,
        img: 'assets/corredores.png',
        ability: 'spy_medic'
    },
    {
        id: 'cozinheiros',
        name: 'Cozinheiros',
        type: 'melee', // Default type
        row: 'all',
        power: 3,
        img: 'assets/cozinheiros.png'
    },
    {
        id: 'espantalho',
        name: 'Espantalho',
        type: 'melee', // Default type
        row: 'all',
        power: 0,
        img: 'assets/decoy.png',
        ability: 'decoy'
    }
];
