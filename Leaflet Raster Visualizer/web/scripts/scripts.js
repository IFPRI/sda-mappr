
var map;
$(document).ready(function() {
		
	var northEast = L.latLng(12.146745814539685,  4.5263671875);
	var southWest = L.latLng(4.357365927900159, -6.723632812499999);
	var bounds = L.latLngBounds(southWest, northEast);	    		
	map = L.map('map',{
	}).fitBounds(bounds);
	L.tileLayer('http://{s}.tiles.mapbox.com/v3/github.map-xgq2svrz/{z}/{x}/{y}.png', {
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

	var funcBody = "if(value == '"+noDataValue+"') { return '"+noDataColor+"'; }";
	funcBody += "else if(value < " + classes[0] + ") { return '"+colors[0]+"'; }";
	for(var i=0, l=classes.length-1; i<l; i++) {
		funcBody += "else if(value >= " + classes[i] + " && value <= " + classes[i + 1] + ") { return '"+colors[i]+"'; }";
	}
	funcBody += "else if(value > " + classes[classes.length-1] + ") { return '"+colors[classes.length-1]+"'; }";
	funcBody += "else { return '"+noDataColor+"'; }";
		
	return new Function('value', funcBody);
}



