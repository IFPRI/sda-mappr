var HOST = 'localhost:3000';
var DATA_FOLDER = 'data';
//var HOST = '54.191.215.52';
var RASTER_IDENTIFY_HOST = 'localhost:3001';

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
var timesliderController = null;

var LoadingController = new LoadingSpinnerController("body");
LoadingController.show("Loading");

function getParameterID(key) {
	
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
	
	var id = getParameterID('id');
	
	initChalkboardOverlay();
	initLayout();
	initHeader();
	$("#resetMapButton").click(resetMap);
	
	executeGETRequest(DATA_FOLDER+"/"+id+".json", function(configObj) {
		
		$("#logoText").html(configObj['title']);
		
		var mapConfig = configObj['mapConfig'];
		var layerMenuObj = configObj['layerMenuConfig'];
		
		mapSlideOutContainerController = new MapSlideOutContainerController();
		mapSlideOutContainerController.initSlideOutContainer("basemapsNub", "exitBasemapsButton", "basemaps");
		mapSlideOutContainerController.initSlideOutContainer("layerLegendNub", "exitLayerLegendButton", "layerLegends");
		
		layerMenuController = new LayerMenuController(layerMenuObj);
		indicatorController = new IndicatorController();
		
		mapController = new MapController({
			'defaultBounds':mapConfig['defaultBounds']
		});
		
		permalinkController = new PermalinkController();
		basemapPickerController = new BaseMapPickerController({'defaultBasemap':'Esri Topographic'});
		mapIdentiftyController = new MapIdentifyController();
		mapLayerListController = new MapLayerListController();
		mapLegendController = new MapLegendController();
		imageExportController = new ImageExportController($("body"));
		
		augementControllerWithGlobalBehaviors(mapSlideOutContainerController);
		augementControllerWithGlobalBehaviors(layerMenuController);
		augementControllerWithGlobalBehaviors(indicatorController);
		augementControllerWithGlobalBehaviors(mapController);
		augementControllerWithGlobalBehaviors(permalinkController);
		augementControllerWithGlobalBehaviors(basemapPickerController);
		augementControllerWithGlobalBehaviors(mapIdentiftyController);
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
		
		$(window).resize();
		LoadingController.hide();
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
}

function initLayout() {
	
	var layout = $('body').layout({
		applyDefaultStyles:false,
	    spacing_open:0,
	    spacing_closed:0,
	    slidable:false,
	    togglerLength_closed:0
	});
	var headerAndFooterHeight = 34;
	layout.sizePane("north", headerAndFooterHeight);
	layout.sizePane("south", headerAndFooterHeight);
	
	var extraHeight = $("footer").height() + $("header").height();
	var padding = 20;
	
	$(window).resize(function() {
		
		var bodyWidth = $('body').width();
		var bodyHeight = $('body').height();
		var headerHeight = $("header").height();
		var contentHeight = bodyHeight - extraHeight;
		var contentWidth = bodyWidth - padding;
		
		$(".mapContainer").height(contentHeight).css({top:0});
		$("#layerMenu").height(contentHeight).css({top:0});
		$("#map").height(contentHeight).css({top:0});
		
		mapController.onWindowResize(contentWidth, contentHeight);
	});
}

function initHeader() {
	

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
