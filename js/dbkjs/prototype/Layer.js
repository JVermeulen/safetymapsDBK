var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.Layer = dbkjs.Class({
    url: 'dbkjs.prototype.layer.url',
    id: "dbkjs.prototype.layer." + new Date().getTime(),
    namespace: 'dbkjs.prototype.layer.namespace',
    visibility: false,
    layer: null,
    map: null,
    div: null,
    initialize: function(options) {
        options.visibility = options.visibility || false;
        options.singleTile = options.singleTile || false;
        this.options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.extend(this, options);
        var layerOptions = OpenLayers.Util.extend({
            format: 'image/png', 
            transparent: true
        }, options.layerOptions);
        
        if(!options.singleTile){
            layerOptions.tiled = true;
            layerOptions.tilesorigin = dbkjs.map.maxExtent.left + ',' + dbkjs.map.maxExtent.bottom;
        }
        
        this.id = OpenLayers.Util.createUniqueID("dbkjs_layer_");
        this.div = $('<div class="panel"></div>');
        this.div.attr('id', 'panel_' + this.id);
        //layers moet worden meegegeven in de opties
        this.layer = new OpenLayers.Layer.WMS(options.name, options.url,
                layerOptions,
                {
                    transitionEffect: 'none',
                    singleTile: options.singleTile,
                    buffer: 0,
                    isBaseLayer: false,
                    visibility: options.visibility
                }
        );
        this.layer.dbkjsParent = this;
        //let op, de map moet worden meegegeven in de opties
        options.map.addLayers([this.layer]);
        var _obj = this;
        this.layer.events.register("loadstart", this.layer, function() {
            dbkjs.util.loadingStart(_obj.layer);
        });

        this.layer.events.register("loadend", this.layer, function() {
            dbkjs.util.loadingEnd(_obj.layer);
        });
        // @todo functie maken om layerindex dynamisch te toveren 0 is onderop de stapel
        if (options.index) {
            options.map.setLayerIndex(this.layer, options.index);
        } else {
            options.map.setLayerIndex(this.layer, 0);
        }

        var dv_panel_heading = $('<div class="panel-heading"></div>');
        var dv_panel_title = $('<h4 class="panel-title"></div>');
        dv_panel_title.append('<input type="checkbox" name="box_' + this.id + '"/>&nbsp;');
        dv_panel_title.append(this.layer.name + '&nbsp;<a  class="accordion-toggle" data-toggle="collapse" href="#collapse_' +
                this.id + '" data-parent="' + options.parent + '" ><i class="icon-info-sign"></i></a>');
        dv_panel_heading.append(dv_panel_title);
        this.div.append(dv_panel_heading);
        var dv_panel_content = $('<div id="collapse_' + this.id + '" class="panel-collapse collapse"></div>');
        //dv_panel_content.append('');
        this.div.append(dv_panel_content);
        $(options.parent).append(this.div);
        $(options.parent).sortable({handle: '.panel'});
        if (this.layer) {
            if (this.layer.getVisibility()) {
                //checkbox aan
                $('input[name="box_' + this.id + '"]').attr('checked', 'checked');
            }
            var that = this;
            $('input[name="box_' + this.id + '"]').click(function() {
                if ($(this).is(':checked')) {
                    that.layer.setVisibility(true);
                } else {
                    that.layer.setVisibility(false);
                }
            });
        }
    },
    getfeatureinfo: function(e) {
        _obj = this;
        var params = {
            REQUEST: "GetFeatureInfo",
            EXCEPTIONS: "application/vnd.ogc.se_xml",
            BBOX: this.map.getExtent().toBBOX(),
            SERVICE: "WMS",
            INFO_FORMAT: 'application/vnd.ogc.gml',
            QUERY_LAYERS: this.layer.params.LAYERS,
            FEATURE_COUNT: 50,
            Layers: this.layer.params.LAYERS,
            WIDTH: this.map.size.w,
            HEIGHT: this.map.size.h,
            format: 'image/png',
            styles: this.layer.params.STYLES,
            srs: this.layer.params.SRS
        };

        // handle the wms 1.3 vs wms 1.1 madness
        if (this.layer.params.VERSION === "1.3.0") {
            params.version = "1.3.0";
            params.j = e.xy.x;
            params.i = e.xy.y;
        } else {
            params.version = "1.1.1";
            params.x = e.xy.x;
            params.y = e.xy.y;
        }
        OpenLayers.Request.GET({url: this.url, "params": params, callback: this.panel, scope: _obj});
        //OpenLayers.Event.stop(e);
    },
    panel: function(response) {
        _obj = this;
        //verwerk de featureinformatie
        g = new OpenLayers.Format.GML.v3();

        features = g.read(response.responseText);
        if (features.length > 0) {
            html = '<div class="table-responsive"><table class="table table-hover">';
            for (var feat in features) {
                for (var j in features[feat].attributes) {
                    if ($.inArray(j, ['Name', 'No', 'Latitude', 'Longitude']) === -1) {
                        if (typeof (features[feat].attributes[j]) !== "undefined" && features[feat].attributes[j] !== "") {
                            html += '<tr><td>' + j + '</td><td>' + features[feat].attributes[j] + '</td></tr>';
                        }
                    }
                }
            }
            html += '</table></div>';
            dbkjs.util.appendTab(dbkjs.wms_panel.attr("id"), _obj.layer.name, html, true, _obj.id + '_pn');
            $('#wmsclickpanel').show();
        } else {
            dbkjs.util.removeTab(dbkjs.wms_panel.attr("id"), _obj.id + '_pn');
        }
    }
});