
var map;

function unPackData(packedData) {
	
    var data = [];
    packedData.forEach(function(row) {
    	var newRow = [];
    	row.forEach(function(v) {
    		if(v === "" || !isNaN(v)) {
    			newRow.push(v);
    		}
    		else if(v['c']) {
    			var count = v['c'];
    			var value = v['v'];
    			for(var i=0;i<count;i++) {
        			newRow.push(value);
    			}
    		}
    	});
    	data.push(newRow);
    });
    return data;
}

function loadLayer(layerObj, callback) {
	
	var prefix = layerObj['prefix'];
	var indicator_code = layerObj['indicator_code'];
	
	$.getJSON('data/rasters/'+prefix + indicator_code+'.json', function(result) {
		$.getJSON('data/legends/'+indicator_code+'_legend.json', function(legend) {

			var valueClassLabels = legend['lgdlb'];
			var valueClasses = legend['lgdcl'];
			var valueColors = legend['lgdcr'];
			
			var rendererOptions = {
				'classes':valueClasses,
				'colors':valueColors,
				'noDataValue':'',
				'noDataColor':'transparent'
			};
			
			var isCategorized = result['isCategorized'];
			
			var cellRenderer = null;
			if(isCategorized) {
				valueClasses = valueClasses.map(function(v) {
					return parseInt(v);
				});	
				cellRenderer = getCategorizedRasterCellRenderer(rendererOptions);
			}
			else {
				cellRenderer = getRasterCellRenderer(rendererOptions);
			}
			
			var data = unPackData(result['data']);
			var options = {
				'renderer':cellRenderer,
				'data':data,
				'cell_height':parseFloat(result['cell_height']),
				'cell_width':parseFloat(result['cell_width']),
				'x_origin':parseFloat(result['x_origin']),
				'y_origin':parseFloat(result['y_origin']),
				'map':map,
				'onClick':function(e) {
					var value = e.pixelValue;
					if(isCategorized) {
						value = valueClassLabels[valueClasses.indexOf(value)];
					}
					else {
						value = value.toFixed(3);
					}
					var html = "<div>Pixel value: "+value+"</div>";
			        L.popup().setLatLng([e.latlng.lat, e.latlng.lng]).setContent(html).openOn(map);
				}
			};
			var rasterCanvasLayer = new L.RasterCanvasLayer(options);
			layerObj['layer'] = rasterCanvasLayer;
			
			var rangeSliderControls = $("#rangeSliderControls");
			
			if(!isCategorized) {
	
				var onInputChange = function() {
					setTimeout(function() {
						rasterCanvasLayer.setValueRange(parseFloat(minValueInput.val()), parseFloat(maxValueInput.val()));
					}, 250);
				};
				
				var minValueInput = $('#minValue').on("keyup", onInputChange);
				var maxValueInput = $('#maxValue').on('keyup', onInputChange);
				
				var onValueRangeChange = function(min, max) {
					minValueInput.val(parseFloat(min).toFixed(3));
					maxValueInput.val(parseFloat(max).toFixed(3));				
					rasterCanvasLayer.setValueRange(min, max);
				};
				
				var minValue = result['min_value'];
				var maxValue = result['max_value'];
				onValueRangeChange(minValue, maxValue);
				
				var rangeSliderNode = $('<div>').attr("id", "rangeSlider");
				$('#rangeSliderContainer').empty().append(rangeSliderNode).show();
				
				var rangeSlider = rangeSliderNode.noUiSlider({
					range: {'min':minValue, 'max':maxValue},
					start: [minValue, maxValue],
					connect: true,
					step: 1
				});
				rangeSlider.on("slide", function(e) {
					var rangeValues = rangeSlider.val();
					var min = rangeValues[0];
					var max = rangeValues[1];
					onValueRangeChange(min, max);
				});
				rangeSliderControls.show();
			}
			else {
				rangeSliderControls.hide();
			}
			addLegend(isCategorized, valueClasses, valueColors, valueClassLabels, function(selectedValues) {
				rasterCanvasLayer.setActiveClassValues(selectedValues);
			});
			callback();
		});
	});
}

function addLegend(isCategorized, valueClasses, valueColors, valueClassLabels, onClickCallback) {
	
	var activeClassValues = [];
	var classCheckboxes = $("#classCheckboxes");
	classCheckboxes.empty();
	
	valueClassLabels.forEach(function(className, idx) {
		
		var classValue = valueClasses[idx];
		var classColor = valueColors[idx];
		
		var row = $("<div>").addClass("classRow").appendTo(classCheckboxes);

		if(isCategorized) {
			$("<div>").addClass("classCheckbox checkBoxSelected").appendTo(row).click(function() {
				
				if($(this).hasClass("checkBoxSelected")) {				
					if(isCategorized) {
						$(this).removeClass("checkBoxSelected");
						activeClassValues = activeClassValues.filter(function(v) {
							return v !== classValue;
						});	
					}
				}
				else {
					if(isCategorized) {
						$(this).addClass("checkBoxSelected");
						activeClassValues.push(classValue);
					}
				}
				if(isCategorized) {
					onClickCallback(activeClassValues);
				}
			});	
			activeClassValues.push(classValue);
		}
		
		$("<div>").addClass("legendSwatch").css("background", classColor).appendTo(row);
		$("<div>").addClass("classLabel").html(className).appendTo(row);
	});
	if(isCategorized) {
		onClickCallback(activeClassValues);
	}
}

$(document).ready(function() {
			
	var northEast = L.latLng(11.759814674441921, 4.592285156249999);
	var southWest = L.latLng(4.444997369727273, -6.65771484375);
	var bounds = L.latLngBounds(southWest, northEast);	    		
	map = L.map('map',{
	}).fitBounds(bounds);
	L.tileLayer('http://{s}.tiles.mapbox.com/v3/github.map-xgq2svrz/{z}/{x}/{y}.png', {
		zoom: 7,
	}).addTo(map);
	
	var prefix = 'GHA_';
	var layerListNode = $("#layerList");
	var controlsNode = $("#controls");
	
	var layers = [];
	layers.push({prefix:prefix, indicator_code:'TT_50K', label:'Travel time (50K)'});
	layers.push({prefix:prefix, indicator_code:'AEZ5_CLAS', label:'AEZ-5 Class'});
	layers.push({prefix:prefix, indicator_code:'BMI', label:'Body Mass Index'});
	layers.push({prefix:prefix, indicator_code:'PN05_RUR', label:'Rural Population 2005'});

	layers.forEach(function(layerObj) {
		
		var row = $("<div>").addClass("classRow").appendTo(layerListNode);
		$("<div>").addClass("classCheckbox").appendTo(row).click(function() {
			
			if($(this).hasClass("checkBoxSelected")) {
				
				$(this).removeClass("checkBoxSelected");
				map.removeLayer(layerObj['layer']);
				layerObj['active'] = 0;
				controlsNode.hide();
			}
			else {
				
				$(this).addClass("checkBoxSelected");
				loadLayer(layerObj, function() {
					layerObj['layer'].addTo(map);
					layerObj['active'] = 1;
					controlsNode.show();
				});
			}
		});
		$("<div>").addClass("classLabel").html(layerObj['label']).appendTo(row);
	});
	
	map.on("click", function(e) {
		layers.forEach(function(layerObj) {
			if(layerObj['active']) {
				layerObj['layer'].highlightPixelsWithSameValue(e);
			}
		});
	});	
});

function getRasterCellRenderer(options) {
	
	var classes = options.classes;
	var colors = options.colors;
	var noDataColor = options.noDataColor;
	var noDataValue = options.noDataValue;

	var funcBody = "if(value === '"+noDataValue+"') { return '"+noDataColor+"'; }";
	funcBody += "else if(value < " + classes[0] + ") { return '"+colors[0]+"'; }";
	for(var i=0, l=classes.length; i<l; i++) {
		funcBody += "else if(value >= " + classes[i] + " && value <= " + classes[i + 1] + ") { return '"+colors[i + 1]+"'; }";
	}
	funcBody += "else if(value > " + classes[classes.length-2] + ") { return '"+colors[classes.length-1]+"'; }";
	funcBody += "else { return '"+noDataColor+"'; }";
		
	return new Function('value', funcBody);
}
function getCategorizedRasterCellRenderer(options) {
	
	var classes = options.classes;
	var colors = options.colors;
	var noDataColor = options.noDataColor;
	var noDataValue = options.noDataValue;

	var funcBody = "if(value === '"+noDataValue+"') { return '"+noDataColor+"'; }";
	for(var i=0, l=classes.length-1; i<l; i++) {
		funcBody += "else if(value == " + classes[i] + ") { return '"+colors[i]+"'; }";
	}
	funcBody += "else { return '"+noDataColor+"'; }";
		
	return new Function('value', funcBody);
}
