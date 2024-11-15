// Modello di riferimento per un singolo prodotto
const productExample = {
    name: "Product Name",
    description: "Product Description",
    brand: "Brand Name",
    imageUrl: "https://example.com/image.jpg",
    price: 99.99
};

// Array dei prodotti da aggiungere
const productsToAdd = [
    {
        name: "iPhone 15 Pro",
        description: "Smartphone con chip A17 Pro e fotocamera da 48MP",
        brand: "Apple",
        imageUrl: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch_GEO_EMEA?wid=2560&hei=1440&fmt=p-jpg&qlt=80&.v=1693009279096",
        price: 999.99
    },
    {
        name: "MacBook Air M2",
        description: "Laptop ultrasottile con chip M2 e display Retina",
        brand: "Apple",
        imageUrl: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-midnight-config-20220606?wid=820&hei=498&fmt=jpeg&qlt=90&.v=1654122880566",
        price: 1299.99
    },
    {
        name: "PlayStation 5",
        description: "Console di gioco next-gen con SSD ultraveloce",
        brand: "Sony",
        imageUrl: "https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21",
        price: 499.99
    },
    {
        name: "Nintendo Switch OLED",
        description: "Console ibrida con display OLED da 7 pollici",
        brand: "Nintendo",
        imageUrl: "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_800/v1/ncom/en_US/switch/site-design-update/hardware/switch/nintendo-switch-oled-model-white-set/gallery/image01",
        price: 349.99
    },
    {
        name: "Xbox Series X",
        description: "Console gaming 4K con ray tracing",
        brand: "Microsoft",
        imageUrl: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4mRni",
        price: 499.99
    }
];

// Funzione per verificare se un prodotto esiste già
const productExists = (existingProducts, newProduct) => {
    return existingProducts.some(existing => 
        existing.name === newProduct.name && 
        existing.brand === newProduct.brand
    );
};

// Recupero e gestione dei prodotti
fetch("https://striveschool-api.herokuapp.com/api/product/", {
    headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzM3MTc2NThhZDEyOTAwMTU4NzZiZTMiLCJpYXQiOjE3MzE2NjM3MTcsImV4cCI6MTczMjg3MzMxN30.PRS8CWINYMozqZJkho8sPrvcmKzSD7BAY2zorayol9k",
    },
})
.then((response) => response.json())
.then(async (existingProducts) => {
    console.log("Prodotti esistenti:", existingProducts);
    
    // Filtra solo i prodotti che non esistono già
    const productsToCreate = productsToAdd.filter(product => 
        !productExists(existingProducts, product)
    );

    if (productsToCreate.length > 0) {
        console.log(`Aggiungo ${productsToCreate.length} nuovi prodotti...`);
        
        for (const product of productsToCreate) {
            try {
                const response = await fetch("https://striveschool-api.herokuapp.com/api/product/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzM3MTc2NThhZDEyOTAwMTU4NzZiZTMiLCJpYXQiOjE3MzE2NjM3MTcsImV4cCI6MTczMjg3MzMxN30.PRS8CWINYMozqZJkho8sPrvcmKzSD7BAY2zorayol9k"
                    },
                    body: JSON.stringify(product)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log(`✅ Prodotto "${product.name}" aggiunto con successo`);
            } catch (error) {
                console.error(`❌ Errore nell'aggiunta di "${product.name}":`, error);
            }
        }
    } else {
        console.log("✨ Tutti i prodotti sono già presenti nel database");
    }
})
.catch((error) => {
    console.error("❌ Errore nel recupero dei prodotti:", error);
});

// Funzione per visualizzare i prodotti
const displayProducts = async () => {
    const bestSales = document.getElementById('bestSales');
    if (!bestSales) return;

    try {
        const response = await fetch("https://striveschool-api.herokuapp.com/api/product/", {
            headers: {
                Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzM3MTc2NThhZDEyOTAwMTU4NzZiZTMiLCJpYXQiOjE3MzE2NjM3MTcsImV4cCI6MTczMjg3MzMxN30.PRS8CWINYMozqZJkho8sPrvcmKzSD7BAY2zorayol9k"
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const products = await response.json();
        
        bestSales.innerHTML = `
            <div class="d-flex flex-nowrap overflow-x-auto gap-3 py-3 px-2">
                ${products.map(product => `
                    <div class="card flex-shrink-0" style="width: 300px;">
                        <div class="position-relative">
                            <img src="${product.imageUrl}" 
                                 class="card-img-top object-fit-cover" 
                                 style="height: 200px;"
                                 alt="${product.name}"
                                 onerror="this.src='https://via.placeholder.com/300x200?text=Immagine+non+disponibile'">
                            <span class="position-absolute top-0 end-0 badge bg-danger m-2">
                                SALE
                            </span>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <div class="flex-grow-1">
                                <h5 class="card-title fw-bold mb-1">${product.name}</h5>
                                <p class="card-text text-muted small mb-3">
                                    ${product.description}
                                </p>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-auto">
                                <span class="fs-5 fw-bold text-primary">€${product.price.toFixed(2)}</span>
                                <button class="btn btn-outline-primary">
                                    <i class="bi bi-cart-plus"></i> Acquista
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch (error) {
        console.error("❌ Errore nel caricamento dei prodotti:", error);
        bestSales.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>Errore nel caricamento dei prodotti</div>
            </div>
        `;
    }
};

// Chiamata alla funzione di visualizzazione
displayProducts();
