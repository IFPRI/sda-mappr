//var IDENTIFY_HOST = 'localhost';
var IDENTIFY_HOST = '54.191.215.52';
var HOST = '54.191.215.52:3001';
//var HOST = 'localhost:3001';
var RASTER_IDENTIFY_HOST = 'http://'+IDENTIFY_HOST+':3000/identify';
var HC_API_URL = 'http://dev.harvestchoice.org/HarvestChoiceApi/0.3/api/cellvalues';

var mapController = null;
var mapIdentiftyController = null;
var permaLinkController = null;
var basemapPickerController = null;
var mapLayerListController = null;
var mapLegendController = null;
var imageExportController = null;
var mapSlideOutContainerController = null;
var layerMenuController = null;
var indicatorMetaDataController = null;
var indicatorController = null;
var analysisToolsDrawerController = null;
var timesliderController;
var hcMapIdentiftyController;

var LoadingController = new LoadingSpinnerController("body");
LoadingController.show("Loading");

function getParameterID(key) {
	
	return 'gha';
	
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars[key];
}

$(window).ready(function() {
		
	initLayout(function() {
				
		var id = getParameterID('id');
		initChalkboardOverlay();
		$("#resetMapButton").click(resetMap);
		
		updateUIHeight();
		$(window).resize(updateUIHeight);
				
		executeGETRequest("data/"+id+".json", function(configObj) {
			
			$("#logoText").html(configObj['title']);
			
			var mapConfig = configObj['mapConfig'];
			var layerMenuObj = configObj['layerMenuConfig'];
			
			mapSlideOutContainerController = new MapSlideOutContainerController();
			mapSlideOutContainerController.initSlideOutContainer("basemapsNub", "exitBasemapsButton", "basemaps");
			mapSlideOutContainerController.initSlideOutContainer("layerLegendNub", "exitLayerLegendButton", "layerLegends");
			
			layerMenuController = new LayerMenuController(layerMenuObj);
			indicatorController = new IndicatorController();
			
			mapController = new MapController({
				'defaultBounds':mapConfig['defaultBounds'],
				'mapOptions':{
					'minZoom':2,
					'maxZoom':8
				}
			});
						
			permalinkController = new PermalinkController();
			basemapPickerController = new BaseMapPickerController({'defaultBasemap':'Standard OpenStreetMap'});
			hcMapIdentiftyController = new HCIdentifyController();
			mapIdentiftyController = new MapIdentifyController('mappr');
			mapLayerListController = new MapLayerListController();
			mapLegendController = new MapLegendController();
			imageExportController = new ImageExportController($("body"));
			analysisToolsDrawerController = new AnalysisToolsDrawerController();
			
			indicatorController.addOnIndicatorAddHook(hcMapIdentiftyController);
			indicatorController.addOnIndicatorRemoveHook(hcMapIdentiftyController);
			
			augementControllerWithGlobalBehaviors(mapSlideOutContainerController);
			augementControllerWithGlobalBehaviors(layerMenuController);
			augementControllerWithGlobalBehaviors(indicatorController);
			augementControllerWithGlobalBehaviors(mapController);
			augementControllerWithGlobalBehaviors(permalinkController);
			augementControllerWithGlobalBehaviors(basemapPickerController);
			augementControllerWithGlobalBehaviors(mapIdentiftyController);
			augementControllerWithGlobalBehaviors(hcMapIdentiftyController);
			augementControllerWithGlobalBehaviors(mapLayerListController);
			augementControllerWithGlobalBehaviors(mapLegendController);
			augementControllerWithGlobalBehaviors(imageExportController);
			
			indicatorController.addObserver('onIndicatorSelectRequest', layerMenuController);	
			layerMenuController.addObserver('onLayerSelected', indicatorController);
			permalinkController.addObserver('onPermalinkLoad', mapController);
			permalinkController.addObserver('onPermalinkLoad', basemapPickerController);
			permalinkController.addObserver('onPermalinkLoad', indicatorController);
			basemapPickerController.addObserver("onBasemapChange", mapController);
			imageExportController.addObserver('onPermalinkRequest', permalinkController);
			mapController.addObserver('onMapClick', hcMapIdentiftyController);
			mapController.addObserver('onMapClick', mapIdentiftyController);
			mapLayerListController.addObserver('onIndicatorReorder', mapController);
			permalinkController.addObserver('onPermalinkCreate', mapController);
			permalinkController.addObserver('onPermalinkCreate', basemapPickerController);
			permalinkController.addObserver('onPermalinkCreate', indicatorController);	
			permalinkController.addObserver('onPermalinkShown', imageExportController);
			mapSlideOutContainerController.addObserver('onMapSlideOutMenuOpen', permalinkController);
			mapSlideOutContainerController.addObserver('onMapSlideOutMenuClose', permalinkController);
			imageExportController.addObserver('onImageExportMenuShown', permalinkController);
			layerMenuController.addObserver('onLayerMenuOpenOrCloseEvent', mapController);
			layerMenuController.addObserver('onLayerDeSelected', indicatorController);
			mapLayerListController.addObserver("onClearAllButtonClick", layerMenuController);
			mapController.addObserver('onMapLoaded', basemapPickerController);		
			mapController.addObserver('onMapLoaded', permalinkController);
				
			LoadingController.hide();
			updateUIHeight();
		});
	});
});

function augementControllerWithGlobalBehaviors(controller) {
	
	controller.showLoading = LoadingController.show;
	controller.hideLoading = LoadingController.hide;
	controller.executeCSS3Animation = executeCSS3Animation;
	controller.executeGETRequest = executeGETRequest;
}

function initChalkboardOverlay() {
	
	var chalkboardWrapper = $(".chalkboardWrapper");
	var name = 'hideChalkboardCountryMAPPR';  
	var value = localStorage.getItem(name);
	if(value) {
		chalkboardWrapper.hide();
	}
	else {
		chalkboardWrapper.show();
        localStorage.setItem(name, 1);  
	}
	$('.chalkboardCloseButtonWrapper').click(function() {
		chalkboardWrapper.hide();
	});
	$("#helpButton").click( function() {
		chalkboardWrapper.is(':hidden') ? chalkboardWrapper.show():chalkboardWrapper.hide();
	});
}

function resetMap() {
	
	layerMenuController.reset();
	permalinkController.reset();
	imageExportController.reset();
	mapSlideOutContainerController.reset();
	mapController.reset();
	analysisToolsDrawerController.reset();
}

function initLayout(callback) {
	
	var layout = $('body').layout({
		applyDefaultStyles:false,
	    spacing_open:0,
	    spacing_closed:0,
	    slidable:false,
	    togglerLength_closed:0,
	    onload_end:callback
	});
	
	var headerAndFooterHeight = 34;
	layout.sizePane("north", headerAndFooterHeight);
	layout.sizePane("south", headerAndFooterHeight);
}

function updateUIHeight() {
	
	var extraHeight = $("footer").height() + $("header").height();
	var headerHeight = $("header").height();
	var bodyWidth = $('body').width();
	var bodyHeight = $('body').height();
	var contentHeight = bodyHeight - extraHeight;
	var contentWidth = bodyWidth;
	
	var layerMenuNubWidth = 20;
	var analysisContainerWidth = contentWidth - $("#layerMenu").width() - layerMenuNubWidth;
	$("#analysisToolsContainer").height(contentHeight);
	$("#analysisToolsContainerButton").height(contentHeight);
	
	$(".mapContainer").height(contentHeight).css({top:0});
	$("#layerMenu").height(contentHeight).css({top:0});
	$("#map").height(contentHeight).css({top:0});
}

function executeCSS3Animation(node, onAnimationEnd) {
	node.on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(event) {
		node.off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
		onAnimationEnd();
	});	
}

function executeGETRequest(url, callback) {
	
	LoadingController.show("Loading");
	$.getJSON(url, function(result) {
		callback(result);
	}).always(function() {
		LoadingController.hide();
	});
}


function AnalysisToolsDrawerController() {
	
	var self = this;
	self._DrawerIsOpen = false;
	self._OpenAndCloseButtonNode = $("#analysisToolsContainerButton");
	self._DrawerContainerNode = $("#analysisToolsContainer");

	this.reset = function() {
		self._closeAnalysisToolsDrawer();
	};
	
	self._initAnalysisToolButton = function(key) {
		$("#"+key+"Button").click(function() {
			$("#"+key+"Drawer").show().siblings(".analysisToolDrawer").hide();
		});
	}

	self._openAnalysisToolsDrawer = function() {
		self._toggleContainer("translateMapButtonsLeft", "translateMapButtonsRight");
		self._DrawerContainerNode.css({right:40});
		self._DrawerIsOpen = true;
	};

	self._closeAnalysisToolsDrawer = function() {
		self._toggleContainer("translateMapButtonsRight", "translateMapButtonsLeft");
		self._DrawerContainerNode.css({right:-self._DrawerContainerNode.width()});
		self._DrawerIsOpen = false;
	};	
	
	self._toggleContainer = function(buttonAddClass, buttonRemoveClass) {
		$(".mapButtonStyle").addClass(buttonAddClass).removeClass(buttonRemoveClass);
		$("#mapContextToolsContainer").addClass(buttonAddClass).removeClass(buttonRemoveClass);
	};

	(function init() {
		
		self._OpenAndCloseButtonNode.click(function() {
			if(self._DrawerIsOpen) {
				self._closeAnalysisToolsDrawer();
			}
			else{
				self._openAnalysisToolsDrawer();
			}
		});

		self._initAnalysisToolButton('pointAndAreaAnalysisTool');
		self._initAnalysisToolButton('domainTool');
		self._initAnalysisToolButton('marketShedSummaryTool');
		self._initAnalysisToolButton('topCropsTool');
		self._initAnalysisToolButton('topAreasTool');
		self._initAnalysisToolButton('homoTool');
		
		$(".analysisToolBackButton").click(function() {
			$("#analysisToolMenuButtons").show().siblings(".analysisToolDrawer").hide();
		});
		
		self._closeAnalysisToolsDrawer();
		self._DrawerContainerNode.show();
	})();
}

function HCIdentifyController() {
	
	var self = this;
	self._Indicators = [];

	this.onIndicatorAdd = function(indicatorObj, indicators) {
		self._Indicators = indicators.filter(function(obj) {
			return obj['isCell5MIndicator'];
		});
	}; 
	
	this.onIndicatorRemove = function(indicatorObj, indicators) {
		self._Indicators = indicators.filter(function(obj) {
			return obj['isCell5MIndicator'];
		});
	};
	
	this.onIndicatorReorder = function(indicators) {

	};
		
	this.onMapClick = function(e, onMapClickResult) {
				
		var identifyLayers = [];
		var nonIdentifyLayers = [];
		self._Indicators.forEach(function(obj) {
			if(obj['isTimeConstant']) {
				identifyLayers.push(obj);
			}
		});
		
		var htmls = [];
		if(identifyLayers.length > 0) {
			self._executeIdentifyForLayers(e, identifyLayers, htmls, function() {
				self._showIdentifyInformation(htmls, onMapClickResult);
			});
		}
		else {
			onMapClickResult([]);
		}
	};
	
	self._getHTMLViewForIdentifyData = function(layerLabel, featureFields) {
		
		var html = '<div class="identifyBlock">';
		html += '<div class="identifyRow"><span class="identifyLabel">Indicator:</span><span>'+layerLabel+'</span></div>';
		featureFields.forEach(function(fieldInfo) {
			var fieldName = fieldInfo[0];
			var value = fieldInfo[1];
			html += '<div class="identifyRow"><span class="identifyLabel">'+fieldName+':</span><span>'+value+'</span></div>';
		});
		html += '</div>';
		return html;
	};

	self._executeIdentifyForLayers = function(e, layers, htmls, callback) {

		self.showLoading("Executing");
		
		var y = e.latlng.lat;
		var x = e.latlng.lng;
		var indicatorIdToLabel = {};
		var indicatorIdsList = layers.map(function(obj) {
			indicatorIdToLabel[obj['id']] = obj['label'];
			return obj['indicatorID'];
		});
		var indicatorArgs = "indicatorIds=" + indicatorIdsList.join("&indicatorIds=");
		var args = indicatorArgs + "&wktGeometry=POINT("+x+" "+y+")";
		var request_url = HC_API_URL + "?" + args;
		self._executeGET(request_url, function(result) {
			var columnList = result['ColumnList'];
			var valueList = result['ValueList'][0];
			var columNameToIndicatorValueObj = {};
			columnList.forEach(function(columnObj) {
				
				var indicatorName = columnObj['ColumnName'];
				if(indicatorIdToLabel[indicatorName]) {
					indicatorName = indicatorIdToLabel[indicatorName];
				}
				var value = valueList[columnObj['ColumnIndex']];
				var indicatorValues = [["Value", value]]
				var html = self._getHTMLViewForIdentifyData(indicatorName, indicatorValues);
				htmls.push(html);
				self.hideLoading();
			});
			callback(htmls);
		});
	};
	
	self._executeGET = function(url, callback) {
		$.ajax({
		    url: url,
		    type: 'GET',
		    crossDomain: true,
		    dataType: 'jsonp',
		    success: callback 
		});
	};

	self._showIdentifyInformation = function(htmls, onMapClickResult) {

		var result = htmls.length > 0 ? htmls.join("<br>"):null;
		onMapClickResult(result);
	};
}

