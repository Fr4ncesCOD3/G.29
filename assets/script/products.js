// Configurazione API
const API_URL = "https://striveschool-api.herokuapp.com/api/product/";
const API_KEY = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzM3MTc2NThhZDEyOTAwMTU4NzZiZTMiLCJpYXQiOjE3MzE2NjM3MTcsImV4cCI6MTczMjg3MzMxN30.PRS8CWINYMozqZJkho8sPrvcmKzSD7BAY2zorayol9k";

// Cache per i prodotti
let productsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minuto

// Aggiungi costante per le categorie
const CATEGORIES = {
    SMARTPHONE: 'Smartphone',
    LAPTOP: 'Laptop',
    TABLET: 'Tablet',
    ACCESSORI: 'Accessori',
    AUDIO: 'Audio'
};

// Funzione per recuperare i prodotti con cache
const fetchProducts = async () => {
    try {
        const now = Date.now();
        if (productsCache && (now - lastFetchTime) < CACHE_DURATION) {
            return productsCache;
        }

        const response = await fetch(API_URL, {
            headers: {
                Authorization: API_KEY
            }
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error("Troppe richieste. Attendi qualche secondo e riprova.");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();
        console.log('Struttura prodotti dall\'API:', products); // Debug
        productsCache = products;
        lastFetchTime = now;
        return products;
    } catch (error) {
        console.error("Errore nel recupero dei prodotti:", error);
        throw error;
    }
};

// Funzione per visualizzare i prodotti nella home
const displayProducts = async () => {
    const bestSales = document.getElementById('bestSales');
    if (!bestSales) return;

    try {
        const response = await fetch("https://striveschool-api.herokuapp.com/api/product/", {
            headers: {
                Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzM3MTc2NThhZDEyOTAwMTU4NzZiZTMiLCJpYXQiOjE3MzE2NjM3MTcsImV4cCI6MTczMjg3MzMxN30.PRS8CWINYMozqZJkho8sPrvcmKzSD7BAY2zorayol9k"
            }
        });

        const products = await response.json();
        bestSales.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-product-id', product._id);
            card.innerHTML = `
                <div class="card shadow-sm">
                    <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/300x200?text=Immagine+non+disponibile'">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <h5 class="card-title text-truncate">${product.name}</h5>
                            <p class="card-text small text-truncate">${product.description}</p>
                            <small class="text-muted">${product.brand}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <strong>€${product.price.toFixed(2)}</strong>
                            <button class="btn btn-sm btn-primary view-details" data-product-id="${product._id}">
                                Dettagli
                            </button>
                        </div>
                    </div>
                </div>
            `;
            bestSales.appendChild(card);
        });

        // Aggiungi event listener per i dettagli
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = button.getAttribute('data-product-id');
                showProductDetails(productId);
            });
        });

    } catch (error) {
        console.error("Errore nel caricamento dei prodotti:", error);
    }
};

// Funzione migliorata per filtrare per categoria
const filterByCategory = async (category) => {
    try {
        const products = await fetchProducts();
        
        // Logica di filtro migliorata
        const filteredProducts = products.filter(product => {
            const searchTerms = [
                product.name.toLowerCase(),
                product.description.toLowerCase(),
                product.brand.toLowerCase()
            ];
            
            // Regole specifiche per categoria
            switch(category.toLowerCase()) {
                case CATEGORIES.SMARTPHONE.toLowerCase():
                    return searchTerms.some(term => 
                        term.includes('phone') || 
                        term.includes('smartphone') || 
                        term.includes('iphone') ||
                        term.includes('samsung') ||
                        term.includes('xiaomi')
                    );
                
                case CATEGORIES.LAPTOP.toLowerCase():
                    return searchTerms.some(term => 
                        term.includes('laptop') || 
                        term.includes('notebook') || 
                        term.includes('macbook') ||
                        term.includes('computer')
                    );
                
                case CATEGORIES.TABLET.toLowerCase():
                    return searchTerms.some(term => 
                        term.includes('tablet') || 
                        term.includes('ipad')
                    );
                
                case CATEGORIES.ACCESSORI.toLowerCase():
                    return searchTerms.some(term => 
                        term.includes('case') || 
                        term.includes('cover') ||
                        term.includes('charger') ||
                        term.includes('accessori') ||
                        term.includes('cavo')
                    );
                
                case CATEGORIES.AUDIO.toLowerCase():
                    return searchTerms.some(term => 
                        term.includes('headphone') || 
                        term.includes('airpods') ||
                        term.includes('earbuds') ||
                        term.includes('speaker')
                    );
                
                default:
                    return searchTerms.some(term => term.includes(category.toLowerCase()));
            }
        });

        // Gestione nessun risultato
        if (filteredProducts.length === 0) {
            const existingSection = document.getElementById('filtered-products');
            if (existingSection) existingSection.remove();
            
            const noResultsSection = document.createElement('div');
            noResultsSection.id = 'filtered-products';
            noResultsSection.className = 'container mb-5';
            noResultsSection.innerHTML = `
                <div class="alert alert-info mt-4" role="alert">
                    <h4 class="alert-heading">Nessun prodotto trovato</h4>
                    <p>Non ci sono prodotti disponibili nella categoria "${category}".</p>
                </div>
            `;
            document.getElementById('categoriesFilters').after(noResultsSection);
            return;
        }

        // Aggiorna UI
        updateFilteredProductsUI(filteredProducts, category);

    } catch (error) {
        console.error("Errore nel filtraggio dei prodotti:", error);
        showErrorMessage("Si è verificato un errore durante il filtraggio dei prodotti.");
    }
};

// Funzione separata per aggiornare l'UI
const updateFilteredProductsUI = (filteredProducts, category) => {
    const existingSection = document.getElementById('filtered-products');
    if (existingSection) existingSection.remove();

    const filteredSection = document.createElement('div');
    filteredSection.id = 'filtered-products';
    filteredSection.className = 'container mb-5';
    
    filteredSection.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mt-4 mb-3">
            <h3>Prodotti ${category}</h3>
            <span class="badge bg-primary">${filteredProducts.length} prodotti trovati</span>
        </div>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            ${filteredProducts.map(product => `
                <div class="col">
                    <div class="card h-100 shadow-sm product-card">
                        <div class="position-relative">
                            <img src="${product.imageUrl}" 
                                 class="card-img-top p-2" 
                                 alt="${product.name}"
                                 onerror="this.src='https://via.placeholder.com/300x200?text=Immagine+non+disponibile'">
                            <span class="badge bg-secondary position-absolute top-0 end-0 m-2">
                                ${product.brand}
                            </span>
                        </div>
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div>
                                <h5 class="card-title text-truncate">${product.name}</h5>
                                <p class="card-text small text-truncate">${product.description}</p>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-2">
                                <strong class="text-primary">€${product.price.toFixed(2)}</strong>
                                <button class="btn btn-outline-primary btn-sm view-details" 
                                        data-product-id="${product._id}">
                                    Dettagli
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('categoriesFilters').after(filteredSection);

    // Aggiungi event listeners
    filteredSection.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = button.getAttribute('data-product-id');
            showProductDetails(productId);
        });
    });
};

// Funzione per mostrare messaggi di errore
const showErrorMessage = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.getElementById('categoriesFilters').after(errorDiv);
};

// Funzione per mostrare i dettagli del prodotto
const showProductDetails = async (productId) => {
    try {
        const response = await fetch(`https://striveschool-api.herokuapp.com/api/product/${productId}`, {
            headers: {
                Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzM3MTc2NThhZDEyOTAwMTU4NzZiZTMiLCJpYXQiOjE3MzE2NjM3MTcsImV4cCI6MTczMjg3MzMxN30.PRS8CWINYMozqZJkho8sPrvcmKzSD7BAY2zorayol9k"
            }
        });

        const product = await response.json();
        
        const modalHtml = `
            <div class="modal fade" id="productModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${product.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <img src="${product.imageUrl}" class="img-fluid rounded" alt="${product.name}">
                                </div>
                                <div class="col-md-6">
                                    <h4 class="mb-3">${product.brand}</h4>
                                    <p class="mb-3">${product.description}</p>
                                    <h3 class="text-primary mb-4">€${product.price.toFixed(2)}</h3>
                                    <button class="btn btn-primary w-100">Acquista ora</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Rimuovi modal esistente se presente
        const existingModal = document.getElementById('productModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Aggiungi il nuovo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Mostra il modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();

    } catch (error) {
        console.error("Errore nel caricamento dei dettagli del prodotto:", error);
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();

    // Gestione click categorie con evidenziazione attiva
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            // Rimuovi classe active da tutte le cards
            document.querySelectorAll('.category-card').forEach(c => 
                c.classList.remove('active'));
            
            // Aggiungi classe active alla card cliccata
            card.classList.add('active');
            
            const category = card.querySelector('h5').textContent;
            filterByCategory(category);
        });
    });

    // Funzione per visualizzare i prodotti nella vetrina utente
    const productsShowcase = document.getElementById('productsShowcase');
    if (productsShowcase) {
        displayProductsShowcase();
    }
});

// Funzione per visualizzare i prodotti nella vetrina utente
const displayProductsShowcase = async () => {
    const productsShowcase = document.getElementById('productsShowcase');
    if (!productsShowcase) return;

    try {
        productsShowcase.innerHTML = `
            <div class="text-center my-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Caricamento...</span>
                </div>
            </div>
        `;

        const products = await fetchProducts();

        productsShowcase.innerHTML = `
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                ${products.map(product => `
                    <div class="col">
                        <div class="card h-100 shadow-sm">
                            <div class="position-relative">
                                <img src="${product.imageUrl}" 
                                     class="card-img-top p-3" 
                                     alt="${product.name}"
                                     style="height: 220px; object-fit: contain;"
                                     onerror="this.src='https://via.placeholder.com/300x200?text=Immagine+non+disponibile'">
                                ${product.isOnSale ? 
                                    '<span class="position-absolute top-0 end-0 badge bg-danger m-2">SALE</span>' : ''}
                            </div>
                            <div class="card-body d-flex flex-column justify-content-between p-4">
                                <div>
                                    <h5 class="card-title fw-bold mb-2">${product.name}</h5>
                                    <p class="card-text text-muted mb-2">${product.description}</p>
                                    <p class="card-text"><small class="text-primary fw-bold">${product.brand}</small></p>
                                    <p class="card-text"><small class="text-secondary">Categoria: ${product.category}</small></p>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-3">
                                    <span class="fs-5 fw-bold">€${product.price.toFixed(2)}</span>
                                    <div class="btn-group">
                                        <button class="btn btn-outline-primary btn-sm edit-product" data-product-id="${product._id}">
                                            <i class="bi bi-pencil"></i> Modifica
                                        </button>
                                        <button class="btn btn-outline-danger btn-sm delete-product" data-product-id="${product._id}">
                                            <i class="bi bi-trash"></i> Elimina
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Aggiungi event listeners per modifica ed eliminazione
        productsShowcase.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                showEditModal(productId);
            });
        });

        productsShowcase.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.dataset.productId;
                if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
                    await deleteProductWithAnimation(productId);
                }
            });
        });

    } catch (error) {
        console.error("Errore nel caricamento dei prodotti:", error);
        productsShowcase.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Errore nel caricamento dei prodotti: ${error.message}
            </div>
        `;
    }
};

// Funzione per aggiungere un nuovo prodotto
const addNewProduct = async (productData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': API_KEY
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Errore nell'aggiunta del prodotto:", error);
        throw error;
    }
};

// Event listener per il form di aggiunta prodotto
document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Ottieni il pulsante submit e salva il testo originale
            const submitBtn = addProductForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            try {
                // Mostra spinner nel pulsante submit
                submitBtn.innerHTML = `
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Aggiunta in corso...
                `;
                submitBtn.disabled = true;

                // Raccogli i dati dal form
                const productData = {
                    name: document.getElementById('productName').value,
                    brand: document.getElementById('productBrand').value,
                    description: document.getElementById('productDescription').value,
                    imageUrl: document.getElementById('productImageUrl').value,
                    price: parseFloat(document.getElementById('productPrice').value),
                    category: document.getElementById('productCategory').value,
                    isOnSale: document.getElementById('isOnSale').checked
                };

                // Aggiungi il prodotto
                await addNewProduct(productData);

                // Mostra messaggio di successo
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-success alert-dismissible fade show mt-3';
                alertDiv.innerHTML = `
                    <strong>Successo!</strong> Prodotto aggiunto correttamente.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                addProductForm.insertAdjacentElement('beforebegin', alertDiv);

                // Reset form
                addProductForm.reset();

                // Aggiorna la visualizzazione dei prodotti
                await displayProductsShowcase();

            } catch (error) {
                // Mostra errore
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
                alertDiv.innerHTML = `
                    <strong>Errore!</strong> ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                addProductForm.insertAdjacentElement('beforebegin', alertDiv);
            } finally {
                // Ripristina il pulsante submit con il testo originale
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Funzione per modificare un prodotto
const editProduct = async (productId, productData) => {
    try {
        const response = await fetch(`${API_URL}${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': API_KEY
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Errore nella modifica del prodotto:", error);
        throw error;
    }
};

// Funzione per eliminare un prodotto
const deleteProduct = async (productId) => {
    try {
        const response = await fetch(`${API_URL}${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error("Errore nell'eliminazione del prodotto:", error);
        throw error;
    }
};

// Funzione per mostrare il form di modifica
const showEditModal = async (productId) => {
    try {
        const response = await fetch(`${API_URL}${productId}`, {
            headers: {
                'Authorization': API_KEY
            }
        });
        const product = await response.json();

        const modalHtml = `
            <div class="modal fade" id="editProductModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Modifica Prodotto</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editProductForm" class="row g-3">
                                <input type="hidden" id="editProductId" value="${product._id}">
                                <div class="col-md-6">
                                    <label class="form-label">Nome Prodotto</label>
                                    <input type="text" class="form-control" id="editName" value="${product.name}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Brand</label>
                                    <input type="text" class="form-control" id="editBrand" value="${product.brand}" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Descrizione</label>
                                    <textarea class="form-control" id="editDescription" rows="3" required>${product.description}</textarea>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">URL Immagine</label>
                                    <input type="url" class="form-control" id="editImageUrl" value="${product.imageUrl}" required>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Prezzo</label>
                                    <input type="number" class="form-control" id="editPrice" value="${product.price}" step="0.01" min="0" required>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Categoria</label>
                                    <select class="form-select" id="editCategory" required>
                                        ${Object.values(CATEGORIES).map(cat => 
                                            `<option value="${cat}" ${product.category === cat ? 'selected' : ''}>${cat}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="col-12">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="editIsOnSale" ${product.isOnSale ? 'checked' : ''}>
                                        <label class="form-check-label">In offerta</label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" id="saveEditBtn">Salva Modifiche</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();

        // Gestione del salvataggio
        document.getElementById('saveEditBtn').addEventListener('click', async () => {
            try {
                const updatedData = {
                    name: document.getElementById('editName').value,
                    brand: document.getElementById('editBrand').value,
                    description: document.getElementById('editDescription').value,
                    imageUrl: document.getElementById('editImageUrl').value,
                    price: parseFloat(document.getElementById('editPrice').value),
                    category: document.getElementById('editCategory').value,
                    isOnSale: document.getElementById('editIsOnSale').checked
                };

                await editProduct(productId, updatedData);
                modal.hide();
                await displayProductsShowcase();
                
                // Mostra messaggio di successo
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-success alert-dismissible fade show';
                alertDiv.innerHTML = `
                    <strong>Successo!</strong> Prodotto modificato correttamente.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                document.querySelector('.products-container').insertAdjacentElement('beforebegin', alertDiv);
            } catch (error) {
                console.error("Errore nel salvataggio delle modifiche:", error);
            }
        });

    } catch (error) {
        console.error("Errore nel caricamento del prodotto:", error);
    }
};

// Funzione per eliminare un prodotto con animazione
const deleteProductWithAnimation = async (productId) => {
    try {
        const card = document.querySelector(`[data-product-id="${productId}"]`);
        if (!card) return;

        // Aggiungi classe per l'animazione
        card.style.transition = 'all 0.5s ease-out';
        card.style.transform = 'scale(0.8)';
        card.style.opacity = '0';
        
        // Aspetta la conferma dal server prima di rimuovere l'elemento
        await deleteProduct(productId);

        // Animazione di risucchio
        card.style.height = `${card.offsetHeight}px`;
        card.style.marginTop = '0';
        card.style.marginBottom = '0';
        card.style.padding = '0';
        
        // Attendi il completamento dell'animazione
        setTimeout(() => {
            card.style.height = '0';
            card.style.transform = 'scale(0) rotate(-10deg)';
            
            // Rimuovi l'elemento dopo l'animazione
            setTimeout(() => {
                card.remove();
                
                // Mostra messaggio di successo con fade
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-success alert-dismissible fade show';
                alertDiv.style.opacity = '0';
                alertDiv.innerHTML = `
                    <strong>Successo!</strong> Prodotto eliminato correttamente.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                document.querySelector('.products-container').insertAdjacentElement('beforebegin', alertDiv);
                
                // Fade in del messaggio
                setTimeout(() => alertDiv.style.opacity = '1', 50);
            }, 500);
        }, 100);

    } catch (error) {
        console.error("Errore nell'eliminazione del prodotto:", error);
        // Mostra errore
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            <strong>Errore!</strong> Impossibile eliminare il prodotto.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.products-container').insertAdjacentElement('beforebegin', alertDiv);
    }
};
