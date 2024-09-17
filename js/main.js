document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el mapa centrado en las coordenadas de la primera diapositiva
    var map = L.map('map').setView([4.664628, -74.064095], 18);

    // Agregar capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    // Configuración de las capas WMS
    var wmsLayers = [
        {
            url: 'https://geoserver.scrd.gov.co/geoserver/Investigacion_Cultured_Maps/wms',
            layerName: 'Investigacion_Cultured_Maps:Localidad_Storymap_RolMujer',
            displayName: 'Localidad Rol Mujer'
        },
        {
            url: 'https://geoserver.scrd.gov.co/geoserver/Investigacion_Cultured_Maps/wms',
            layerName: 'Investigacion_Cultured_Maps:Actores_BasuraNoPaisaje',
            displayName: 'Actores'
        },
        {
            url: 'https://geoserver.scrd.gov.co/geoserver/Investigacion_Cultured_Maps/wms',
            layerName: 'Investigacion_Cultured_Maps:Residuos_BasuraNoPaisaje',
            displayName: 'Residuos'
        },
        {
            url: 'https://geoserver.scrd.gov.co/geoserver/Investigacion_Cultured_Maps/wms',
            layerName: 'Investigacion_Cultured_Maps:Escenarios_BasuraNoPaisaje',
            displayName: 'Escenarios'
        }
    ];

    // Objeto para el control de capas
    var overlays = {}; // Objeto para almacenar las capas con nombres visibles en el control
    
    // Agregar capas WMS al mapa y al control de capas
    wmsLayers.forEach(function(wmsLayer) {
        // Crear la capa WMS
        var layer = L.tileLayer.wms(wmsLayer.url, {
            layers: wmsLayer.layerName,
            format: 'image/png',
            transparent: true
        });

        // Añadir la capa al objeto de overlays con su nombre visible
        overlays[wmsLayer.displayName] = layer;
        
        // Agregar la capa al mapa por defecto (opcional)
        layer.addTo(map);
        
        // Generar la leyenda
        addLegendItem(wmsLayer.url, wmsLayer.layerName, wmsLayer.displayName);
    });

    // Añadir control de capas al mapa
    L.control.layers(null, overlays, { collapsed: false }).addTo(map);

    // Función para agregar elementos a la leyenda
    function addLegendItem(wmsUrl, layerName, displayName) {
        var legendUrl = `${wmsUrl}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=${layerName}`;
        var legendContainer = document.getElementById('legend-content');

        // Crear el contenedor del ítem de la leyenda
        var legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        // Añadir título de la capa
        var legendTitle = document.createElement('div');
        legendTitle.className = 'legend-title';
        legendTitle.innerText = displayName;
        legendItem.appendChild(legendTitle);

        // Añadir imagen de la leyenda
        var legendImage = document.createElement('img');
        legendImage.src = legendUrl;
        legendImage.alt = `Leyenda de ${displayName}`;
        legendItem.appendChild(legendImage);

        // Añadir el ítem al contenedor de la leyenda
        legendContainer.appendChild(legendItem);
    }

    // Función para minimizar/desplegar la leyenda
    document.getElementById('toggle-legend').addEventListener('click', function() {
        var legend = document.getElementById('legend');
        var legendContent = document.getElementById('legend-content');
        if (legend.classList.contains('minimized')) {
            legend.classList.remove('minimized');
            this.textContent = 'Minimizar';
        } else {
            legend.classList.add('minimized');
            this.textContent = 'Desplegar';
        }
    });

    // Función para cambiar la vista del mapa
    function changeMapView(lat, lng, zoom) {
        map.setView([lat, lng], zoom);
    }

    // Manejar las diapositivas
    var slides = document.querySelectorAll('.slide');

    // Crear el índice
    var indexContainer = document.getElementById('index');
    slides.forEach(function(slide, index) {
        if (index > 0) {
            var button = document.createElement('button');
            button.textContent = 'Diapositiva ' + index;
            button.className = 'index-button';
            button.addEventListener('click', function() {
                var lat = parseFloat(slide.getAttribute('data-lat'));
                var lng = parseFloat(slide.getAttribute('data-lng'));
                var zoom = parseInt(slide.getAttribute('data-zoom'));
                changeMapView(lat, lng, zoom);
                slide.scrollIntoView({behavior: 'smooth'});
            });
            indexContainer.appendChild(button);
        }
    });

    // Manejar el clic en cada diapositiva
    slides.forEach(function(slide) {
        slide.addEventListener('click', function() {
            var lat = parseFloat(slide.getAttribute('data-lat'));
            var lng = parseFloat(slide.getAttribute('data-lng'));
            var zoom = parseInt(slide.getAttribute('data-zoom'));
            changeMapView(lat, lng, zoom);
        });
    });

    // Manejar el botón para volver al índice
    var backToIndexButton = document.getElementById('backToIndexButton');
    backToIndexButton.addEventListener('click', function() {
        var indexSlide = slides[0];
        var lat = parseFloat(indexSlide.getAttribute('data-lat'));
        var lng = parseFloat(indexSlide.getAttribute('data-lng'));
        var zoom = parseInt(indexSlide.getAttribute('data-zoom'));
        changeMapView(lat, lng, zoom);
        indexSlide.scrollIntoView({behavior: 'smooth'});
    });
});
