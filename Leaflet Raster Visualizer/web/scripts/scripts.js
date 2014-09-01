
var map;
$(document).ready(function() {
		
	var northEast = L.latLng(12.146745814539685,  4.5263671875);
	var southWest = L.latLng(4.357365927900159, -6.723632812499999);
	var bounds = L.latLngBounds(southWest, northEast);	    		
	map = L.map('map').fitBounds(bounds);
	L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
		zoom: 7,
	}).addTo(map);
	
	var indicator_code = 'PN05_RUR';
	var prefix = 'gha_';
	
	$.getJSON('data/'+prefix + indicator_code+'.json', function(result) {
		$.getJSON('data/'+indicator_code+'_legend.json', function(legend) {

			var rendererOptions = {
				'classes':legend['lgdcl'].split("|"),
				'colors':legend['lgdcr'].split("|"),
				'noDataValue':-999,
				'noDataColor':'transparent'
			};
			var rasterCanvasLayer = new RasterCanvasLayer();
			rasterCanvasLayer.renderer = getRasterCellRenderer(rendererOptions);
			rasterCanvasLayer.data = result['data'];
			rasterCanvasLayer.cell_height = parseFloat(result['cell_height']);
			rasterCanvasLayer.cell_width = parseFloat(result['cell_width']);
			rasterCanvasLayer.cols = parseInt(result['cols']);
			rasterCanvasLayer.rows = parseInt(result['rows']);
			rasterCanvasLayer.x_origin = parseFloat(result['x_origin']);
			rasterCanvasLayer.y_origin = parseFloat(result['y_origin']);
			rasterCanvasLayer.addTo(map);	
		});
	});
});

var RasterCanvasLayer = L.CanvasLayer.extend({
    render:function() {
    	
        var canvas = this.getCanvas();
        canvas.width = canvas.width;
        var context = canvas.getContext('2d');
        
    	var rasterOriginGEO = [this.y_origin, this.x_origin];
    	var rasterOriginMAP = map.latLngToLayerPoint(rasterOriginGEO);
    	var rasterOriginPX = map.layerPointToContainerPoint(rasterOriginMAP);
    	
    	var rasterCellDeltaGEO = [this.y_origin + this.cell_height, this.x_origin + this.cell_width];
    	var rasterCellDeltaMAP = map.latLngToLayerPoint(rasterCellDeltaGEO);
    	var rasterCellDeltaPX = map.layerPointToContainerPoint(rasterCellDeltaMAP);

        var cellSizeXPX = rasterCellDeltaPX.x - rasterOriginPX.x;
        var cellSizeYPX = rasterCellDeltaPX.y - rasterOriginPX.y;
        
        var renderer = this.renderer;

        var y = rasterOriginPX.y;
        this.data.forEach(function(row) {
        	        	
    		var x = rasterOriginPX.x;		
        	row.forEach(function(value) {
        		        		
        		var fillStyle = value == '' ? 'transparent':renderer(value);
				context.strokeWidth = 1.0;
    		   	context.lineWidth = 1.0;
			 	context.fillStyle = fillStyle;
				context.rect(x, y, cellSizeXPX, cellSizeYPX);
			    context.fillRect(x, y, cellSizeXPX, cellSizeYPX);
			    
    			x += cellSizeXPX;
        	});
    		y += cellSizeYPX;
        });
    }
});

function getRasterCellRenderer(options) {
	
	var classes = options.classes;
	var colors = options.colors;
	var noDataColor = options.noDataColor;
	var noDataValue = options.noDataValue;

	this.getCanvasStyleObjString = function(color) {
		return color;
	};
	var funcBody = "if(value == "+noDataValue+") { return '"+noDataColor+"'; }";
	for(var i=0, l=classes.length-1; i<l; i++) {
		funcBody += "else if(value >= " + classes[i] + " && value < " + classes[i + 1] + ") { return '"+colors[i]+"'; }";
	}
	funcBody += "else if(value > " + classes[classes.length-1] + ") { return '"+colors[i]+"'; }";
	funcBody += "else { return '"+noDataColor+"'; }";
	
	return new Function('value', funcBody);
}



