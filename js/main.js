/* ==========================================================================
   TERRA ECUADOR - SCRIPT PRINCIPAL OPTIMIZADO (3D MÓVIL Y FILTROS RESPONSIVE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. TORRE 3D INTERACTIVA EN THREE.JS (AJUSTADA PARA MÓVILES) --- */
    const canvasContainer = document.getElementById('heroCanvas');

    if (canvasContainer && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();

        // Configuración responsive de Cámara
        const isMobile = window.innerWidth <= 768;
        const cameraFov = isMobile ? 60 : 45;
        const cameraZ = isMobile ? 22 : 16;
        const cameraY = isMobile ? -1 : 0;

        const camera = new THREE.PerspectiveCamera(
            cameraFov, 
            canvasContainer.clientWidth / canvasContainer.clientHeight, 
            0.1, 
            1000
        );
        camera.position.set(0, cameraY, cameraZ);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasContainer.appendChild(renderer.domElement);

        // Iluminación
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xC9A84C, 1.8);
        dirLight.position.set(10, 20, 15);
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-10, -10, -10);
        scene.add(fillLight);

        // Grupo Principal de la Torre
        const towerGroup = new THREE.Group();
        scene.add(towerGroup);

        // Materiales
        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.85
        });

        const goldEdgeMaterial = new THREE.LineBasicMaterial({
            color: 0xC9A84C,
            linewidth: 1.5
        });

        // Construcción paramétrica de la torre helicoidal
        const floors = 22;
        const baseRadius = isMobile ? 2.2 : 3.0; // Escalado más pequeño para móviles
        const floorHeight = 0.55;

        for (let i = 0; i < floors; i++) {
            const factor = 1 - (i / floors) * 0.35;
            const radius = baseRadius * factor;
            
            const geometry = new THREE.CylinderGeometry(radius * 0.95, radius, floorHeight, 5);
            const floorMesh = new THREE.Mesh(geometry, glassMaterial);
            
            floorMesh.position.y = (i - floors / 2) * (floorHeight + 0.05);
            floorMesh.rotation.y = i * 0.12; 

            // Bordes dorados
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, goldEdgeMaterial);
            floorMesh.add(line);

            towerGroup.add(floorMesh);
        }

        // Posición ajustada en móvil
        if (isMobile) {
            towerGroup.position.set(0, -1.5, 0);
        } else {
            towerGroup.position.set(1.5, -0.5, 0);
        }

        // Interacción con mouse / touch
        let mouseX = 0, mouseY = 0;
        let targetRotationX = 0, targetRotationY = 0;

        function onPointerMove(event) {
            const clientX = event.touches ? event.touches[0].clientX : event.clientX;
            const clientY = event.touches ? event.touches[0].clientY : event.clientY;

            mouseX = (clientX - window.innerWidth / 2) * 0.0005;
            mouseY = (clientY - window.innerHeight / 2) * 0.0005;
        }

        window.addEventListener('mousemove', onPointerMove, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });

        // Bucle de Renderizado
        function animate() {
            requestAnimationFrame(animate);

            // Rotación automática + respuesta suave al toque/mouse
            towerGroup.rotation.y += 0.005;
            
            targetRotationY += (mouseX - targetRotationY) * 0.05;
            targetRotationX += (mouseY - targetRotationX) * 0.05;

            towerGroup.rotation.y += targetRotationY * 0.1;
            towerGroup.rotation.x = Math.max(-0.3, Math.min(0.3, targetRotationX));

            renderer.render(scene, camera);
        }

        animate();

        // Responsive Resize
        window.addEventListener('resize', () => {
            const mobileCheck = window.innerWidth <= 768;
            camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
            camera.fov = mobileCheck ? 60 : 45;
            camera.position.z = mobileCheck ? 22 : 16;
            camera.updateProjectionMatrix();

            if (mobileCheck) {
                towerGroup.position.set(0, -1.5, 0);
            } else {
                towerGroup.position.set(1.5, -0.5, 0);
            }

            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        });
    }


    /* --- 2. PESTAÑAS (COMPRAR / VENDER Y RENTAR / PONER EN RENTA) --- */
    const setupTabs = (btn1Id, btn2Id, sec1Id, sec2Id) => {
        const btn1 = document.getElementById(btn1Id);
        const btn2 = document.getElementById(btn2Id);
        const sec1 = document.getElementById(sec1Id);
        const sec2 = document.getElementById(sec2Id);

        if (btn1 && btn2 && sec1 && sec2) {
            btn1.addEventListener('click', () => {
                btn1.classList.add('active');
                btn2.classList.remove('active');
                sec1.style.display = 'grid';
                sec2.style.display = 'none';
            });

            btn2.addEventListener('click', () => {
                btn2.classList.add('active');
                btn1.classList.remove('active');
                sec1.style.display = 'none';
                sec2.style.display = 'block';
            });
        }
    };

    setupTabs('btnComprar', 'btnVender', 'seccionComprar', 'seccionVender');
    setupTabs('btnRentar', 'btnPonerRenta', 'seccionRentar', 'seccionPonerRenta');


    /* --- 3. SISTEMA DE FILTROS RESPONSIVE (COMPRA / VENTA Y RENTA) --- */
    
    // Toggle desplegable de la barra de filtros en móviles
    const setupMobileSidebarToggle = (sidebarElem) => {
        if (!sidebarElem) return;
        
        if (!sidebarElem.querySelector('.sidebar-toggle-btn')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'sidebar-toggle-btn';
            toggleBtn.type = 'button';
            toggleBtn.innerHTML = '<span>Filtrar Propiedades ⚙️</span><span class="toggle-icon">▼</span>';
            sidebarElem.insertBefore(toggleBtn, sidebarElem.firstChild);

            toggleBtn.addEventListener('click', () => {
                sidebarElem.classList.toggle('is-open');
            });
        }
    };

    const sidebars = document.querySelectorAll('.sidebar');
    sidebars.forEach(sidebar => setupMobileSidebarToggle(sidebar));

    // Lógica de filtrado de Compra
    const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', () => {
            const tiposChecked = Array.from(document.querySelectorAll('.filtro-tipo:checked')).map(cb => cb.value);
            const zonaRadio = document.querySelector('.filtro-zona:checked')?.value || 'todos';
            const estadosChecked = Array.from(document.querySelectorAll('.filtro-estado:checked')).map(cb => cb.value);
            const provincia = document.getElementById('filtroProvincia')?.value || 'todas';

            const tarjetas = document.querySelectorAll('.propiedad-item');
            const msgSinResultados = document.getElementById('mensajeSinResultados');
            let visibles = 0;

            tarjetas.forEach(card => {
                const tipoCard = card.dataset.tipo;
                const zonaCard = card.dataset.zona;
                const estadoCard = card.dataset.estado;
                const provinciaCard = card.dataset.provincia;

                const matchTipo = tiposChecked.length === 0 || tiposChecked.includes(tipoCard);
                const matchZona = zonaRadio === 'todos' || zonaCard === zonaRadio;
                const matchEstado = estadosChecked.length === 0 || estadosChecked.includes(estadoCard);
                const matchProvincia = provincia === 'todas' || provinciaCard === provincia;

                if (matchTipo && matchZona && matchEstado && matchProvincia) {
                    card.classList.remove('hidden-card');
                    visibles++;
                } else {
                    card.classList.add('hidden-card');
                }
            });

            if (msgSinResultados) {
                msgSinResultados.style.display = (visibles === 0) ? 'block' : 'none';
            }

            // En móvil, cerrar la barra desplegable tras aplicar filtros para ver los resultados
            if (window.innerWidth <= 992) {
                const sidebarComp = btnAplicarFiltros.closest('.sidebar');
                if (sidebarComp) sidebarComp.classList.remove('is-open');
            }
        });
    }

    // Lógica de filtrado de Renta
    const btnAplicarFiltrosRenta = document.getElementById('btnAplicarFiltrosRenta');
    if (btnAplicarFiltrosRenta) {
        btnAplicarFiltrosRenta.addEventListener('click', () => {
            const tiposRenta = Array.from(document.querySelectorAll('.filtro-tipo-renta:checked')).map(cb => cb.value);
            const zonaRenta = document.querySelector('.filtro-zona-renta:checked')?.value || 'todos';
            const provinciaRenta = document.getElementById('filtroProvinciaRenta')?.value || 'todas';

            const tarjetasRenta = document.querySelectorAll('.propiedad-renta');
            const msgSinRentas = document.getElementById('mensajeSinRentas');
            let visiblesRenta = 0;

            tarjetasRenta.forEach(card => {
                const tipoCard = card.dataset.tipo;
                const zonaCard = card.dataset.zona;
                const provinciaCard = card.dataset.provincia;

                const matchTipo = tiposRenta.length === 0 || tiposRenta.includes(tipoCard);
                const matchZona = zonaRenta === 'todos' || zonaCard === zonaRenta;
                const matchProvincia = provinciaRenta === 'todas' || provinciaCard === provinciaRenta;

                if (matchTipo && matchZona && matchProvincia) {
                    card.classList.remove('hidden-card');
                    visiblesRenta++;
                } else {
                    card.classList.add('hidden-card');
                }
            });

            if (msgSinRentas) {
                msgSinRentas.style.display = (visiblesRenta === 0) ? 'block' : 'none';
            }

            // En móvil, cerrar la barra desplegable tras aplicar filtros
            if (window.innerWidth <= 992) {
                const sidebarRenta = btnAplicarFiltrosRenta.closest('.sidebar');
                if (sidebarRenta) sidebarRenta.classList.remove('is-open');
            }
        });
    }


    /* --- 4. PLANO INTERACTIVO Y NAVEGACIÓN --- */
    const roomPaths = document.querySelectorAll('.room-path');
    const roomInfoContent = document.getElementById('roomInfoContent');

    if (roomPaths.length > 0 && roomInfoContent) {
        roomPaths.forEach(path => {
            path.addEventListener('click', () => {
                roomPaths.forEach(p => p.classList.remove('active'));
                path.classList.add('active');

                const title = path.dataset.title || 'Sección';
                const desc = path.dataset.desc || 'Información de la sección.';
                const icon = path.dataset.icon || '🏛️';

                roomInfoContent.innerHTML = `
                    <div class="room-icon-display">${icon}</div>
                    <h3 class="room-title-display">${title}</h3>
                    <p class="room-desc-display">${desc}</p>
                `;
            });
        });
    }

    // Menú flotante Scroll
    const mainNav = document.querySelector('nav');
    if (mainNav && !mainNav.classList.contains('nav-internal')) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainNav.classList.add('nav-scrolled');
            } else {
                mainNav.classList.remove('nav-scrolled');
            }
        }, { passive: true });
    }
});
