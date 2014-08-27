L.mapbox.accessToken = 'pk.eyJ1IjoiaGVsc2lua2kiLCJhIjoia1lFZVlNZyJ9.dVxyXwMZWRmnrXnmOuWAMQ';

var map = L.mapbox.map('map', 'james-lane-conkling.5630f970', {
    minZoom: 7,
    maxZoom: 16,
    attributionControl: false,
    shareControl: true
})
    .setView([34.6, 39.0], 7);

var mapLegend = L.mapbox.legendControl({ position:'topright' }).addLegend(
    $('.legend-container').html());
map.addControl(mapLegend);

var grid = L.mapbox.featureLayer()
        .loadURL('pntcnt.geojson')
        .setFilter(function(cell){
            return cell.properties['total'] > 0;
        })
        .addTo(map);

// var grid = omnivore.topojson('pntcnt.topojson')
//             .setStyle({
//                 weight: 0.5,
//                 color: '#000',
//                 opacity:0.1
//             })
//             .addTo(map);

var ramp = ['transparent','#FFCC00','#FFAA11','#FF8822','#FF6633','#FF4444','#FF2255'];
var bins = [0,1,4,16,64,256,1024];

grid.on('ready', function(){
    grid.setStyle({
        weight: 0.2,
        color: '#444',
        opacity:1,
        fillColor: 'transparent'
    });
    grid.eachLayer(function(cell){
        if(cell.feature.properties['total'] > 0){
            var content = '<h2>Incidences of Conflict</h2><ul>' +
                '<li>Week 1:' + cell.feature.properties.d13_10_01 + '</li>' +
                '<li>Week 2:' + cell.feature.properties.d13_10_08 + '</li>' +
                '<li>Week 3:' + cell.feature.properties.d13_10_15 + '</li>' +
                '<li><strong>Total: ' + cell.feature.properties.total + '</strong></li>' +
                '</ul>';
            cell.bindPopup(content);
        }
    });
});

$('.arrow').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();

    var $this = $(this),
        $contentContainer = $('.content-container');

    if($this.hasClass('active')) {
        $this.removeClass('active');
        $contentContainer.removeClass('active');
    } else {
        $this.addClass('active');
        $contentContainer.addClass('active').find('.calendar a:first').trigger('click');
    }
});

$('.calendar').on('click', 'a', function(e){
    e.preventDefault();
    e.stopPropagation();

    var $this = $(this),
        field = $this.data('id');

    reColor(grid, field, bins, ramp);

    $('.calendar a.active').removeClass('active');
    $this.addClass('active');
});

$('.calendar-switcher').on('click', 'a', function(e){
    e.preventDefault();
    e.stopPropagation();

    var $this = $(this),
        newIndex = $this.data('index'),
        nav = $this.data('nav');

    var oldIndex = $this.addClass('active').siblings('.active').removeClass('active').data('index');

    $this.parent().next().removeClass('active' + oldIndex).addClass('active' + newIndex).find('ul:nth-child(' + newIndex + ') li:first a').trigger('click');

    map.setView([nav[0], nav[1]], nav[2]);
});


function reColor(grid,field,bins,ramp){
    // bin[n] defines the lower bound (inclusive) of the nth bin
    // field.length must equal bins.length
    // cells w/ values smaller than the value of the first bin will not be styled
    grid.eachLayer(function(cell){
        var p = cell.feature.properties;

        for(var i=0;i<bins.length;i++){
            // first check if it's the last bin
            if(i+1 === bins.length){
                cell.setStyle({
                    fillColor:ramp[i]
                });
                break;
            }else if(p[field]>=bins[i] && p[field]<bins[i+1]){
                cell.setStyle({
                    fillColor:ramp[i]
                });
                break;
            }
        }

    });
}

