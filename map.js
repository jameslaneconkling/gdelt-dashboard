;(function(context) {

  var gdelt = {
    mapLayers: {},
    ramp: ['transparent','#FFCC00','#FFAA11','#FF8822','#FF6633','#FF4444','#FF2255'],
    bins: [0,1,4,16,64,256,1024],
    global: function(){
      this.init_map();
      $('.arrow').on('click', this.arrowSlide);
      $('.calendar').on('click', 'a', this.calendarRedraw);
      $('.calendar-switcher').on('click', 'a', this.switchCalendar);
      // trigger initial view
      $('.calendar-switcher').children('a[data-id="syria"]').trigger('click');
    },

    init_map: function(){
      L.mapbox.accessToken = 'pk.eyJ1IjoiaGVsc2lua2kiLCJhIjoia1lFZVlNZyJ9.dVxyXwMZWRmnrXnmOuWAMQ';

      this.map = L.mapbox.map('map', 'james-lane-conkling.5630f970', {
        minZoom: 7,
        maxZoom: 16,
        attributionControl: false,
        shareControl: true
      })
        .setView([34.6, 39.0], 7);

      var mapLegend = L.mapbox.legendControl({ position:'topright' })
        .addLegend($('.legend-container').html());
      this.map.addControl(mapLegend);
    },

    arrowSlide: function(e){
      e.preventDefault();
      e.stopPropagation();

      var $this = $(this),
        $contentContainer = $('.content-container');

      if($this.hasClass('active')) {
        $this.removeClass('active');
        $contentContainer.removeClass('active');
      } else {
        $this.addClass('active');
        $contentContainer.addClass('active');
      }
    },

    switchCalendar: function(e){
      e.preventDefault();
      e.stopPropagation();

      var $this = $(this),
          layerId = $this.data('id'),
          nav = $this.data('nav');

      //short circuit if button already active
      // if($this.hasClass('active')) return

      gdelt.removeGridLayers()

      $this.addClass('active').siblings('.active').removeClass('active');

      $this.parent('.calendar-switcher').siblings('.calendar').find('li:first a').trigger('click');

      gdelt.map.setView([nav[0], nav[1]], nav[2]);
    },

    calendarRedraw: function(e){
      e.preventDefault();
      e.stopPropagation();

      var $this = $(this),
          layer = $this.parents('.calendar').siblings('.calendar-switcher').children('a.active').data('id');
          date = $this.data('date');

      // short circuit if button already active
      // if($this.hasClass('active')) return

      // if map doesn't already have layer, add and recolor; otherwise, simply add
      // probably not needed w/ current implementation, as there is always a gridLayer on map
      if( ! gdelt.map.hasLayer(gdelt.mapLayers[layer]) ){
        gdelt.addGridLayer(layer).on('ready', function(){
          gdelt.reColor(this, date, gdelt.bins, gdelt.ramp);
        });
      }else{
        gdelt.reColor(gdelt.mapLayers[layer], date, gdelt.bins, gdelt.ramp);
      }


      $('.calendar a.active').removeClass('active');
      $this.addClass('active');
    },

    // --helper functions--
    reColor: function(grid,field,bins,ramp){
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
    },

    addGridLayer: function(id,filter){
      if(id in gdelt.mapLayers){
        gdelt.mapLayers[id].addTo(gdelt.map);
      }else{
        gdelt.mapLayers[id] = L.mapbox.featureLayer()
          .loadURL(id + '.geojson')
          .setFilter(filter || function(cell){ return cell.properties['total'] > 0; })
          .on('ready', function(){
            this.setStyle({
              weight: 0.5,
              color: '#000',
              opacity:0.1
            })
          })
          .addTo(gdelt.map);
      }
      return gdelt.mapLayers[id];
    },

    removeGridLayers: function(){
      for(mapLayer in gdelt.mapLayers){
        if(gdelt.map.hasLayer(gdelt.mapLayers[mapLayer])){
          gdelt.map.removeLayer(gdelt.mapLayers[mapLayer]);
        }
      }
    }

  }
  window.gdelt = gdelt;
})(window);

gdelt.global();
