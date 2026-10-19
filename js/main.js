// ==========================================
// SCRIPT MAESTRO: TERRA ECUADOR (OPTIMIZADO)
// ==========================================

// Envolvemos todo en DOMContentLoaded para que espere a que el HTML cargue primero
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MENÚ DE NAVEGACIÓN INTELIGENTE (SCROLL) ---
    const navbar = document.querySelector('nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (!navbar.classList.contains('nav-internal')) {
                if (window.scrollY > 50) {
                    navbar.classList.add('nav-scrolled');
                } else {
                    navbar.classList.remove('nav-scrolled');
                }
            }
        });
    }

    // --- 2. LOGICA DE LA PORTADA (INTERACCIÓN SHOWCASE) ---
    const showcaseItems = document.querySelectorAll('.showcase-item');
    const showcaseImages = document.querySelectorAll('.showcase-img');

    if (showcaseItems.length > 0) {
        showcaseItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                showcaseItems.forEach(i => i.classList.remove('active'));
                showcaseImages.forEach(img => img.classList.remove('active'));
                
                item.classList.add('active');
                const imageId = item.getAttribute('data-image');
                const targetImage = document.getElementById(imageId);
                if (targetImage) targetImage.classList.add('active');
            });
        });
    }

    // --- 3. TORRE 3D (PORTADA) ---
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas && typeof THREE !== 'undefined') {
        const sceneHero = new THREE.Scene();
        const cameraHero = new THREE.PerspectiveCamera(30, heroCanvas.clientWidth / heroCanvas.clientHeight, 0.1, 1000);
        cameraHero.position.set(0, 0, 48); 

        const rendererHero = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        rendererHero.setSize(heroCanvas.clientWidth, heroCanvas.clientHeight);
        rendererHero.setPixelRatio(window.devicePixelRatio);
        heroCanvas.appendChild(rendererHero.domElement);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2); 
        sunLight.position.set(10, 20, 10);
        sceneHero.add(sunLight);
        
        const ambientLightHero = new THREE.AmbientLight(0xffffff, 0.6); 
        sceneHero.add(ambientLightHero);

        const slabMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, specular: 0xC9A84C, shininess: 50 });
        const glassDayMat = new THREE.MeshPhongMaterial({ color: 0xaabbff, transparent: true, opacity: 0.6, shininess: 150 });

        const towerGroup = new THREE.Group();
        sceneHero.add(towerGroup);

        const pisos = 11;
        const baseBuilding = new THREE.Mesh(new THREE.BoxGeometry(6, 1, 6), slabMaterial);
        towerGroup.add(baseBuilding);

        for (let i = 1; i <= pisos; i++) {
            const slab = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.2, 5.5), slabMaterial);
            slab.position.y = i * 1.5;
            
            const glass = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.3, 4.8), glassDayMat); 
            glass.position.y = (i * 1.5) + 0.75;
            
            const rotacion = i * 0.08;
            slab.rotation.y = rotacion; 
            glass.rotation.y = rotacion;
            
            towerGroup.add(slab, glass);
        }
        
        towerGroup.position.y = -8.5; 
        towerGroup.position.x = 0;

        function animateHero() {
            requestAnimationFrame(animateHero);
            if(towerGroup) towerGroup.rotation.y += 0.0035; 
            rendererHero.render(sceneHero, cameraHero);
        }
        animateHero();

        window.addEventListener('resize', () => {
            if (heroCanvas.clientWidth === 0) return; // Evitar errores si no es visible
            cameraHero.aspect = heroCanvas.clientWidth / heroCanvas.clientHeight;
            cameraHero.updateProjectionMatrix();
            rendererHero.setSize(heroCanvas.clientWidth, heroCanvas.clientHeight);
        });
    }

    // --- 4. ANIMACIÓN DE CONTADORES (MÉTRICAS) ---
    const metricasSection = document.querySelector('.metricas-impacto') || document.querySelector('#proyectos');
    const counters = document.querySelectorAll('.counter, .metrica-num'); // Asegura capturar ambas clases

    if (metricasSection && counters.length > 0) {
        let animated = false;

        const animateCounters = () => {
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target') || parseInt(counter.innerText.replace(/,/g, ''));
                    const count = +counter.innerText.replace(/,/g, '');
                    const speed = 100;
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc).toLocaleString('en-US');
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target.toLocaleString('en-US');
                    }
                };
                
                counter.innerText = '0';
                updateCount();
            });
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animateCounters();
                    animated = true;
                }
            });
        }, { threshold: 0.5 });

        observer.observe(metricasSection);
    }

    // --- 5. LÓGICA DE PÁGINAS INTERNAS (Tabs y Filtros) ---
    function setupTabs(btnTab1, btnTab2, section1, section2) {
        if (btnTab1 && btnTab2 && section1 && section2) {
            btnTab1.addEventListener('click', () => {
                btnTab1.classList.add('active'); btnTab2.classList.remove('active');
                section1.style.display = 'grid'; section2.style.display = 'none';
            });
            btnTab2.addEventListener('click', () => {
                btnTab2.classList.add('active'); btnTab1.classList.remove('active');
                section1.style.display = 'none'; section2.style.display = 'block';
            });
        }
    }

    setupTabs(document.getElementById('btnComprar'), document.getElementById('btnVender'), document.getElementById('seccionComprar'), document.getElementById('seccionVender'));
    setupTabs(document.getElementById('btnRentar'), document.getElementById('btnPonerRenta'), document.getElementById('seccionRentar'), document.getElementById('seccionPonerRenta'));

    function setupFiltros(btnId, cardClass, emptyMsgId) {
        const btn = document.getElementById(btnId);
        if(btn) {
            btn.addEventListener('click', () => {
                const container = btn.closest('.catalog-layout'); 
                if(!container) return;
                
                const tipos = Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
                const zonaRadio = container.querySelector('input[type="radio"]:checked');
                const zona = zonaRadio ? zonaRadio.value : 'todos';
                const selectProv = container.querySelector('select');
                const provincia = selectProv ? selectProv.value : 'todas';
                const tarjetas = document.querySelectorAll(`.${cardClass}`);
                const msgError = document.getElementById(emptyMsgId);
                
                const originalText = btn.innerHTML;
                btn.innerHTML = 'Filtrando...';

                setTimeout(() => {
                    let visibles = 0;
                    tarjetas.forEach(prop => {
                        const t = prop.getAttribute('data-tipo');
                        const z = prop.getAttribute('data-zona');
                        const p = prop.getAttribute('data-provincia');
                        const e = prop.getAttribute('data-estado'); 
                        
                        const coincideTipo = tipos.length === 0 || tipos.includes(t) || tipos.includes(e);
                        const coincideZona = zona === 'todos' || zona === z;
                        const coincideProvincia = provincia === 'todas' || provincia === p;

                        if (coincideTipo && coincideZona && coincideProvincia) {
                            prop.classList.remove('hidden-card'); visibles++;
                        } else {
                            prop.classList.add('hidden-card');
                        }
                    });

                    if(msgError) msgError.style.display = visibles === 0 ? 'block' : 'none';
                    btn.innerHTML = originalText;
                }, 400);
            });
        }
    }

    setupFiltros('btnAplicarFiltros', 'propiedad-item', 'mensajeSinResultados');
    setupFiltros('btnAplicarFiltrosRenta', 'propiedad-renta', 'mensajeSinRentas');

    // --- 6. LÓGICA DEL FORMULARIO DE CONTACTO ---
    const contactForm = document.getElementById('terraContactForm');
    const successMessage = document.getElementById('successMessage');
    const btnSubmit = document.getElementById('btnSubmitContact');

    if (contactForm && btnSubmit && successMessage) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = 'ENVIANDO...';
            btnSubmit.style.opacity = '0.7';
            btnSubmit.disabled = true;

            setTimeout(() => {
                successMessage.style.display = 'block';
                contactForm.reset();
                btnSubmit.innerHTML = originalText;
                btnSubmit.style.opacity = '1';
                btnSubmit.disabled = false;

                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 8000);
            }, 1500);
        });
    }

    // --- 7. INTERACTIVIDAD PÁGINA CONSTRUCCIÓN ---
    
    // 7.1 Plano Interactivo
    const rooms = document.querySelectorAll('.room-path');
    const titleDisplay = document.querySelector('.room-title-display');
    const descDisplay = document.querySelector('.room-desc-display');
    const iconDisplay = document.querySelector('.room-icon-display');

    if (rooms.length > 0 && titleDisplay && descDisplay) {
        rooms.forEach(room => {
            room.addEventListener('click', function() {
                rooms.forEach(r => r.classList.remove('active'));
                this.classList.add('active');
                titleDisplay.textContent = this.getAttribute('data-title');
                descDisplay.textContent = this.getAttribute('data-desc');
                iconDisplay.textContent = this.getAttribute('data-icon');
            });
        });
    }

    // 7.2 Escáner de Materialización (Antes y Después)
    const escanerContainer = document.getElementById('escanerContainer');
    const imgVision = document.getElementById('imgVision');
    const escanerLaser = document.getElementById('escanerLaser');

    if (escanerContainer && imgVision && escanerLaser) {
        let isDragging = false;

        const moveScanner = (e) => {
            const rect = escanerContainer.getBoundingClientRect();
            let clientX = 0;
            
            if (e.type.includes('touch')) {
                clientX = e.touches[0].clientX;
            } else {
                clientX = e.clientX;
            }
            
            let xPos = clientX - rect.left;
            if (xPos < 0) xPos = 0;
            if (xPos > rect.width) xPos = rect.width;

            let percentage = (xPos / rect.width) * 100;
            escanerLaser.style.left = `${percentage}%`;
            
            imgVision.style.webkitClipPath = `inset(0 ${100 - percentage}% 0 0)`;
            imgVision.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
        };

        escanerContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            moveScanner(e); 
        });
        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mousemove', (e) => {
            if (isDragging) moveScanner(e);
        });

        escanerContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
            moveScanner(e);
        }, { passive: true });
        
        window.addEventListener('touchend', () => isDragging = false);
        
        escanerContainer.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault(); 
                moveScanner(e);
            }
        }, { passive: false });
    }

}); // Fin del DOMContentLoaded

