document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el mapa centrado en las coordenadas de la primera diapositiva
    var map = L.map('map').setView([4.664628, -74.064095], 19);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 21
    }).addTo(map);

    // Configuración de las capas WMS
    var wmsLayers = [
        {
            url: 'https://geoserver.scrd.gov.co/geoserver/Investigacion_Cultured_Maps/wms',
            layerName: 'Investigacion_Cultured_Maps:Localidad_Storymap_RolMujer',
            displayName: 'Localidad'
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

    // Manejar el clic en el mapa para obtener información sobre las capas WMS
map.on('click', function (e) {
    // URL de la capa WMS a consultar
    var wmsUrl = 'https://geoserver.scrd.gov.co/geoserver/Investigacion_Cultured_Maps/wms';

    // Construir la URL de la petición GetFeatureInfo
    var url = wmsUrl + L.Util.getParamString({
        request: 'GetFeatureInfo',
        service: 'WMS',
        srs: 'EPSG:4326',
        styles: '',
        version: '1.1.1', // La versión de tu WMS
        format: 'image/png',
        transparent: true,
        bbox: map.getBounds().toBBoxString(),
        height: map.getSize().y,
        width: map.getSize().x,
        layers: 'Investigacion_Cultured_Maps:Actores_BasuraNoPaisaje,Investigacion_Cultured_Maps:Residuos_BasuraNoPaisaje,Investigacion_Cultured_Maps:Escenarios_BasuraNoPaisaje', // Capas consultadas
        query_layers: 'Investigacion_Cultured_Maps:Actores_BasuraNoPaisaje,Investigacion_Cultured_Maps:Residuos_BasuraNoPaisaje,Investigacion_Cultured_Maps:Escenarios_BasuraNoPaisaje', // Capas a consultar
        info_format: 'application/json', // Formato de respuesta
        x: Math.floor(e.containerPoint.x),
        y: Math.floor(e.containerPoint.y)
    });

    // Realizar la petición GetFeatureInfo
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                var feature = data.features[0];
                var props = feature.properties;
                
                // Crear el contenido del popup con los atributos del objeto
                var content = '<b>Atributos:</b><br>';
                for (var key in props) {
                    if (props.hasOwnProperty(key)) {
                        content += `<b>${key}</b>: ${props[key]}<br>`;
                    }
                }

                // Mostrar el popup en el mapa en la ubicación del clic
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent(content)
                    .openOn(map);
            } else {
                // Si no hay características en la ubicación clicada
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent('No hay información disponible en este punto.')
                    .openOn(map);
            }
        })
        .catch(error => {
            console.error('Error al obtener los atributos:', error);
        });
});


    // Objeto para el control de capas
    var overlays = {}; // Objeto para almacenar las capas con nombres visibles en el control
    
    // Agregar capas WMS al mapa y al control de capas
    wmsLayers.forEach(function(wmsLayer) {
        // Crear la capa WMS
        var layer = L.tileLayer.wms(wmsLayer.url, {
            layers: wmsLayer.layerName,
            format: 'image/png',
            transparent: true,
            maxZoom: 21,
            minZoom: 0
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

    // función para despliegue de pop ups
    map.on('click', function (e) {
        // Coordenadas del clic
        var latlng = e.latlng;
        var bbox = map.getBounds().toBBoxString();
        var size = map.getSize();
    
        // Recorremos las capas activas del mapa
        Object.keys(overlays).forEach(function (displayName) {
            var layer = overlays[displayName];
    
            if (map.hasLayer(layer)) {
                var wmsParams = layer.wmsParams;
    
                var url = `${layer._url}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=${wmsParams.layers}` +
                          `&QUERY_LAYERS=${wmsParams.layers}&BBOX=${bbox}&FEATURE_COUNT=5&HEIGHT=${size.y}&WIDTH=${size.x}` +
                          `&INFO_FORMAT=application/json&SRS=EPSG:4326&X=${Math.floor(map.layerPointToContainerPoint(e.layerPoint).x)}` +
                          `&Y=${Math.floor(map.layerPointToContainerPoint(e.layerPoint).y)}`;
    
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.features && data.features.length > 0) {
                            var props = data.features[0].properties;
                            var content = `<b>${displayName}</b><br/>`;
                            for (var key in props) {
                                content += `<b>${key}:</b> ${props[key]}<br/>`;
                            }
                            L.popup()
                                .setLatLng(latlng)
                                .setContent(content)
                                .openOn(map);
                        }
                    })
                    .catch(err => {
                        console.error('Error en GetFeatureInfo:', err);
                    });
            }
        });
    });
});
