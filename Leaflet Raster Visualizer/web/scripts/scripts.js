
var map;
$(document).ready(function() {
		
	var northEast = L.latLng(12.146745814539685,  4.5263671875);
	var southWest = L.latLng(4.357365927900159, -6.723632812499999);
	var bounds = L.latLngBounds(southWest, northEast);	    		
	map = L.map('map',{
		crs:L.CRS.EPSG3857
	}).fitBounds(bounds);
	L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
		zoom: 7,
	}).addTo(map);
	
	var indicator_code = 'PN05_RUR';
	var prefix = 'GHA_';
	
	$.getJSON('data/rasters/'+prefix + indicator_code+'.json', function(result) {
		$.getJSON('data/legends/'+indicator_code+'_legend.json', function(legend) {

			var rendererOptions = {
				'classes':legend['lgdcl'].split("|"),
				'colors':legend['lgdcr'].split("|"),
				'noDataValue':'',
				'noDataColor':'transparent'
			};
			var options = {
				'renderer':getRasterCellRenderer(rendererOptions),
				'data':result['data'],
				'cell_height':parseFloat(result['cell_height']),
				'cell_width':parseFloat(result['cell_width']),
				'x_origin':parseFloat(result['x_origin']),
				'y_origin':parseFloat(result['y_origin']),
				'map':map
			};
			var rasterCanvasLayer = new L.RasterCanvasLayer(options);
			rasterCanvasLayer.addTo(map);	
		});
	});
});

function getRasterCellRenderer(options) {
	
	var classes = options.classes;
	var colors = options.colors;
	var noDataColor = options.noDataColor;
	var noDataValue = options.noDataValue;

	this.getCanvasStyleObjString = function(color) {
		return color;
	};
	var funcBody = "if(value == '"+noDataValue+"') { return '"+noDataColor+"'; }";
	for(var i=0, l=classes.length-1; i<l; i++) {
		funcBody += "else if(value >= " + classes[i] + " && value < " + classes[i + 1] + ") { return '"+colors[i]+"'; }";
	}
	funcBody += "else if(value > " + classes[classes.length-1] + ") { return '"+colors[i]+"'; }";
	funcBody += "else { return '"+noDataColor+"'; }";
	
	return new Function('value', funcBody);
}



