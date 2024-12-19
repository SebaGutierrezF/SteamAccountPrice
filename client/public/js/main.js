document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('steamForm');
    const loadingSection = document.getElementById('loading');
    const resultSection = document.getElementById('result');
    const errorSection = document.getElementById('error');
    const progressLog = document.getElementById('progress-log');
    const totalValueSpan = document.getElementById('totalValue');
    const itemCountSpan = document.getElementById('itemCount');
    const errorText = document.getElementById('errorText');

    // Configuración de tema y lenguaje
    const themeToggle = document.getElementById('themeToggle');
    const languageToggle = document.getElementById('languageToggle');
    const html = document.documentElement;

    // Cargar preferencias guardadas
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'es';

    // Aplicar tema y lenguaje guardados
    html.setAttribute('data-theme', savedTheme);
    setLanguage(savedLanguage);

    // Manejador de cambio de tema
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Manejador de cambio de idioma
    languageToggle.addEventListener('click', () => {
        const currentLang = localStorage.getItem('language') || 'es';
        const newLang = currentLang === 'en' ? 'es' : 'en';
        setLanguage(newLang);
    });

    // Resto del código del formulario y funciones...
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const steamId = document.getElementById('steamId').value;
        
        // Resetear estado
        loadingSection.style.display = 'block';
        resultSection.style.display = 'none';
        errorSection.style.display = 'none';
        progressLog.innerHTML = '';

        try {
            const eventSource = new EventSource(`http://localhost:5000/api/inventory/value/${steamId}/stream`);
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                if (data.type === 'progress') {
                    const progressItem = document.createElement('div');
                    progressItem.className = 'progress-item';
                    progressItem.textContent = data.message;
                    progressLog.appendChild(progressItem);
                    progressLog.scrollTop = progressLog.scrollHeight;
                } else if (data.type === 'result') {
                    totalValueSpan.textContent = `$${data.totalValue}`;
                    itemCountSpan.textContent = data.itemsProcessed;
                    loadingSection.style.display = 'none';
                    resultSection.style.display = 'block';
                    eventSource.close();
                } else if (data.type === 'error') {
                    showError(data.message);
                    eventSource.close();
                }
            };

            eventSource.onerror = () => {
                showError('Error al conectar con el servidor');
                eventSource.close();
            };
        } catch (err) {
            showError('Error al procesar el inventario');
        }
    });

    function setLanguage(lang) {
        const translations = {
            en: {
                title: 'CS:GO Inventory Calculator',
                subtitle: 'Calculate the total value of your CS:GO inventory in real-time',
                placeholder: 'Enter your Steam ID',
                button: 'Calculate Value',
                help: 'Don\'t know your Steam ID?',
                findHere: 'Find it here',
                analyzing: 'Analyzing your inventory...',
                results: 'Analysis Results',
                totalValue: 'Total Value',
                itemsProcessed: 'Items Processed',
                items: 'items',
                footer: 'This tool uses the Steam API to calculate your inventory value',
                connectionError: 'Error connecting to server',
                processingError: 'Error processing inventory'
            },
            es: {
                title: 'Calculador de Inventario CS:GO',
                subtitle: 'Calcula el valor total de tu inventario de CS:GO en tiempo real',
                placeholder: 'Ingresa tu Steam ID',
                button: 'Calcular Valor',
                help: '¿No sabes tu Steam ID?',
                findHere: 'Encuéntralo aquí',
                analyzing: 'Analizando tu inventario...',
                results: 'Resultado del Análisis',
                totalValue: 'Valor Total',
                itemsProcessed: 'Items Procesados',
                items: 'items',
                footer: 'Esta herramienta utiliza la API de Steam para calcular el valor de tu inventario',
                connectionError: 'Error al conectar con el servidor',
                processingError: 'Error al procesar el inventario'
            }
        };

        try {
            const elementMappings = {
                'h1': 'title',
                '.subtitle': 'subtitle',
                '.steam-id-input': { attribute: 'placeholder', key: 'placeholder' },
                '.button-text': 'button',
                '.help-text span': 'help',
                '.help-text a': 'findHere',
                '.loading-indicator p': 'analyzing',
                '.result-container h2': 'results',
                '.total-value .label': 'totalValue',
                '.items-count .label': 'itemsProcessed',
                '.items-count .unit': 'items',
                '.footer p': 'footer'
            };

            Object.entries(elementMappings).forEach(([selector, value]) => {
                const element = document.querySelector(selector);
                if (!element) return;

                if (typeof value === 'object') {
                    element.setAttribute(value.attribute, translations[lang][value.key]);
                } else {
                    element.textContent = translations[lang][value];
                }
            });

            const buttonText = lang === 'en' ? 'ES' : 'EN';
            languageToggle.innerHTML = buttonText;
            document.documentElement.lang = lang;
            localStorage.setItem('language', lang);

        } catch (error) {
            console.error('Error al cambiar el idioma:', error);
        }
    }

    function showError(message) {
        const lang = localStorage.getItem('language') || 'es';
        const translations = {
            en: {
                connectionError: 'Error connecting to server',
                processingError: 'Error processing inventory'
            },
            es: {
                connectionError: 'Error al conectar con el servidor',
                processingError: 'Error al procesar el inventario'
            }
        };

        loadingSection.style.display = 'none';
        resultSection.style.display = 'none';
        errorSection.style.display = 'block';
        
        // Traducir mensajes de error comunes
        if (message.includes('Error al conectar') || message.includes('Error connecting')) {
            errorText.textContent = translations[lang].connectionError;
        } else if (message.includes('Error al procesar') || message.includes('Error processing')) {
            errorText.textContent = translations[lang].processingError;
        } else {
            errorText.textContent = message;
        }
    }

    // Al iniciar la página
    document.addEventListener('DOMContentLoaded', () => {
        const savedLanguage = localStorage.getItem('language') || 'es';
        setLanguage(savedLanguage);
        languageToggle.innerHTML = savedLanguage === 'en' ? 'ES' : 'EN';
    });
});
 