/**
 * ============================================================
 *  RARE DESIGNS — Site Data
 * ============================================================
 */

const siteData = {
    brand: {
        name: 'RARE DESIGNS',
        nameTop: 'RARE',
        nameBottom: 'DESIGNS',
        tagline: 'CURATED FASHION · LIMITED PIECES',
        year: 2026,
    },

    support: {
        whatsappLabel: 'WHATSAPP',
        whatsappNumber: '27763004531',
        whatsappUrl: 'https://wa.me/27763004531',
    },

    loading: {
        enabled: true,
        minimumMs: 1800,
        fadeMs: 800,
        messages: [
            'Loading collection experience…',
            'Preparing luxury visuals…',
            'Syncing your saved pieces…',
            'Almost ready…'
        ],
    },

    nav: [
        { label: 'COLLECTIONS', href: 'index.html#collections' },
        { label: 'CONTACT', href: '#contact' },
    ],

    collections: [
        {
            id: 'streetwear',
            index: '01',
            title: 'Streetwear',
            description: 'Urban edge meets high fashion. Raw textures, oversized silhouettes, and attitude-first design for those who refuse to blend in.',
            priceRange: { min: 800, max: 2500 },
            coverImage: 'data/1000226263.jpg',
            align: 'image-left',
        },
        {
            id: 'casual-chic',
            index: '02',
            title: 'Casual Chic',
            description: 'Effortless everyday style. Clean cuts, premium fabrics, and versatile pieces that move seamlessly from morning to evening.',
            priceRange: { min: 500, max: 1800 },
            coverImage: 'data/IMG_6389.jpg',
            align: 'image-right',
        },
        {
            id: 'evening-wear',
            index: '03',
            title: 'Evening Wear',
            description: 'Elegance for the night. Draped silhouettes, refined embellishments, and statement pieces crafted for unforgettable moments.',
            priceRange: { min: 1500, max: 4000 },
            coverImage: 'data/casual/img1.jpg',
            align: 'image-left',
        },
    ],

    products: [
        {
            id: 'stealth-bomber-fit',
            collectionId: 'streetwear',
            name: 'Stealth Bomber Fit',
            description: 'All-black oversized bomber with matte finish and tonal embroidery. A silhouette built for the streets.',
            price: 2200,
            images: ['data/1000226320.jpg'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            isNew: true,
            isSoldOut: false,
        },
        {
            id: 'layered-overcoat',
            collectionId: 'streetwear',
            name: 'Layered Overcoat',
            description: 'Structured yet fluid layered overcoat in graphite wool blend. Minimal hardware, maximum presence.',
            price: 2500,
            images: ['data/1000226313.jpg'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            availableSizes: ['S', 'M', 'L', 'XL'],
            isNew: false,
            isSoldOut: false,
        },
        {
            id: 'shadow-cargo',
            collectionId: 'streetwear',
            name: 'Shadow Cargo',
            description: 'Technical cargo trousers with hidden zip pockets and an adjustable hem. Built for movement.',
            price: 1400,
            images: ['data/1000226309.jpg'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            isNew: false,
            isSoldOut: false,
        },
        {
            id: 'rebel-classic',
            collectionId: 'casual-chic',
            name: 'Rebel Classic',
            description: 'A deconstructed blazer that redefines smart-casual. Unlined, unstructured, and effortlessly cool.',
            price: 1500,
            images: ['data/IMG_6392.jpg'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            isNew: true,
            isSoldOut: false,
        },
        {
            id: 'soft-structure',
            collectionId: 'casual-chic',
            name: 'Soft Structure',
            description: 'Wide-leg trousers in Italian linen. Breathable, refined, and endlessly versatile.',
            price: 1200,
            images: ['data/IMG_6397.jpg'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            availableSizes: ['S', 'M', 'L'],
            isNew: false,
            isSoldOut: false,
        },
        {
            id: 'urban-ease',
            collectionId: 'casual-chic',
            name: 'Urban Ease',
            description: 'Premium cotton jersey set designed for the modern urban wardrobe. Simple lines, elevated feel.',
            price: 800,
            images: ['data/IMG_6399.jpg'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            isNew: false,
            isSoldOut: false,
        },
        {
            id: 'noir-drape',
            collectionId: 'evening-wear',
            name: 'Noir Drape',
            description: 'Floor-length draped gown in silk-charmeuse with an open-back cowl. The quiet power of a statement entry.',
            price: 3800,
            images: ['data/casual/img1.jpg'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            availableSizes: ['XS', 'S', 'M', 'L'],
            isNew: true,
            isSoldOut: false,
        },
        {
            id: 'velvet-blazer',
            collectionId: 'evening-wear',
            name: 'Velvet Blazer',
            description: 'Single-button midnight velvet blazer with peak lapels. Wear it to events or wear it everywhere.',
            price: 2800,
            images: ['data/casual/img2.jpg'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
            isNew: false,
            isSoldOut: false,
        },
        {
            id: 'obsidian-column',
            collectionId: 'evening-wear',
            name: 'Obsidian Column',
            description: 'Column dress in heavy crepe with a sculptural neckline. Minimalism at its most commanding.',
            price: 4000,
            images: ['data/casual/img3.jpg'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            availableSizes: ['XS', 'S', 'M'],
            isNew: false,
            isSoldOut: false,
        },
        {
            id: 'midnight-jumpsuit',
            collectionId: 'evening-wear',
            name: 'Midnight Jumpsuit',
            description: 'Tailored jumpsuit in jet-black crepe with a plunging neckline and tapered legs. A modern alternative to evening wear.',
            price: 3200,
            images: ['data/casual/img4.jpg'],
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            isNew: false,
            isSoldOut: false,
        }
    ],
};

function getProductsByCollection(collectionId) {
    return siteData.products.filter((product) => product.collectionId === collectionId);
}

function getCollectionById(id) {
    return siteData.collections.find((collection) => collection.id === id) || null;
}

function getProductById(id) {
    return siteData.products.find((product) => product.id === id) || null;
}

function formatPrice(price) {
    return `R ${Number(price || 0).toLocaleString('en-ZA')}`;
}

function formatPriceRange(range) {
    return `R ${range.min.toLocaleString('en-ZA')} – R ${range.max.toLocaleString('en-ZA')}`;
}

// ============================================================
// EXPOSE GLOBALLY FOR MAIN.JS
// ============================================================
if (typeof window !== 'undefined') {
    window.siteData = siteData;
    window.getProductsByCollection = getProductsByCollection;
    window.getCollectionById = getCollectionById;
    window.getProductById = getProductById;
    window.formatPrice = formatPrice;
    window.formatPriceRange = formatPriceRange;
}