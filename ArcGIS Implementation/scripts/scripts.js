dojo.require("esri.map");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojo.cookie");
dojo.require("dojox.widget.ColorPicker");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.CheckBox");
dojo.require("dojox.layout.FloatingPane");
dojo.require("dojo.dnd.move");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.form.HorizontalSlider");

var _gaq = []; // dev purposes only

(function() {

var serverRootURL = "dev.harvestchoice.org";
var mapServiceRootURL = "dev.harvestchoice.org";

var AppURL = serverRootURL + "/mappr/";

var HCAPIRootURL = "http://"+serverRootURL+"/HarvestChoiceApi/0.3/api";
var HCAPIProdRootURL = "http://"+serverRootURL+"/HarvestChoiceApi/0.3/api";
var G_LabelToDivID = {};

var AppGlobals = {

	"Map":null,
	"DefaultExtent":null,
	"DragAndDrop":null,
	"MapServiceLayers":{},
	"LayerIndicatorInfo":{},
	"Layers":{},
	"InertLayers":{},
	"BoundryLayerGlobals":{
		"Layers":{},
		"ActiveBoundryLayers":[]
	},
	"ActiveTool":null,
	"ActiveToolImage":"",
	"ActiveToolEnabled":false,
	"ActiveToolExecuting":false,
	"CustomLocationTool":{
		'Rows':[],
		'Indicators':{},
		'NumberOfDrops':0,
		"MarkerNumberCell5MValueCache":{}
	},
	"CustomAreaTool":{
		"NumberOfAreas":0,
		"DrawingToolBar":null,
		"ConnectEvent":null,
		"Rows":[]
	},
	"MarketShedTool":{
		"GridCodeToHourKey":{
			2:"twoHour",
			4:"fourHour",
			6:"sixHour",
			8:"eightHour"
		},
		"counter":0,
		"highlightedSymbol":null,
		"chartRows":{},
		"twoHourSymbol":null,
		"fourHourSymbol":null,
		"sixHourSymbol":null,
		"eightHourSymbol":null,
		"ShapeFileDownload":null,
		"Results":{}
	},
	"FloatingLayerMenuInitialized":false,
	"RegionMegaDropDown":{
		"RegionTextNodeID":null,
		"RegionChildDeselectID":null,
		"RegionSelected":false,
		"SelectedRegionName":null,
		"ISO3List":[]
	},
	"ToolGraphics":{},
	"LayerMenuHTMLNodes":[],
	"DomainsInfo":null,
	"FillColors":{},
	"Loaders":{},
	"DomainFeatures":{},
	"ResultOnSelectComponents":{},
	"ISO3sForSSA":[],
	"ISO3CountryMap":{},
	"CountryCollectionMap":{},
	"CountryCollectionNameAndCodeMap":{},
	"ToolResultGraphicsLayers":{},
	"RestrictedDomainDropDownValues":[],
	"DomainDropDownValues":[],
	"LayerIsLoading":false,
	"PrintHandles":{},
	"MapExportSnapshots":{}
};

var AppConstants = {
		
	"REGION_DROPDOWN_HEIGHT_PX":239,
	"REGION_DROPDOWN_DURATION_MS":250,
	"BASEMAP_CONTAINER_HEIGHT_PX":200,
	"BOUNDRY_CONTAINER_HEIGHT_PX":82,
	"OPTIONS_NUB_WIDTH_PX":199,
	"TOOLS_NUB_WIDTH_PX":744,
	"LEGEND_HEIGHT_PX":200,
	"LEGEND_HEIGHT_DURATION_MS":250,
	"SUMMARIZE_LOCATION_MENU_HEIGHT_PX":254,
	"TOOL_ADMIN_CONTAINER_HEIGHT_PX":200,
	"TOOL_CROP_CONTAINER_HEIGHT_PX":200,
	"TOOL_LOCATION_CONTAINER_HEIGHT_PX":192,
	"TOOL_DOMAIN_CONTAINER_HEIGHT_PX":300,
	"TOOL_MARKET_SHED_CONTAINER_HEIGHT_PX":131,
	"CHART_WIDTH":300,
	"FOOTER_OFFSET_HEIGHT_PX":116,
	"ANIMATION_DURATION":250,
	"DEFAULT_BASEMAP_KEY":'topo',
	"JQueryURL":"http://code.jquery.com/jquery-1.9.1.js",
	"JQueryUIURL":'http://code.jquery.com/ui/1.10.3/jquery-ui.js',
	"D3URL":"http://d3js.org/d3.v3.min.js",
	"NoDataValue":"No Data",
	"MapServiceURLList":[
	    "http://"+mapServiceRootURL+"/arcgis/rest/services/cell5m_socio/MapServer/",
	    "http://"+mapServiceRootURL+"/arcgis/rest/services/cell5m_main/MapServer/",
	    "http://"+mapServiceRootURL+"/arcgis/rest/services/cell5m_lstock/MapServer/",
	    "http://"+mapServiceRootURL+"/arcgis/rest/services/cell5m_bio/MapServer/",
	    "http://"+mapServiceRootURL+"/arcgis/rest/services/cell5m_dhs/MapServer/",
	    "http://"+mapServiceRootURL+"/arcgis/rest/services/spam05_cell5m_h/MapServer/",
	    "http://"+mapServiceRootURL+"/arcgis/rest/services/spam05_cell5m_v/MapServer/",
	    "http://"+mapServiceRootURL+"/arcgis/rest/services/spam05_cell5m_p/MapServer/",
	    "http://"+mapServiceRootURL+"/arcgis/rest/services/spam05_cell5m_y/MapServer/"
	],
	"MapServiceNamesForLegendLabel":[
	    "cell5m_socio", 
	    "cell5m_main", 
	    "cell5m_lstock", 
	    "cell5m_bio", 
	    "cell5m_dhs", 
	    "spam05_cell5m_h", 
	    "spam05_cell5m_v", 
	    "spam05_cell5m_p", 
	    "spam05_cell5m_y"
	],
	"FeedbackBaseURL":"https://harvestchoice.wufoo.com/forms/mappr-feedback/def/field1=",
	"LayerMenuCategoriesWebServiceURL":HCAPIRootURL + "/categories/",
	"DomainsServiceURL":HCAPIRootURL + "/domains",
	"LayerDownloadBaseURL":"http://harvestchoice.org/data/",
	"WorldSSAMask":"http://"+mapServiceRootURL+"/ArcGIS/rest/services/MapServices/USIRServices/MapServer/",
	"WorldSSAMaskOpacity":0.75,
	"CountryISO3WebServiceURL":HCAPIRootURL + "/countries",
	"CellValuesServiceURL":HCAPIProdRootURL + "/cellvalues",
	"CountryCollectionsWebServiceURL":HCAPIRootURL + "/countrycollections",
	"SelectedRegionFeaturesURL":"http://"+mapServiceRootURL+"/arcgis/rest/services/MapServices/USIRServices/MapServer/8",
	"AdminBoundryMapServiceURL":"http://"+mapServiceRootURL+"/arcgis/rest/services/MapServices/USIRServices/MapServer/",
	"Cell5MGridMapServiceURL":"http://"+mapServiceRootURL+"/arcgis/rest/services/MapServices/HC_Grid/MapServer",
	"CustomAreaServiceURL":"http://"+serverRootURL+"/HarvestChoiceServices/QueryService.asmx/GetPointResultTable",
	"CSVServiceURL":"http://"+serverRootURL+"/HarvestChoiceServices/csv.ashx",
	"TableMakerURL":"http://harvestchoice.org/page/tablr/",
	"ToolTipDescriptions":{
		"TableMakerLink":"Click here to open your selected indicators in Tablemaker.",
		"PermalinkLink":"Share your map.",
		"InfoLink":"Mappr information.",
		"DownloadLinks":"Download dataset now.",
		"ExportPNGLink":"Export the map as a PNG image.",
		"SummarizableLayerInfo":"These layers can be aggragated by the tools",
		"InertLayerInfo":"These layers cannot be used in any tool analysis and are for display only."
	},
	'CellValuesTOPPRURL':HCAPIProdRootURL + "/toppr",
};

var HCPrintObj = null;

dojo.ready(function() {
		
	HCPrintObj = new HCImageExportController('exportButton');
	initSSAWorldMapLayer();
	
	initAndShowInstructionsLandingPage();
	updateFooterVisibility();
	setFooterCopyrightDate();
	
	loadDependencies(function() {
		
		initLegendPane();
		initOptionsMenuNub();
		initToolsMenuNub();
		updateWarningMessagesForMissingLayers();
		initMarketShedSymbols();
		loadQueryStringArgs();
		
		dojo.style(dojo.byId("loadingAppDiv"), "display", "none");
	});
});

function initSSAWorldMapLayer() {
	
	AppGlobals['WorldSSAMask'] = new esri.layers.ArcGISDynamicMapServiceLayer(AppConstants['WorldSSAMask']);
}

function showSSAWorldMapLayer() {
	
	AppGlobals['Map'].addLayer(AppGlobals['WorldSSAMask']);
	AppGlobals['WorldSSAMask'].setVisibleLayers([9]);
	AppGlobals['WorldSSAMask'].setOpacity(AppConstants['WorldSSAMaskOpacity']);
}

function hideSSAWorldMapLayer() {
	AppGlobals['Map'].removeLayer(AppGlobals['WorldSSAMask']);
}

function updateSSAMaskLayerPosition() {
	AppGlobals['Map'].reorderLayer(AppGlobals['WorldSSAMask'], 1);
}

function setFooterCopyrightDate() {
	
	dojo.connect(dojo.byId("HCLogoImg"), "onclick", function() {
		window.open("http://harvestchoice.org/", "_blank");
	});
	dojo.byId("copyrightDiv").innerHTML = "&#169;" + new Date().getFullYear() + " HarvestChoice. All rights reserved.";
}

function loadDependencies(callback) {
	
	showLoading("Loading", "map", "Loading");
	dojoXHRGet(AppConstants['CountryCollectionsWebServiceURL'], function(countryCollectionJSON) {
		dojoXHRGet(AppConstants['CountryISO3WebServiceURL'], function(countriesJSON) {
			loadJavascriptFromURL(AppConstants['JQueryURL'], function() {
					loadJavascriptFromURL(AppConstants['JQueryUIURL'], function() {
						
					$.fn.outerHTML = function(s) {
					    return s ? this.before(s).remove() : $("<p>").append(this.eq(0).clone()).html();
					};
						
					loadMapServiceLayerInfos(AppConstants['MapServiceURLList'].slice(), function() {
						dojoXHRGet(AppConstants['LayerMenuCategoriesWebServiceURL'], function(layerMenuJSON) {
							dojoXHRGet(AppConstants['DomainsServiceURL'], function(domainsJSON) {
								AppGlobals['CountryCollectionNameAndCodeMap'] = createCountryCollectionNameAndCodeMap(countryCollectionJSON);	
								var SSAISO3s = AppGlobals['CountryCollectionNameAndCodeMap']['ALL'];
								loadSSAFeatures(SSAISO3s, function() {
									
									AppGlobals['DomainsInfo'] = createDomainsObject(domainsJSON);							
									AppGlobals['MenuCategoryArray'] = flattenArrayIntoObjUsingKey(layerMenuJSON, 'Name');
									AppGlobals['LayerIndicatorInfo'] = getIndicatorInfoObj(layerMenuJSON);
									AppGlobals['CountryCollectionMap'] = createCountryCollectionMap(countryCollectionJSON);
									AppGlobals['ISO3CountryMap'] = createISO3CountryMap(countriesJSON);
									initMap();
									initHeader();
									initLayerMenu();
									updateWrapperLayout();
									updateMapSizeAndPosition();
									callback();
									hideLoading("Loading");	
									loadNonCriticalJavascriptFiles();
									initResizable("wrapper");
								});
							});
						});
					});
				});
			});
		});
	});
}

function initResizable(id) {
	
	var floatingPaneHeight = 339;
	
	$("#"+id).resizable({handles:"s"}).on("resize", function() {
				
		dijit.byId(id).resize();
		updateMapSizeAndPosition();
		
		var coords = dojo.coords(dojo.byId('map_root'));
		var coords1 = dojo.coords(dojo.byId('floatingSelectedLayersDiv'));
		var coords2 = dojo.coords(dojo.byId('resizeWrapperNub'));
		
		if(coords1.y >= coords2.y && ((coords.h - floatingPaneHeight) + coords2.h > 0)) {
			AppGlobals['ConstrainedFloatingPane'].domNode.style.top = coords2.y - floatingPaneHeight + "px";	
		}	
		else if(((coords.h - floatingPaneHeight) < 0)) {
			AppGlobals['ConstrainedFloatingPane'].domNode.style.top = 0;
		}
	});
}

function loadNonCriticalJavascriptFiles() {
	
	loadJavascriptFromURL(AppConstants['D3URL']);
	dojo.require("esri.tasks.geometry");
	dojo.require("esri.toolbars.draw");
}

function initAndShowInstructionsLandingPage() {
	
	if(dojo.cookie("FirstTimeMapprVisitor")) {
		return;
	}
	else {
		dojo.cookie("FirstTimeMapprVisitor", 1);
	}
	showInstructionsPage();
}

function showInstructionsPage() {
	
	var landingPageNode = dojo.byId("instructionLandingPage");
	dojo.style(landingPageNode, "display", "block");
	dojo.connect(dojo.byId("instructionPageExitButton"), "onclick", function() {
		dojo.style(landingPageNode, "display", "none");
	});
}

function loadQueryStringArgs() {
	
	var args = getQueryStringArgs();
	
	if(!args || !dojo.isObject(args)) {
		setDefaultGeographicSelection();		
	}
	
	if(dojo.isObject(args) && args) {
		loadMapFromPermalinkURL(args);		
	}
}

function updateFooterVisibility() {
	
	var wrapperNode = dojo.byId("wrapper");
	var wrapperHeight = dojo.style(wrapperNode, "height");
	var height = wrapperHeight  - AppConstants['FOOTER_OFFSET_HEIGHT_PX'];
	dojo.style(wrapperNode, "height", height + "px");
}

function updateFooterOnResize() {
		
	var wrapperNode = dojo.byId("wrapper");
	var footerPosInfo = dojo.position(dojo.byId("bottomWrapper"));
	var whiteSpaceStartHeight = footerPosInfo.y + footerPosInfo.h;
	var whiteSpaceEndHeight = dojo.position(dojo.query("body")[0]).h;
	var footerOffsetHeightPX = whiteSpaceEndHeight - whiteSpaceStartHeight;
	var height = dojo.position(wrapperNode).h + footerOffsetHeightPX;
		
	dojo.style(wrapperNode, "height", height + "px");
}

function createISO3CountryMap(countryJSON) {
	
	var obj = {};
	dojo.forEach(countryJSON, function(iso3Obj) {
		obj[iso3Obj['name']] = iso3Obj['label'];
	});
	return obj;
}

function createDomainsObject(domainsJSON) {
	
	var dObj = {};
	dojo.forEach(domainsJSON, function(obj) {
		dObj[obj['Name']] = obj;
	});
	return dObj;
}

function getIndicatorInfoObj(layerMenuJSON) {
	
	var indObj = {};
	dojo.forEach(layerMenuJSON, function(group) {		
		dojo.forEach(group['Subcategories'], function(category) {
			dojo.forEach(category['Aggregates'], function(aggregate) {
				dojo.forEach(aggregate['Indicators'], function(obj) {
					indObj[obj['ColumnName']] = obj;
				});
			});
		});
	});
	return indObj;
}

function getQueryStringArgs() {
	
	var queryString = window.location.search;
	if(queryString.length === 0) {
		return null;
	}
	var query = queryString.substring(queryString.indexOf("?") + 1, queryString.length);
	
	return dojo.queryToObject(query);	
}

function showMessageIfOutOfBounds(extent) {
	extent.intersects(AppGlobals['DefaultExtent']) ? hideOutOfBoundsMessage():showOutOfBoundsMessage();
}

function showOutOfBoundsMessage() {
	
    dojo.style("outOfBoundsMessageDiv", "display", "block");
    dojo.fadeIn({node:"outOfBoundsMessageDiv"}).play();
}

function hideOutOfBoundsMessage() {
	
    dojo.fadeOut({
        node: "outOfBoundsMessageDiv",
        onEnd: function () {
            dojo.style("outOfBoundsMessageDiv", "display", "none");
        }
    }).play();
}

function getQueryStringArgsForCurrentState(includeOpacity) {
	
	var geographicLocationArg = null;
	if(AppGlobals['RegionMegaDropDown']['RegionSelected']) {		
		geographicLocationArg = "region=" + AppGlobals['RegionMegaDropDown']['SelectedRegionCode'] || "ALL";
	}
	else {
		var x = "x=" + AppGlobals['Map'].extent.getCenter().x;
		var y = "y=" + AppGlobals['Map'].extent.getCenter().y;
		var z = "z=" + AppGlobals['Map'].getZoom();	
		geographicLocationArg = [x,y,z].join("&amp;");
	}
		
	var indicatorIdArg = (includeOpacity ? getIndicatorArgsAndOpacityForQueryStringWithKeyName:getIndicatorArgsForQueryStringWithKeyName)("commodity", "name");
	var queryStringArgs = [geographicLocationArg, indicatorIdArg].join("&amp;");
	
	return queryStringArgs;
}

function getIndicatorArgsForQueryStringWithKeyName(keyName, propName) {
	
	var indicatorIdsList = [];
	dojo.forEach(getActiveLayers(), function(indicatorObj) {
		indicatorIdsList.push(keyName + "=" + indicatorObj[propName]);
	});
	return indicatorIdsList.join("&amp;");
}

function getIndicatorArgsAndOpacityForQueryStringWithKeyName(keyName, propName) {
	
	var indicatorIdsList = [];
	dojo.forEach(getActiveLayers(), function(indicatorObj) {
		indicatorIdsList.push(keyName + "=" + indicatorObj[propName] + ":" + indicatorObj['dmsl'].opacity);
	});
	return indicatorIdsList.join("&amp;");
}

function loadMapFromPermalinkURL(args) {
	
	if(args['commodity']) {
		var ids = args['commodity'];
		if(dojo.isArray(ids)) {
			dojo.forEach(ids, function(id, idx) {
				var nextIndex = (ids.length - 1) - idx;
				var nextId = ids[nextIndex];
				var layerInfo = AppGlobals['LayerIndicatorInfo'][nextId];
				if(layerInfo) {
					onLayerCheckboxChange(layerInfo, true);
				}
			});
		}
		else {
			var layerInfo = AppGlobals['LayerIndicatorInfo'][ids];
			if(layerInfo) {
				onLayerCheckboxChange(layerInfo, true);
			}
		}
	}

	if(args['region']) {		
		var regionCode = args['region'];
		if(AppGlobals['CountryCollectionNameAndCodeMap'][regionCode] || AppGlobals['ISO3CountryMap'][regionCode]) {
			clickRegion(regionCode);
		}
		else if(args['x'] && args['y'] && args['z']) {
			
			var x = parseFloat(args['x']);
			var y = parseFloat(args['y']);
			var z = parseInt(args['z']);
			AppGlobals['Map'].centerAndZoom(new esri.geometry.Point(x, y, new esri.SpatialReference({wkid:102100})), z);
		}
		else {
			setDefaultGeographicSelection();
		}
	}
	else {
		setDefaultGeographicSelection();
	}
	
	if(args['topic']) {

		var topicParts = args['topic'].split("|");
		openTopicFromQueryString(topicParts[0], topicParts[1]);
	}
}

function showFullscreenContent(contentId, onShowCallback) {
	
	$("#fullscreenContentDiv").show();
	$(".contentContainer").hide();
	$("#"+contentId).show();
	onShowCallback();
	$("#fullscreenContentContainerCloseButton").click(hideFullscreenContent);
}

function hideFullscreenContent() {
	
	$(".contentContainer").hide();
	$("#fullscreenContentDiv").hide();
}

function setDefaultGeographicSelection() {
	clickRegion("ALL");
}

function clickRegion(name) {
	dojo.byId(name + "_div_text").click();
}

function initHeader() {
	
	$("#regionDropDownSelectArrowImg").show();
	$("#logo").click(resetMap);
	
	initMegaMenuDropDown();
	initDropDownMenuButtons();
	initRegionMenuDropDown();
	initCountryMenuDropDown();
		
	createToolTipDialog("permalinkButtonImg", AppConstants['ToolTipDescriptions']['PermalinkLink']);
	$("#permalinkButtonImg").click(function() {
		executeHeaderButtonOnClick(function() {
			showFullscreenContent("permalinkContainer", loadPermaLinkHTML);
		});
	});
	createToolTipDialog("tableMakerButtonImg", AppConstants['ToolTipDescriptions']['TableMakerLink']);
	$("#tableMakerButton").click(function() {
		executeHeaderButtonOnClick(launchTableMakerWithArguments);
	});
	$("#exportButtonImg").click(function(e) {
		HCPrintObj.showExportMenu();
	});
	

	initAboutAppSection();
}

function getVariableMetaDataHTML() {
	
	var html = '';
	dojo.forEach(getActiveLayers(), function(layerObj) {
		
		html += '<div class="indicatorMetaDataRow">';
		html += '<div><span class="indicatorMetaDataTitle">Layer name: </span><span>' + layerObj['label'] + '</span></div>';
		html += '<div><span class="indicatorMetaDataTitle">Data source: </span><span>' + (layerObj['indicatorInfo']['Source'] || "Not available.") + '</span></div>';	
		html += '</div>';
	});	
	return html;
}

function getLayerLegendList(activeLayers) {
	
	var layerLegendList = [];
	
	dojo.forEach(activeLayers, function(layer) {
		
		var layerObj = {};
		layerObj['layerName'] = "";
		layerObj['legendTitle'] = layer['label'];
		layerObj['legend'] = layer['legend'];
		layerLegendList.push(layerObj);			
	});
	return layerLegendList;
}

function executeHeaderButtonOnClick(callback) {
	
	if(!activeLayersVisible()) {
		showErrorMessage("Please add at least one indicator to the map");
		return;
	}
	callback();
} 

function launchTableMakerWithArguments() {
	
	var indicatorIdArgs = getIndicatorArgsForQueryStringWithKeyName("indicatorIds", "indicatorId");
	if(indicatorIdArgs.length > 0) {
		var queryStringArgs = [indicatorIdArgs].join("&");
		var url = AppConstants['TableMakerURL'] + "?" + queryStringArgs;
		url = url.replace(/&amp;/g, '&');		
		window.open(url, "_blank");
	}
}

function initAboutAppSection() {
	
	createToolTipDialog("infoButtonImg", AppConstants['ToolTipDescriptions']['InfoLink']);
	
	$("#infoButtonImg").click(function() {
		$("#aboutAppFullScreenContainer").show();
		populateFeedbackLink();
	});

	$("#exitAboutAppImg").click(function() {
		$(".aboutAppAccordianRowContent").slideUp({duration:300});
		updateAllAboutAccoridanArrows();
		$("#aboutAppFullScreenContainer").hide();
	});

	initAboutAppAccordianRow("aboutAccordianImg", "aboutAppRow");
	initAboutAppAccordianRow("tutorialAccordianImg", "tutorialAppRow");
	initAboutAppAccordianRow("contactAccordianImg", "contactAppRow");
	initAboutAppAccordianRow("termsOfUseAccordianImg", "termsOfUseRow");
}

function populateFeedbackLink() {

	var feedbackURL = AppConstants['FeedbackBaseURL'];

    var svList = [];
    dojo.forEach(getActiveLayers(), function(layer) {
        svList.push(layer['name']);
    });
    feedbackURL += "layers~" + svList.join("|");
    
	var mapExtent = AppGlobals['Map'].extent;
    feedbackURL += "@extent~" + mapExtent.xmax + "," + mapExtent.xmin + "," + mapExtent.ymax + "," + mapExtent.ymin;
    
    feedbackURL += "@FourthDomain~" + AppGlobals['RegionMegaDropDown']['ISO3List'].join(",");
    feedbackURL += "@toolMode~" + AppGlobals['ActiveTool'];

    dojo.forEach(dojo.query(".feedbackURLLink"), function(node) {
        dojo.attr(node, "href", feedbackURL);
    });
}

function initAboutAppAccordianRow(accordianImageNodeID, rowDivID) {
	
	var accordianToggleImageNode = dojo.byId(accordianImageNodeID);
	var rowDivSelector = "#" + rowDivID;
	
	dojo.connect(accordianToggleImageNode, "onclick", function(e) {
		
		$(rowDivSelector).siblings('.aboutAppAccordianRowContent').slideUp({duration:300});
		updateAllAboutAccoridanArrows();
		
		if($(rowDivSelector).next().is(':hidden')) {
			$(rowDivSelector).next().slideDown({duration:300});
			accordianToggleImageNode.src = "images/close_about_accordian.png";
		}			
		else {
			$(rowDivSelector).next().slideUp({duration:300});
			accordianToggleImageNode.src = "images/open_about_accordian.png";
		}
	});
}

function updateAllAboutAccoridanArrows() {
	dojo.forEach(dojo.query(".infoAccordianImg"), function(node) {
		dojo.byId(node.id).src = "images/open_about_accordian.png";
	});
}

function showErrorMessage(message) {
	
	message = message ? message:"An unexpected error has occurred. Please try your operation again.";
	
	showFullscreenContent("errorMessageContainer", function() {
		
		var errorMessageConainerDiv = dojo.byId("errorMessageContainer");
		errorMessageConainerDiv.innerHTML = "";		
		dojo.place('<div class="errorMessage">'+message+'</div>', errorMessageConainerDiv);
	});
}

function getPermaLinkURL() {
	
	var permaLinkURL = "http://" + AppURL + "?" + getQueryStringArgsForCurrentState(false);
	_gaq.push(['_trackEvent', 'Export', 'Permalink', permaLinkURL]);

	return permaLinkURL;	
}

function getEmbedMapURL(includeLegend) {
	
	var queryStringArgs = getQueryStringArgsForCurrentState(true) + "&basemap=" + AppGlobals['Map'].getBasemap() + (includeLegend ? "&includeLegend=1":"");
	var embedMapURL = "http://" + AppURL + "embed.html?" + queryStringArgs;
	
	return embedMapURL;
}

function loadPermaLinkHTML() {
	
	var html = 
	'<div>' + 
		'<div id="permaBox">'+
			'<div class="permaBoxTitle">Permalink</div>' + 
			'<textarea class="permaTextArea">'+ getPermaLinkURL()+'</textarea>' + 
		'</div>' + 
		'<div>'+
			'<div class="permaBoxTitle">Embed map</div>' + 
			'<textarea class="permaTextArea">'+getEmbedMapURL(true)+'</textarea>' + 
		'</div>' +
	'</div>';
	 dojo.byId("permalinkContainer").innerHTML = html;
}

function toggleAnalyticsTitleDisplay() {
	toggleDivTitleDisplay("analyticsTitle", "analyticsResultsAccordian");
}

function toggleDivTitleDisplay(titleDivID, divToQuery, onVisibleCallback, onInVisibleCallback) {
	
	var titleNode = dojo.byId(titleDivID);
	
	var hasNodes = dojo.query("#"+divToQuery)[0].children.length > 0;
	hasNodes ? updateDisplay(titleNode, 'block', onVisibleCallback) : updateDisplay(titleNode, 'none', onInVisibleCallback);
	
	function updateDisplay(node, dv, cb) {
		dojo.style(node, "display", dv);
		if(cb){cb();}
	}
}

function initMegaMenuDropDown() {
	$("#regionMegaDropDownButton").click(function() {
		dojo.style(dojo.byId("regionMegaDropDownDiv"), "height") > 0 ? closeMegaRegionDropDown():openMegaRegionDropDown();
	});
}

function openMegaRegionDropDown() {
	animateMegaRegionDropDown(AppConstants['REGION_DROPDOWN_HEIGHT_PX'], "images/up_arrow.png");	
}

function closeMegaRegionDropDown() {
	animateMegaRegionDropDown(0, "images/down_arrow.png");
}

function animateMegaRegionDropDown(height, regionDropDownArrowImgSrc) {
	
	animateProperties("regionMegaDropDownDiv", {height:{end:height, units:'px'}}, AppConstants['REGION_DROPDOWN_DURATION_MS'], function() {
		dojo.byId("regionDropDownArrowImg").src = regionDropDownArrowImgSrc;
		updateMapSizeAndPosition();
	});
}

function initDropDownMenuButtons() {
	
	var regionButton = dojo.byId("regionButton");
	var regionsMenuDiv = dojo.byId("regionDropDownDiv");
	var regionArrowCSS = "regionSelectButtonArrow";
	
	var countryButton = dojo.byId("countryButton");
	var countryMenuDiv = dojo.byId("countryDropDownDiv");
	var countryArrowCSS = "countrySelectButtonArrow";
	
	dojo.connect(regionButton, "onclick", function() {
		toggleRegionSelectedButton(regionButton, countryButton, regionsMenuDiv, countryMenuDiv, regionArrowCSS, countryArrowCSS);
	});
	
	dojo.connect(countryButton, "onclick", function() {
		toggleRegionSelectedButton(countryButton, regionButton, countryMenuDiv, regionsMenuDiv, countryArrowCSS, regionArrowCSS);
	});	
}

function toggleRegionSelectedButton(activeButton, inactiveButton, activeDiv, inactiveDiv, activeArrowCSS, inActiveArrowCSS) {
	
	var regionButtonSelectedStyle = "regionButtonSelected";
	dojo.addClass(activeButton, regionButtonSelectedStyle);
	dojo.removeClass(inactiveButton, regionButtonSelectedStyle);
	
	var arrowNode = dojo.byId("regionSelectButtonArrow");
	dojo.addClass(arrowNode, activeArrowCSS);
	dojo.removeClass(arrowNode, inActiveArrowCSS);
	
	var invisibleStyle = "invisible";
	dojo.addClass(inactiveDiv, invisibleStyle);
	dojo.removeClass(activeDiv, invisibleStyle);
}

function initRegionMenuDropDown() {
		
	var regionDropDownTitleNode = dojo.byId("regionDropDownTitles");
	var regionDropDownValuesContainerNode = dojo.byId("regionDropDownValues");
	
	for(regionGroup in AppGlobals['CountryCollectionMap']) {
				
		var regionsCollectionObj = AppGlobals['CountryCollectionMap'][regionGroup];
		
		var regionDiv = '<div id="'+regionGroup+'" class="regionGroup"></div>';
		dojo.place(regionDiv, regionDropDownValuesContainerNode);
		var regionDivNode = dojo.byId(regionGroup);
		
		dojo.place('<div class="regionTitle">'+regionGroup.toUpperCase()+'</div>', regionDropDownTitleNode);

		var regionChildrenDivID = regionGroup + "_children";
		var regionChildrenDiv = '<div id="'+regionChildrenDivID+'"></div>';
		dojo.place(regionChildrenDiv, regionDivNode);
		var regionChildrenDivNode = dojo.byId(regionChildrenDivID);
		
		dojo.forEach(regionsCollectionObj, function(regionChildObj) {			
			regionChildObj["ISOs"].sort();
			addRegionChildToMegaDropDown(regionChildObj['label'], regionGroup, regionChildObj["ISOs"], regionChildrenDivNode, regionChildObj['code']);
		});
	};
}

function initCountryMenuDropDown() {
	
	var geographicRegions = AppGlobals['CountryCollectionMap']['Geographic Groups'];
	
	var countryDropDownTitlesID = "countryDropDownTitles";
	var countryDropDownTitlesNode = dojo.byId(countryDropDownTitlesID);

	var countryDropDownValuesContainerID = "countryDropDownValues";
	var countryDropDownValuesContainerNode = dojo.byId(countryDropDownValuesContainerID);

	dojo.forEach(geographicRegions, function(regionObj, idx) {
		
		if(regionObj['name'] === "SSA") {
			return;
		}
		
		var regionName = regionObj['label'];
		var regionDiv = '<div id="'+regionName+'" class="regionGroup"></div>';
		dojo.place(regionDiv, countryDropDownValuesContainerNode);
		var regionDivNode = dojo.byId(regionName);
		
		var regionTitleDiv = '<div class="regionTitle">'+regionName.toUpperCase()+'</div>';
		dojo.place(regionTitleDiv, countryDropDownTitlesNode);
		
		var regionChildrenDivID = regionName + "_children";
		var regionChildrenDiv = '<div id="'+regionChildrenDivID+'" class="regionChildren"></div>';
		dojo.place(regionChildrenDiv, regionDivNode);
		var regionChildrenDivNode = dojo.byId(regionChildrenDivID);
		
		regionObj['ISOs'].sort();
		dojo.forEach(regionObj['ISOs'], function(iso3) {
			
			var countryName = AppGlobals['ISO3CountryMap'][iso3];
			if(countryName) {
				addRegionChildToMegaDropDown(countryName, regionName, [iso3], regionChildrenDivNode, iso3);
			}
		});
	});
}

function clearSelectedRegionIfSelected() {
	if(AppGlobals['RegionMegaDropDown']['RegionSelected']) {
		clearRegionSelectedState();
	}
}

function addRegionChildToMegaDropDown(regionName, parentRegionName, iso3List, parentNode, regionCode) {
	
	clearSelectedRegionIfSelected();
	
	var expandExtent = true;
	if(regionCode === "ALL") {
		AppGlobals['ISO3sForSSA'] = iso3List;
		expandExtent = false;
	}
	
	if(dojo.byId(regionCode + "_div")) {
		regionCode += parentRegionName;
	}
	
	var regionDivID = regionCode + "_div";
	var regionChildTextID = regionDivID + "_text";
	
	var html = 
	'<div id="'+regionDivID+'" class="regionChild">' +
		'<div class="regionChildText" id="'+regionChildTextID+'">'+regionName+'</div>' +
	'</div>';
	dojo.place(html, parentNode);
	
	var regionTextNode = dojo.byId(regionChildTextID);
	
	dojo.connect(regionTextNode, "onclick", function() {
		
		_gaq.push(['_trackEvent', 'Navigation', 'Selected region', regionName]);
		
		clearSelectedRegionIfSelected();
		
		dojo.addClass(regionTextNode, "regionChildButtonSelected");		
		var regionChildDeselectID = regionDivID + "_deselect";
		
		setRegionMegaDropDownStateActive(regionChildDeselectID, regionChildTextID, iso3List, regionName, regionCode);
		
		var html = 
		'<div class="regionChildDeselectButton" id="'+regionChildDeselectID+'">' +
			'<img width=14 height=13 src="images/layer_remove.png"/>' +
		'</div>';
		dojo.place(html, dojo.byId(regionDivID));
		
		dojo.connect(dojo.byId(regionChildDeselectID), "onclick", clearRegionSelectedState);
		executeGetSelectedFeaturesForMap(iso3List, expandExtent);
		onRegionChange();
	});	
}

function onRegionChange() {
	updateDomainsDropDown();
}

function setRegionMegaDropDownStateActive(regionChildDeselectID, regionChildTextID, iso3List, regionName, selectedRegionCode) {
	setRegionMegaDropDownState(regionChildTextID, regionChildDeselectID, true, iso3List, regionName, regionName, selectedRegionCode);
}

function setRegionMegaDropDownStateInActive() {
	setRegionMegaDropDownState(null, null, false, [], "Sub-Saharan Africa", "Select a Region", null);
}

function setRegionMegaDropDownState(textNodeID, regionChildID, regionSelected, ISO3List, selectedRegionName, dropDownTitle, selectedRegionCode) {
	
	AppGlobals['RegionMegaDropDown']['RegionTextNodeID'] = textNodeID;
	AppGlobals['RegionMegaDropDown']['RegionChildDeselectID'] = regionChildID;
	AppGlobals['RegionMegaDropDown']['RegionSelected'] = regionSelected;
	AppGlobals['RegionMegaDropDown']['ISO3List'] = ISO3List;
	AppGlobals['RegionMegaDropDown']['SelectedRegionName'] = selectedRegionName;
	AppGlobals['RegionMegaDropDown']['SelectedRegionCode'] = selectedRegionCode;
	dojo.byId("regionDropDownTitle").innerHTML = dropDownTitle;
}

function clearRegionSelectedState() {
	
	clearSelectedRegionGraphics();
	
	var regionTextNode = dojo.byId(AppGlobals['RegionMegaDropDown']['RegionTextNodeID']);
	if(regionTextNode) {
		dojo.removeClass(regionTextNode, "regionChildButtonSelected");
	}
	var childDeselectButton = AppGlobals['RegionMegaDropDown']['RegionChildDeselectID'];
	if(childDeselectButton) {
		dojo.destroy(childDeselectButton);
	}
	
	setRegionMegaDropDownStateInActive();
	onRegionChange();
}

function executeGetSelectedFeaturesForMap(iso3List, expandExtent) {
	symbolizeAndZoomToSelectedAOI(iso3List, expandExtent);
}

function loadSSAFeatures(SSAISO3s, callback) {
	
	var query = new esri.tasks.Query();
	query.where = createSQLOrClause("ISO", SSAISO3s);
    query.outSpatialReference = {wkid:102100};
    query.returnGeometry = true;
    query.outFields = ["ISO"];
    
    var cb = function(features) {
    	AppGlobals['SSAFeatures'] = features;
    	callback();
    };
    new esri.tasks.QueryTask(AppConstants['SelectedRegionFeaturesURL']).execute(query, cb, onAppError);
}

function setSelectedRegionOnTopOfMap() {
	
	var lastIndex = AppGlobals['Map'].layerIds.length + AppGlobals['Map'].graphicsLayerIds.length;
    AppGlobals['Map'].reorderLayer(AppGlobals['SelectedRegionGraphicsLayer'], lastIndex);
}

function clearSelectedRegionGraphics() {
	AppGlobals['SelectedRegionGraphicsLayer'].clear();
}

function symbolizeAndZoomToSelectedAOI(iso3List, expandExtent) {
	
	clearSelectedRegionGraphics();
	
	var features = AppGlobals['SSAFeatures'].features;
    var selectedCountrySymbol = AppGlobals['MapMaskActive'] ? AppGlobals['SelectedRegionWithMaskSymbol'] : AppGlobals['SelectedRegionSymbol'];
    var maskSymbol = AppGlobals['MapMaskActive'] ? AppGlobals['SelectedRegionMaskSymbol'] : AppGlobals['NonSelectedRegionSymbol'];
        
	var extent = null;

    for(var i=0, il=features.length; i<il; i++) {
    	
    	var feature = features[i];
		var symbol = null;
    	var iso3 = feature.attributes['ISO'];
    	
    	if(iso3List.indexOf(iso3) !== -1 ) {
    		
    		symbol = selectedCountrySymbol;
    		
    		if(!extent) {
            	extent = feature.geometry.getExtent();
    		}
    		else {
            	extent = extent.union(feature.geometry.getExtent());
    		}
    	}
    	else {
    		symbol = maskSymbol;
    	}
    	feature.setSymbol(symbol);
    	
        AppGlobals['SelectedRegionGraphicsLayer'].add(feature);
    }

	AppGlobals['Map'].setExtent(extent.expand(1.5));
	setSelectedRegionOnTopOfMap();
}

function symbolizeSelectedAOI() {
	
	!AppGlobals['MapMaskActive'] ? setRasterMaskOn():setRasterMaskOff();
	
	var iso3List = AppGlobals['RegionMegaDropDown']['ISO3List'];
	
	if(iso3List.length === 0) {
		return;
	}
	
	clearSelectedRegionGraphics();
	
	var features = AppGlobals['SSAFeatures'].features;
    var selectedCountrySymbol = AppGlobals['MapMaskActive'] ? AppGlobals['SelectedRegionWithMaskSymbol'] : AppGlobals['SelectedRegionSymbol'];
    var maskSymbol = AppGlobals['MapMaskActive'] ? AppGlobals['SelectedRegionMaskSymbol'] : AppGlobals['NonSelectedRegionSymbol'];
        
    for(var i=0, il=features.length; i<il; i++) {
    	
    	var feature = features[i];
    	var iso3 = feature.attributes['ISO'];
    	var symbol = iso3List.indexOf(iso3) !== -1 ? selectedCountrySymbol:maskSymbol;
    	feature.setSymbol(symbol);
    	
        AppGlobals['SelectedRegionGraphicsLayer'].add(feature);
    }
	setSelectedRegionOnTopOfMap();
}

function createSQLOrClause(columnName, listOfValue) {
	
	var sqlList = [];
	dojo.forEach(listOfValue, function(value) {
		sqlList.push(columnName + " = '" + value + "'");
	});
	return sqlList.join(" OR ");
}

var divToTopicMap = {};

function initLayerMenu() {
	
	var layerSlideOutDivId = "layerMenuSlideOutDiv";
	dojo.place('<div id="'+layerSlideOutDivId+'"></div>', dojo.byId("map"));
	var layerSlideOutDivNode = dojo.byId(layerSlideOutDivId);
	
	var layerContainerDivID = "layerContainerDiv";
	dojo.place('<div id="closeLayerMenuDiv"><img id="closeLayerMenuImg" height=13 width=14 src="images/close_layer_menu.png"/></div>', layerSlideOutDivNode);
	dojo.place('<div id="'+layerContainerDivID+'"></div>', layerSlideOutDivNode);
	dojo.connect(dojo.byId("closeLayerMenuDiv"), "onclick", function() {
		closeLayerMenu();
	});
	var layerContainerDivNode = dojo.byId(layerContainerDivID);
	
	var uid = 0;
	var layerGroupIconsParent = $("#layerGroupIcons");
	for(var categoryName in AppGlobals['MenuCategoryArray']) {
		
		var divID = (uid++) + "_layerGroupIcon"; 
		divToTopicMap[categoryName] = divID;
		var layerGroupIcon = $("<div>").attr("id", divID).addClass("layerGroupIcon").appendTo(layerGroupIconsParent);
		var imageURL = "images/"+categoryName+"_icon.png";
		$("<img>").addClass("layerGroupIconImage").attr("src", imageURL).appendTo(layerGroupIcon);
		$("<div>").addClass("layerGroupIconLabel").html(categoryName).appendTo(layerGroupIcon);
		
		addLayerMenuOpenEvent(divID, categoryName, layerContainerDivNode);
	}
}

function openTopicFromQueryString(layerMenuCategory, topics) {
	
	var layerGroupIconDiv = divToTopicMap[layerMenuCategory];	
	
	if(!layerGroupIconDiv) {
		return;
	}
	dojo.byId(layerGroupIconDiv).click();

	if(!topics) {
		return;
	}
	else {
		setTimeout(function() {
			var buttonID = G_LabelToDivID[topics];
			var buttonNode = dojo.byId(buttonID);
			if(buttonNode) {
				buttonNode.click();
			}
		}, 400);
	}
}

function replaceSpecialCharactersForHTMLDivID(s) {
	
	s = s.replace(/'/g,"").replace(/,/g,"").replace(/\"/g,"").replace("$","");
	s = s.replace("  ", '').replace(/\r\n/g, "").replace(/&/g, "");
	s = s.replace('(',"").replace(')',"").replace('.',"");
	
	return s;
};

function addLayerMenuOpenEvent(layerGroupIconDiv, layerGroupCategoryName, layerContainerDivNode) {
	
	dojo.connect(dojo.byId(layerGroupIconDiv), "onclick", function(event) {
				
		var target = event.currentTarget ? event.currentTarget : event.srcElement;
		var element = dojo.byId(target.id);
		
		if(dojo.hasClass(element, "activeSubMenuSelection")) {
			closeLayerMenu();
			return;
		}
		
		var parentDivName = layerGroupIconDiv + '_menu';
		
		if(!dojo.byId(parentDivName)) {

			dojo.place('<div class="layerSlideOut" id="'+parentDivName+'"></div>', layerContainerDivNode);
			createMenuHTMLForCategory(layerGroupCategoryName, parentDivName);
			AppGlobals['LayerMenuHTMLNodes'].push(dojo.byId(parentDivName));
		}
		
		removeAllLayerIconActiveSelectionStates();
		dojo.addClass(element, "layerMenuIconActive");

		toggleLayerHTMLVisibility(dojo.byId(parentDivName));
		openLayerMenu(layerGroupIconDiv);		
	});
}

function removeAllLayerIconActiveSelectionStates() {
	
	dojo.forEach(dojo.query(".layerMenuIconActive"), function(node) {
		dojo.removeClass(dojo.byId(node.id), "layerMenuIconActive");
	});
}

function toggleLayerHTMLVisibility(visibleNode) {
	
	dojo.forEach(AppGlobals['LayerMenuHTMLNodes'], function(node) {
		dojo.style(node, "display", "none");
	});
	dojo.style(visibleNode, "display", "block");
}

function removeAllLayerIconActiveSelections() {
	$(".activeSubMenuSelection").removeClass("activeSubMenuSelection");
}

function openLayerMenu(layerGroupIconDiv, callback) {
	
	removeAllLayerIconActiveSelections();
	$("#"+layerGroupIconDiv).addClass("activeSubMenuSelection");	
	animateLayerMenu(0, 280, callback);
}

function closeLayerMenu() {

	removeAllLayerIconActiveSelectionStates();
	animateLayerMenu(-500, 10, function() {
		removeAllLayerIconActiveSelections();
	});
}

function animateLayerMenu(layerMenuSlideOutDivLeftPX, legendsContainerLeftPX, onAnimateEndCallback) {
	
	if(!dojo.byId("layerMenuSlideOutDiv")) {
		return;
	}
	
	animateProperties("layerMenuSlideOutDiv", {left:{end:layerMenuSlideOutDivLeftPX, units:'px'}}, AppConstants['ANIMATION_DURATION'], onAnimateEndCallback);
	animateProperties("legendsTabContainer", {marginLeft:{end:legendsContainerLeftPX, units:'px'}}, AppConstants['ANIMATION_DURATION']);
}

function createMenuHTMLForCategory(categoryName, parentDivId) {
	
	var categoryDivNode = dojo.byId(parentDivId);
	
	dojo.forEach(AppGlobals['MenuCategoryArray'][categoryName]['Subcategories'], function(subcatObj, i) {
		
		var subCategoryName = subcatObj['Name'];	
		
		var uniqueId = "id1_" + getUniqueID();
		var subCategoryNode = addSubMenuHTMLAndGetLayerNode(uniqueId, subCategoryName, categoryDivNode, "topLevelLayerMenuGroup", "topLevelLayerMenuGroupTitle");

		dojo.forEach(subcatObj['Aggregates'], function(aggregateObj, j) {
			
			var aggregateName = aggregateObj['Name'];
			uniqueId = "id2_" + getUniqueID();
			var aggregateNode = addSubMenuHTMLAndGetLayerNode(uniqueId, aggregateName, subCategoryNode, "childLayerMenuGroup", "childLayerMenuGroupTitle");

			dojo.forEach(aggregateObj['Indicators'], function(indicatorObj) {
						
				var ColumnName = indicatorObj['ColumnName'];
				
				if(!AppGlobals['MapServiceLayers'][ColumnName]) {
					console.log("ColumnName not in map service layers", ColumnName, categoryName, subCategoryName, aggregateName);
					return;
				}
				
				var layerTitle = createIndicatorLabel(indicatorObj);

				var checkBoxDivID = ColumnName + "_checkBoxDiv";
				var infoButtonDivID = ColumnName + "_layerMenuInfo";
				var downloadButtonID = ColumnName + "_layerMenuDownload";
				
				var checkBoxWidget = dijit.byId(checkBoxDivID);
				if(checkBoxWidget) {
					checkBoxWidget.destroy();
				}
				
				var layerHTML = 
				'<div class="layerMenuItem">' + 
					'<div id="'+checkBoxDivID+'"></div>' + 
					'<div class="layerElementStyle" id="'+ColumnName+'">'+layerTitle+'</div>' + 
					'<div id="'+infoButtonDivID+'" class="activeLayerInfoButton"><img width=14 height=13 src="images/layer_info.png"/></div>' +
					'<div id="'+downloadButtonID+'" class="activeLayerDownloadButton"><img width=13 height=13 src="images/icon_download.png"/></div>' +
				'</div>';
				dojo.place(layerHTML, aggregateNode);
				
				dojo.connect(dojo.byId(downloadButtonID), "onclick", function() {
					window.open(AppConstants['LayerDownloadBaseURL'] + ColumnName.toLowerCase(), ColumnName);
				});
				
				var toolTipInnerHTML =  createLayerToolTipHTML(indicatorObj, layerTitle);
				createToolTipDialog(infoButtonDivID, toolTipInnerHTML);
				createToolTipDialog(ColumnName, layerTitle);
				createToolTipDialog(downloadButtonID, AppConstants['ToolTipDescriptions']['DownloadLinks']);
				
				new dijit.form.CheckBox({
			        name:ColumnName + "_checkbox",
			        value:false,
			        checked:false,
			        onChange:function(value) {
			        	if(!AppGlobals['LayerIsLoading']) {
				        	onLayerCheckboxChange(indicatorObj, value);
			        	}
			        }
			    }, checkBoxDivID);
			});
		});
	});
}

function onLayerCheckboxChange(indicatorObj, value) {

	var layerObj = AppGlobals['Layers'][indicatorObj['ColumnName']];
	
	if(!layerObj && value == true) {
		initLayerObjectAndAddToMap(indicatorObj);
	}
	else if(layerObj && value == true) {
		addLayerToMapProcedure(layerObj);
	}
	else if(layerObj && value == false) {
		removeLayerFromUserInterface(layerObj);
	}
}

function initLayerObjectAndAddToMap(indicatorObj) {
	
	showLoading("Initializing layer", "map", "InitializingLayer");
	AppGlobals['LayerIsLoading'] = true;
	
	if(!AppGlobals["FloatingLayerMenuInitialized"]) {
		initFloatingLayerMenu();
	}

	initLayerMain(indicatorObj);
}

function initLayerMain(indicatorObj) {
		
	var ColumnName = indicatorObj['ColumnName'];
	var mapServiceURL = AppGlobals['MapServiceLayers'][ColumnName]['mapServiceURL'];
	var dmsl = new esri.layers.ArcGISDynamicMapServiceLayer(mapServiceURL);
	var layerId = AppGlobals['MapServiceLayers'][ColumnName]['id'];
	fireOneTimeConnectEvent(dmsl, "onLoad", function() {
				
		dmsl.setVisibleLayers([layerId]);
		var layerObj = {
			"label":createIndicatorLabel(indicatorObj),
			"name":ColumnName,
			"id":layerId,
			"indicatorId":indicatorObj['Id'],
			"dmsl":dmsl,
			"mapServiceURL":mapServiceURL,
			"indicatorInfo":indicatorObj
		};
		AppGlobals['Layers'][ColumnName] = layerObj;
		
		_gaq.push(['_trackEvent', 'Indicators', 'Added to the map', layerObj['label']]);

		addLayerToMapProcedure(AppGlobals['Layers'][ColumnName]);
		hideLoading("InitializingLayer");
	});	
}

function createIndicatorLabel(indicatorObj, joinChar) {
	
	if(!joinChar) {
		joinChar = " ";
	}
	
	var year = indicatorObj['Year'];
	year = year ? "("+ year + ")":null;
	
	var unit = indicatorObj['Unit'];
	unit = unit ? "("+ unit + ")":null;
		
	var labelParts = [indicatorObj['MicroLabel']];
	var secondLineParts = "";
	if(year) {
		secondLineParts += year;
	}
	if(unit) {
		secondLineParts += " " + unit;
	}
	if(secondLineParts) {
		labelParts.push(secondLineParts);
	}
	
	return labelParts.join(joinChar);
}

function addLayerToMapProcedure(layer) {
	
	showLoading("Loading layer", "map", "LoadingLayer");
	
	if(layerAlreadyAddedToUserInterface(layer)) {
		AppGlobals['LayerIsLoading'] = false;
		return;
	}
	
	fireOneTimeConnectEvent(AppGlobals['Map'], "onLayerAdd", function() {
		addActiveLayerToUserInterface(layer);
		toggleClearAllLayersButton();
		hideLoading("LoadingLayer");
		AppGlobals['LayerIsLoading'] = false;
	});
	AppGlobals['Map'].addLayer(layer['dmsl']);
}

function layerAlreadyAddedToUserInterface(layer) {
	return dojo.byId(layer['name']+"|"+layer['id']);
}

function addInertLayerToUserInterface(layer, layerTitle) {
	
	if(layerAlreadyAddedToUserInterface(layer)) {
		return;
	}

	var layerName = layer['name'];
	if(!AppGlobals['InertLayers'][layerName]) {
		AppGlobals['InertLayers'][layerName] = layer;
	}
	
	var activeLayerContainerDivID =  layerName+"|"+layer['id'];
	var activeLayerDivID = activeLayerContainerDivID + '_active';
	var infoButtonDivID = activeLayerContainerDivID + '_info';
	var closeButtonDivID = activeLayerContainerDivID + '_close';
	var opacityToggleButtonID = activeLayerContainerDivID + '_opacityToggle';
	var opacitySliderButtonID = activeLayerContainerDivID + '_opacitySlider';
	var layerTypeImage = "inert_layer.png";

	var node = 
		'<div id="'+activeLayerContainerDivID+'" class="activeLayerDiv">' +
			'<img class="activeLayerTypeImgIcon" width=25 height=21 src="images/'+layerTypeImage+'".png"/>' +
			'<div id="'+activeLayerDivID+'" class="activeLayerTitle" style="margin-left:16px;">'+layerTitle+'</div>' +
			'<div id="'+closeButtonDivID+'" class="activeLayerCloseButton"><img width=14 height=13 src="images/layer_remove.png"/></div>' +
			'<div id="'+infoButtonDivID+'" class="activeLayerInfoButton"><img width=14 height=13 src="images/layer_info.png"/></div>' +
			'<div id="'+opacityToggleButtonID+'" class="selectedLayerOpacityButton"><img width=15 height=14 src="images/layer_opacity_button.png"/></div>' +
			'<div id="'+opacitySliderButtonID+'" class="activeLayerSliderContainer"/></div>' +
		'</div>';
	dojo.place(node, dojo.byId("inertLayerSelectionList"));
	
	createToolTipDialog(infoButtonDivID, layerTitle);
			
	dojo.connect(dojo.byId(closeButtonDivID), "onclick", function() {
		removeInertLayerFromList(layer['dmsl'], activeLayerContainerDivID);
	});
	
	var opacityValueObj = {value:1};
	addActiveLayerOpacityslider(layer, opacitySliderButtonID, function(value) {
		
		layer['dmsl'].setOpacity(value);
		opacityValueObj.value = value;
	});
	
	var opacityButton = dojo.byId(opacityToggleButtonID);
	dojo.connect(opacityButton, "onclick", function() {
		
		if(!this.off) {
			this.off = true;
			layer['dmsl'].setOpacity(0);
			dojo.style(opacityButton, "opacity", 0.5);
		}
		else {
			this.off = false;
			layer['dmsl'].setOpacity(opacityValueObj.value);
			dojo.style(opacityButton, "opacity", 1);
		}
	});
	
	onInertLayerUpdate();
	
	return activeLayerContainerDivID;
}

function removeInertLayerFromList(dmslyr, activeLayerContainerDivID, onLayerRemove) {
	
	fireOneTimeConnectEvent(AppGlobals['Map'], "onLayerRemove", function() {
		dojo.destroy(activeLayerContainerDivID);
		onInertLayerUpdate();
		if(onLayerRemove) {
			onLayerRemove();
		}
	});
	AppGlobals['Map'].removeLayer(dmslyr);
}

function onInertLayerUpdate() {
		
	toggleDivTitleDisplay("inertLayerSelectionTitle", "inertLayerSelectionList", function() {
		toggleFloatingLayerMenuDisplays("block");
	}, function() {
		toggleFloatingLayerMenuDisplays("none");
	});
}

function toggleFloatingLayerMenuDisplays(dv) {
	dojo.style(dojo.byId("activeLayerSelectionTitle"), "display", dv);
	dojo.style(dojo.byId("inertLayerSelectionContainer"), "display", dv);
}

function addActiveLayerToUserInterface(layer) {
	
	var activeLayerContainerDivID =  layer['name']+"|"+layer['id'];
	var activeLayerDivID = activeLayerContainerDivID + '_active';
	var infoButtonDivID = activeLayerContainerDivID + '_info';
	var closeButtonDivID = activeLayerContainerDivID + '_close';
	var dragButtonDivID = activeLayerContainerDivID + '_drag';
	var dragButtonImageID = dragButtonDivID + "_image";
	var opacityToggleButtonID = activeLayerContainerDivID + '_opacityToggle';
	var opacitySliderButtonID = activeLayerContainerDivID + '_opacitySlider';
	
	var indicatorObj = layer['indicatorInfo'];	
	var layerTitle = createIndicatorLabel(indicatorObj);
	var layerTypeImage = indicatorObj['ClassificationType'] === "continuous" ? "sum_layer.png":"inert_layer.png";

	var node = 
		'<div id="'+activeLayerContainerDivID+'" class="activeLayerDiv dojoDndItem">' +
			'<img class="activeLayerTypeImgIcon" width=25 height=21 src="images/'+layerTypeImage+'".png"/>' +
			'<div id="'+dragButtonDivID+'" class="activeLayerDragButton dojoDndHandle"><img id="'+dragButtonImageID+'" width=17 height=19 src="images/slide.png"/></div>' +
			'<div id="'+activeLayerDivID+'" class="activeLayerTitle">'+layerTitle+'</div>' +
			'<div id="'+closeButtonDivID+'" class="activeLayerCloseButton"><img width=14 height=13 src="images/layer_remove.png"/></div>' +
			'<div id="'+infoButtonDivID+'" class="activeLayerInfoButton"><img width=14 height=13 src="images/layer_info.png"/></div>' +
			'<div id="'+opacityToggleButtonID+'" class="selectedLayerOpacityButton"><img width=15 height=14 src="images/layer_opacity_button.png"/></div>' +
			'<div id="'+opacitySliderButtonID+'" class="activeLayerSliderContainer"/></div>' +
		'</div>';
	
	AppGlobals['DragAndDrop'].insertNodes(false,[{node:node, data:node,type:["ActiveLayer"]}], true, getActiveLayerDNDNodes()[0]);
	AppGlobals['DragAndDrop'].sync();
			
	dojo.connect(dojo.byId(closeButtonDivID), "onclick", function() {
		removeLayerFromUserInterface(layer);
	});	
	
	var opacityValueObj = {value:1};
	var opacityButton = dojo.byId(opacityToggleButtonID);
	dojo.connect(opacityButton, "onclick", function() {
		
		if(!this.off) {
			this.off = true;
			layer['dmsl'].setOpacity(0);
			dojo.style(opacityButton, "opacity", 0.5);
		}
		else {
			this.off = false;
			layer['dmsl'].setOpacity(opacityValueObj.value);
			dojo.style(opacityButton, "opacity", 1);
		}
	});
	
	var toolTipInnerHTML = createLayerToolTipHTML(indicatorObj, layerTitle);
	createToolTipDialog(infoButtonDivID, toolTipInnerHTML);
	
	var dragButtonNode = dojo.byId(dragButtonImageID);	
	dojo.connect(dragButtonNode, "onmouseover", function() {
		dragButtonNode.src = "images/slide_hover.png";
	});
	dojo.connect(dragButtonNode, "onmouseout", function() {
		dragButtonNode.src = "images/slide.png";
	});
	
	addActiveLayerOpacityslider(layer, opacitySliderButtonID, function(value) {
		
		layer['dmsl'].setOpacity(value);
		opacityValueObj.value = value;
	});
	addLegend(layer);
	updateWarningMessagesForMissingLayers();
}

function addActiveLayerOpacityslider(layer, containerDiv, onChange) {
	
	var sliderID = layer.id + "_opacity_slider";
    var dijitDiv = sliderID + "Dijit";
    var sliderDivContainer = sliderID + "_container";
    var percentDiv = dijitDiv + "_percent";

	var dijitToDestroy = dijit.byId(dijitDiv);
    if(dijitToDestroy) {
    	dijitToDestroy.destroy();
    }
    if(dojo.byId(sliderDivContainer)) {
    	dojo.destroy(sliderDivContainer);
    }
    
    dojo.place('<div class="opacitySliderContainer" id="'+sliderDivContainer+'"></div>', dojo.byId(containerDiv));
    var sliderNode = dojo.byId(sliderDivContainer);

    dojo.place('<div id="'+dijitDiv+'"></div>', sliderNode);
    
    dojo.place('<div class="percentDiv" id="'+percentDiv+'"></div>', sliderNode);
    var percentNode = dojo.byId(percentDiv);
    
    dojo.place('<div class="zeroPercent percent">0%</div>', percentNode);
    dojo.place('<div class="hundredPercent percent">100%</div>', percentNode);

    var defaultLayerOpacity = 0.8;
    
    new dijit.form.HorizontalSlider({
		"name":sliderID,
		"value":defaultLayerOpacity,
		"minimum":0,
		"maximum":1,
		"showButtons":false,
		"intermediateChanges":true,
		"onChange":onChange
	}, dijitDiv);
    
	layer['dmsl'].setOpacity(defaultLayerOpacity);
}

function createLayerToolTipHTML(indicatorObj, layerTitle) {
	
	var Year = indicatorObj['Year'];
	var endYear = indicatorObj['EndYear'];
		
	var toolTipInnerHTML = 
	'<div class="tooltipTitle">Name:</div>' + " " + indicatorObj['MicroLabel'] + '<br>' +  
	'<div class="tooltipTitle">Description:</div>' + " " + layerTitle + '<br>' +  
	(Year ? ('<div class="tooltipTitle">Reference period:</div>' + " " + Year + (endYear ? " - " + endYear:"")) + '<br>' :"") + 
	'<div class="tooltipTitle">Units:</div>' + " " + indicatorObj['Unit'] + '<br>' +  
	'<div class="tooltipTitle">Source:</div>' + " " + indicatorObj['Source']+ '<br>' +  
	'<div class="tooltipTitle">Code:</div>' + " " + indicatorObj['ColumnName'];
	
	return toolTipInnerHTML;
}

function createToolTipDialog(divID, innerHTML) {
	
	var myTooltipDialogWidget = dijit.byId(divID + "_tooltip");
	if(myTooltipDialogWidget) {
		myTooltipDialogWidget.destroy();
	}
		
	var myTooltipDialog = new dijit.TooltipDialog({id:divID + "_tooltip", content:innerHTML});
	var divIDNode = dojo.byId(divID);
	
	dojo.connect(divIDNode, "onmouseleave", function() {
        dijit.popup.close(myTooltipDialog);
	});
	
    dojo.connect(divIDNode, 'onmouseenter', function() {
        dijit.popup.open({popup:myTooltipDialog, around:divIDNode});
    });
}

function removeLayerFromUserInterface(layer) {
	
	if(!layerAlreadyAddedToUserInterface(layer)) {
		return;
	}
    
	var dmslyr = layer['dmsl'];
	if(dmslyr) {
		fireOneTimeConnectEvent(AppGlobals['Map'], "onLayerRemove", function() {
			onActiveLayerRemove(layer);
		});
		AppGlobals['Map'].removeLayer(dmslyr);
	}	
}

function onActiveLayerRemove(layer) {
	
	uncheckCheckboxForLayer(layer);
	removeLegend(layer);
	removeDNDNodeFromSource(layer);
	toggleClearAllLayersButton();
	updateWarningMessagesForMissingLayers();
}

function toggleClearAllLayersButton() {
	activeLayersVisible() ? showClearAllLayersButton():hideClearAllLayersButton();
}

function uncheckCheckboxForLayer(layer) {
	var cbDijit = dijit.byId(layer['name'] + "_checkBoxDiv");
	if(cbDijit) {
		cbDijit.set("checked", false);
	}
}

function removeDNDNodeFromSource(layer) {
	
	var node = dojo.byId(layer['name']+"|"+layer['id']);
	var parentNode = node.parentElement ? node.parentElement : node.parentNode;
	AppGlobals['DragAndDrop'].parent.removeChild(parentNode);
	AppGlobals['DragAndDrop'].sync();
}

function addLegend(layer) {
	
	if(!layer['hasLegendLabels']) {
		getExternalLegendLabels(layer, function(lyr) {
			 addLegendMain(lyr);
		});
	}
	else {
		 addLegendMain(layer);
	}
}

function getExternalLegendLabels(layer, callback) {
	
	var url = "http://" + AppURL + "/GetLegendLabels.ashx?column_name=" + layer['name'];
	dojoXHRGet(url, function(result) {
		layer['legend'] = {colors:[],labels:[]};
		if(result.Rows && result.Rows[0] && result.Rows[0].classLabels) {
			
			var obj = result.Rows[0];
			var classColors = obj['classColors'].split("|");
			var classLabels = obj['classLabels'].split("|");
			layer['legend'] = {colors:classColors,labels:classLabels};
			layer['hasLegendLabels'] = true;	
		}
		callback(layer);
	});
}

function addLegendMain(indicatorObj) {
	
	var legendObject = indicatorObj['legend'];
	var colors = legendObject['colors'];
	var labels = legendObject['labels'];
	var legendContainerNode = $("#legendsContainer");
	
	if(colors.length === labels.length) {
		
		var legendID = indicatorObj['name'] + indicatorObj['id']  + "_legend";
					
		var indicatorLabel = indicatorObj['label'];
		var legendNode = $('<div>').attr('id', legendID).addClass("legend").appendTo(legendContainerNode);
		$('<div>').addClass("legendTitleElementHeader").html(indicatorLabel).appendTo(legendNode);
		var tableNode = $('<table>').appendTo(legendNode);
		
		labels.forEach(function(label, idx) {
			
			var legendValue = parseInt(label) == -999 ? AppConstants['NoDataValue']:label;
			var tr = $('<tr>').attr("valign", "middle");
			tr.append($('<td>').css({background:colors[idx]}).addClass("legendSwatch"));
			tr.append($('<td>').html(legendValue).addClass("legendClassLabel"));
			tableNode.append(tr);
		});		
	}
}

function removeLegend(layer) {
	dojo.destroy(layer['name'] + layer['id']  + "_legend");
}

function initDragAndDrop() {
	
	AppGlobals['DragAndDrop'] = new dojo.dnd.Source("activeSelectionLayerList", {withHandles:true, accept:['ActiveLayer']});
	dojo.connect(AppGlobals['DragAndDrop'], "onDrop", function() {
		AppGlobals['DragAndDrop'].selectNone();		
		reorderMapLayers();
	});
}

function activeLayersVisible() {
	return getActiveLayers().length > 0;
}

function reorderMapLayers() {
	
	var activeLayers = getActiveLayers();
	dojo.forEach(activeLayers, function(layer, idx) {
		var newIndex = activeLayers.length - idx;
		AppGlobals['Map'].reorderLayer(layer['dmsl'], newIndex);	
	});
	reorderBoundryLayers();
}

function reorderBoundryLayers() {
	
	var numberOfLayers = AppGlobals['Map'].layerIds.length;
	var boundryKeys = AppGlobals['BoundryLayerGlobals']['ActiveBoundryLayers'];
	if(boundryKeys.length > 0) {	
		dojo.forEach(boundryKeys, function(boundryKey) {
			AppGlobals['Map'].reorderLayer(AppGlobals['BoundryLayerGlobals']['Layers'][boundryKey], numberOfLayers);	
		});
	}
}

function getListFromActiveLayers(property) {
	
	var propList = [];
	dojo.forEach(getActiveLayers(), function(obj) {
		if(obj['indicatorInfo']['IsDomain'] === false) {
			propList.push(obj[property]);
		}
	});
	return propList;
}

function getActiveLayers(onlySummarizable) {
	
	var res = getLayerListFromLayerGroup(getActiveLayerDNDNodes(), 'Layers', function(n) {
		return n.children[0].id.split("|")[0];
	});
	
	if(onlySummarizable) {
		res = res.filter(function(obj) {return obj['indicatorInfo']['IsDomain'] === false;});
	}
	
	return res;
}

function getActiveInertLayers() {
	return getLayerListFromLayerGroup(getActiveInertLayerDNDNodes(), 'InertLayers', function(n) {
		return n.id.split("|")[0];
	});
}

function getLayerListFromLayerGroup(array, groupKey, getNameFunc) {
	
	var lyrList = [];
	dojo.forEach(array, function(n) {
		var name = getNameFunc(n);
		lyrList.push(AppGlobals[groupKey][name]);
	});
	return lyrList;
}

function getActiveLayerDNDNodes() {
	return AppGlobals['DragAndDrop'] ? AppGlobals['DragAndDrop'].getAllNodes():[];
}

function getActiveInertLayerDNDNodes() {
	return dojo.byId("inertLayerSelectionList") ? dojo.query("#inertLayerSelectionList")[0].children : [];
}

function initMap() {
	
    esri.config.defaults.io.proxyUrl = "proxy.ashx";
	
	AppGlobals['DefaultExtent'] = new esri.geometry.Extent(
		-3149613.6179597233, 
		-3371678.693126522, 
		7681207.541933732, 
		2987882.0601984514, 
		new esri.SpatialReference({wkid:102100})
	);
	AppGlobals['Map'] = new esri.Map("map", {
        "extent": AppGlobals['DefaultExtent'],
        "basemap":AppConstants['DEFAULT_BASEMAP_KEY'],
        "autoResize":true,
        "logo":false,
        "showAttribution":false,
        "wrapAround180":true,
        "sliderStyle":"small",
        "sliderOrientation":"horizontal",
        "sliderPosition": "bottom-right",
        "smartNavigation":false
    });
	
	dojo.connect(AppGlobals['Map'], "onLoad", function() {
		
		initMapResetButton();
		initMapZoomButtons();
		AppGlobals['Map'].disableScrollWheelZoom();
	});
	
	dojo.connect(AppGlobals['Map'], "onClick", onMapClick);
	dojo.connect(AppGlobals['Map'], "onMouseMove", updateLatLon);
	
	dojo.connect(AppGlobals['Map'], "onUpdateStart", function() {
		showLoading("Updating map", "map", "UpdatingMap");
	});
	
	dojo.connect(AppGlobals['Map'], "onUpdateEnd", function() {
		hideLoading("UpdatingMap");
	});
	
	dojo.connect(window, "onresize", function() {
		updateWrapperLayout();
		updateMapSizeAndPosition();
	});
	dojo.connect(AppGlobals['Map'], "onExtentChange", showMessageIfOutOfBounds);
	dojo.connect(dojo.byId("returnToOutOfBoundsButton"), "onclick", resetMapDefaultExtent);
	
	dojo.connect(dojo.byId("rasterMaskToggleButton"), "onclick", symbolizeSelectedAOI);
	
	initSelectedGraphicsLayer();
}

function initGraphicsLayerAndAddToMap(uniqueID) {
	
	AppGlobals['ToolResultGraphicsLayers'][uniqueID] = new esri.layers.GraphicsLayer();	
	AppGlobals['Map'].addLayer(AppGlobals['ToolResultGraphicsLayers'][uniqueID]);
}

function getUniqueGraphicsLayer(uniqueLayerID) {
	
	if(!AppGlobals['ToolResultGraphicsLayers'][uniqueLayerID]) {
		initGraphicsLayerAndAddToMap(uniqueLayerID);
	}
	
	return AppGlobals['ToolResultGraphicsLayers'][uniqueLayerID];
}

function updateMapSizeAndPosition() {
	
	AppGlobals['Map'].reposition();
	AppGlobals['Map'].resize();
}

function updateWrapperLayout() {
	
	updateFooterOnResize();
	dijit.byId("wrapper").resize();
}

function initSelectedGraphicsLayer() {
	
	// MASK SYMBOLS
	AppGlobals['SelectedRegionMaskSymbol'] = new esri.symbol.SimpleFillSymbol(
		esri.symbol.SimpleFillSymbol.STYLE_SOLID,
		new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_FILL, new dojo.Color([51,51,51,0.5]), 10), 		
		new dojo.Color([0,0,0,AppConstants['WorldSSAMaskOpacity']])
	);
	
	AppGlobals['SelectedRegionWithMaskSymbol'] = new esri.symbol.SimpleFillSymbol(
			esri.symbol.SimpleFillSymbol.STYLE_NULL,
			new esri.symbol.SimpleLineSymbol(
				esri.symbol.SimpleLineSymbol.STYLE_FILL, 
				new dojo.Color([51,51,51,0.5]), 5
			), 
			new dojo.Color("#cb991c"), 1
	);
	
	// NO MASK SYMBOLS
	AppGlobals['NonSelectedRegionSymbol'] = new esri.symbol.SimpleFillSymbol(
		esri.symbol.SimpleFillSymbol.STYLE_NULL,
		new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL, new dojo.Color([51,51,51, 1]), 1), 		
		new dojo.Color([51,51,51,1])
	);
	
	AppGlobals['SelectedRegionSymbol'] = new esri.symbol.SimpleFillSymbol(
		esri.symbol.SimpleFillSymbol.STYLE_NULL,
		new esri.symbol.SimpleLineSymbol(
			esri.symbol.SimpleLineSymbol.STYLE_SOLID, 
			new dojo.Color("#cb991c"), 1
		), 
		new dojo.Color([125,125,125,0.35])
	);

	
	AppGlobals['SelectedRegionGraphicsLayer'] = new esri.layers.GraphicsLayer();	
	AppGlobals['Map'].addLayer(AppGlobals['SelectedRegionGraphicsLayer']);
}

function setRasterMaskOn() {
	
	showSSAWorldMapLayer();
	AppGlobals['MapMaskActive']  = true;
	dojo.byId("rasterMaskToggleButton").innerHTML = "MASK (ON)";
}

function setRasterMaskOff() {
	
	hideSSAWorldMapLayer();
	AppGlobals['MapMaskActive'] = false;
	dojo.byId("rasterMaskToggleButton").innerHTML = "MASK (OFF)";
}

function updateLatLon(e) {
	
	if(!this.coordsDiv) {
		
		this.coordsDiv = dojo.byId("coordsDiv");
		this.latLonConverter = esri.geometry.webMercatorToGeographic;
		this.round = Math.round;
	}
	
    var pt = this.latLonConverter(e.mapPoint);
    var lat = this.round(pt.y * 1000) / 1000;
    var lon = this.round(pt.x * 1000) / 1000;
    
    this.coordsDiv.innerHTML = "Lat: " + lat.toFixed(2) + " &nbsp;Lon: " + lon.toFixed(2);  
}

function initMapResetButton() {
	dojo.connect(dojo.byId("mapResetButton"), "onclick", resetMap);
}

function initMapZoomButtons() {
	
	initMapZoomButton(".esriSimpleSliderIncrementButton", "images/zoom_plus.png");
	initMapZoomButton(".esriSimpleSliderDecrementButton", "images/zoom_minus.png");
}

function initMapZoomButton(zoomButtonClass, imageSrc) {
	
	var zoomButton = dojo.query(zoomButtonClass)[0];
	zoomButton.innerHTML = "";
	dojo.place('<img class="mapZoomButton" height=17 width=17 src="'+imageSrc+'"/>', zoomButton);
}

function onMapClick(evt) {
	
	var activeTool = AppGlobals['ActiveTool'];
	var mapPoint = evt.mapPoint;
	var graphic = evt.graphic;
	
	if(graphic && graphic.geometry && graphic.geometry.uniqueID && graphic.toolType === activeTool) {
		selectResultComponents(graphic.geometry.uniqueID);
		return;
	}

	if(activeTool && AppGlobals['ActiveToolEnabled']) {
		handleActiveToolMapClick(activeTool, mapPoint);
	}
}

function handleActiveToolMapClick(activeTool, mapPoint) {
	
	if(AppGlobals['ActiveToolExecuting'] || !activeLayersVisible()) {
		return;
	}
	
	if(atLeastOneSummarizableLayerIsVisible()) {
		
		if(activeTool === "summarizeLocation") {
			onToolExecute();
			executeSummarizeLocationTool(mapPoint);
		}
		else if(activeTool === "summarizeMarket") {
			
			onToolExecute();
			executeMarketShedTool(mapPoint);
		}
	}	
}

function atLeastOneSummarizableLayerIsVisible() {
	
	var atLeastOneSummarizableIndicator = getActiveLayers().some(function(obj) {
		return obj['indicatorInfo']['IsDomain'] === false;
	});	
	
	return atLeastOneSummarizableIndicator;
}

function updateWarningMessagesForMissingLayers() {
	
	function updateNodeDisplay(nodeID, visible, message) {
		
		var node = dojo.byId(nodeID);
		dojo.style(node, "display", visible);
		node.innerHTML = "Please add at least one indicator to the map.";
	}
	function toggleButtonOpacity(buttonID, opacity) {
		dojo.style(dojo.byId(buttonID), "opacity", opacity);
	}
	
	if(atLeastOneSummarizableLayerIsVisible()) {
		
		updateNodeDisplay('summarizeLocationMessage', 'none');
		updateNodeDisplay('summarizeDomainMessage', 'none');
		updateNodeDisplay('summarizeMarketShedMessage', 'none');
		updateNodeDisplay('summarizeTopAdminMessage', 'none');
		
		var activeOpacityValue = 1;
		toggleButtonOpacity("executeSummarizeLocationsButton", activeOpacityValue);
		toggleButtonOpacity("executeSummarizeCustomAreaButton", activeOpacityValue);
		toggleButtonOpacity("executeSummarizeDomainButton", activeOpacityValue);
		toggleButtonOpacity("executeSummarizeMarketButton", activeOpacityValue);
		toggleButtonOpacity("executeAdminTOPPRButton", activeOpacityValue);
	}
	else {
		
		updateNodeDisplay('summarizeLocationMessage', 'block');
		updateNodeDisplay('summarizeDomainMessage', 'block');
		updateNodeDisplay('summarizeMarketShedMessage', 'block');
		updateNodeDisplay('summarizeTopAdminMessage', 'block');
		
		var inactiveOpacityValue = 0.3;
		toggleButtonOpacity("executeSummarizeLocationsButton", inactiveOpacityValue);
		toggleButtonOpacity("executeSummarizeCustomAreaButton", inactiveOpacityValue);
		toggleButtonOpacity("executeSummarizeDomainButton", inactiveOpacityValue);
		toggleButtonOpacity("executeSummarizeMarketButton", inactiveOpacityValue);
		toggleButtonOpacity("executeAdminTOPPRButton", inactiveOpacityValue);
	}
}

function executeMarketShedTool(mapPoint) {
	
    var uniqueID = getUniqueID();
    
	var accordianTitleTop = getNextAnalysisTitle() + ": Travel Time";
	
	var uniqueLayerID = uniqueID + "TravelTimeLayer";
	var layerObj = {'name':uniqueLayerID, 'id':uniqueID,'mapLayerID':uniqueLayerID,'dmsl':getUniqueGraphicsLayer(uniqueLayerID), 'label':'Travel Time Result'};
	
	var activeLayerContainerDivID = addInertLayerToUserInterface(layerObj, accordianTitleTop);
	layerObj['ActiveLayerDivID'] = activeLayerContainerDivID; 
    
	AppGlobals['MarketShedTool']['Results'][uniqueID] = {};
	AppGlobals['MarketShedTool']['chartRows'][uniqueID] = {};	
	
    var clickPointSymbol = new esri.symbol.SimpleMarkerSymbol(
    		esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 8, 
    		new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 2), 
    		new dojo.Color([255, 255, 255]));   
	addToolGraphicAndGetID(mapPoint, clickPointSymbol, "summarizeMarket", uniqueLayerID);
	
	initNewMarketShedToolRun(uniqueID);
	
	var indicatorIdsList = getListFromActiveLayers("indicatorId");
	
	var mapPointGeographic = esri.geometry.webMercatorToGeographic(mapPoint);
	var x = parseFloat(mapPointGeographic['x']).toFixed(3);
	var y = parseFloat(mapPointGeographic['y']).toFixed(3);
	var wktGeometry = 'POINT('+x+' '+y+')';
	
	_gaq.push(['_trackEvent', 'Tools', 'Market shed tool executed', "x = " + x + ", " + "y = " + y]);
	
	var indicatorArgs = "indicatorIds=" + indicatorIdsList.join("&indicatorIds=");
	var args = indicatorArgs + "&wktGeometry="+wktGeometry+"&doMarketAnalysis=true";
	dojoXHRGet(AppConstants['CellValuesServiceURL'] + "?" + args, function(result) {
		loadMarketShedResults(result, uniqueID, layerObj, accordianTitleTop);
	});
}

function initMarketShedSymbols() {
	
    var highlightColor = new dojo.Color([255,255,0]);
    var twoClr = new dojo.Color([77, 0, 75, 0.75]);
    var fourClr = new dojo.Color([129, 15, 124, 0.75]);
    var sixClr = new dojo.Color([136, 65, 157, 0.75]);
    var eightClr = new dojo.Color([140, 107, 177, 0.75]);
    var outlineClr = new dojo.Color([77, 0, 75, 0.10]);
    var simpleFillSymbolSolid = esri.symbol.SimpleFillSymbol.STYLE_SOLID;
    var simpleLineSymbolNull = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL, outlineClr, 1);
    
    AppGlobals['MarketShedTool']['twoHourSymbol'] = new esri.symbol.SimpleFillSymbol(simpleFillSymbolSolid, simpleLineSymbolNull, twoClr);
    AppGlobals['MarketShedTool']['fourHourSymbol'] = new esri.symbol.SimpleFillSymbol(simpleFillSymbolSolid, simpleLineSymbolNull, fourClr);
    AppGlobals['MarketShedTool']['sixHourSymbol'] = new esri.symbol.SimpleFillSymbol(simpleFillSymbolSolid, simpleLineSymbolNull, sixClr);
    AppGlobals['MarketShedTool']['eightHourSymbol'] = new esri.symbol.SimpleFillSymbol(simpleFillSymbolSolid, simpleLineSymbolNull, eightClr);	
    
    AppGlobals['MarketShedTool']['twoHourColor'] = twoClr;
    AppGlobals['MarketShedTool']['fourHourColor'] = fourClr;
    AppGlobals['MarketShedTool']['sixHourColor'] = sixClr;
    AppGlobals['MarketShedTool']['eightHourColor'] = eightClr;
    
    AppGlobals['MarketShedTool']['highlightSymbol'] = new esri.symbol.SimpleFillSymbol(simpleFillSymbolSolid, new esri.symbol.SimpleLineSymbol(simpleFillSymbolSolid, highlightColor, 1), highlightColor);
}

function initNewMarketShedToolRun(uniqueID) {
	
	function initMarketShedKey(key) {
		
		AppGlobals['MarketShedTool']['Results'][uniqueID][key] = {};
		AppGlobals['MarketShedTool']['Results'][uniqueID][key]['rows'] = [];
	}
	
	initMarketShedKey('twoHour');
	initMarketShedKey('fourHour');
	initMarketShedKey('sixHour');
	initMarketShedKey('eightHour');
}

function getUniqueID() {
	
	if(!this.uid) {
		this.uid = 0;
	}
	return "UID" + this.uid++;
}

function loadMarketShedResultGeometry(features, uniqueID, uniqueLayerID) {
	
    var extent = null;
    var spatialReference = new esri.SpatialReference({wkid:102100});
   
    features.forEach(function(featuresObj) {
    	
    	var route = featuresObj.feature;
	    route.setSpatialReference(spatialReference);
	    var hourKey = featuresObj.hourCode;
	    var symbol = AppGlobals['MarketShedTool'][hourKey+"Symbol"];

    	var onResultSelectUniqueID = uniqueID + AppGlobals['MarketShedTool'][hourKey+'Color'].toRgb().join("");
    	var toolGraphicID = addToolGraphicAndGetID(route, symbol, "summarizeMarket", uniqueLayerID);
    	
    	var onSelect = function() {
			AppGlobals['ToolGraphics'][toolGraphicID].setSymbol(AppGlobals['MarketShedTool']['highlightSymbol']);
    	};
    	var onDeselect = function() {
			AppGlobals['ToolGraphics'][toolGraphicID].setSymbol(symbol);
			AppGlobals['ToolGraphics'][toolGraphicID].geometry.uniqueID = onResultSelectUniqueID;
    	};
    	addComponentOnSelect(onResultSelectUniqueID, 'map', onSelect, onDeselect);
    	onDeselect();
    	
	    if(!extent) {
	    	extent = route.getExtent();
	    }
	    else {
	    	extent = extent.union(route.getExtent());
	    }
	});
    AppGlobals['Map'].setExtent(extent.expand(1.5));
}

function createSymbol(hexColorString) {

    var colorObj = new dojo.Color(hexColorString);
    var simpleFillSymbolSolid = esri.symbol.SimpleFillSymbol.STYLE_SOLID;
    var simpleLineSymbolNull = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL, colorObj, 1);
    var symbol = new esri.symbol.SimpleFillSymbol(simpleFillSymbolSolid, simpleLineSymbolNull, colorObj);
    
    return symbol;
}

function loadMarketShedResults(result, uniqueID, layerObj, accordianTitleTop) {
	
	var indicatorValueList = result['ValueList'];
	if(indicatorValueList.length === 0) {
		onToolExecuteComplete();
		return;
	}
	
	var labelAndHourKeyObj = {
		'2 hrs':{'label':2,'hourKey':'twoHour'},
		'4 hrs':{'label':4,'hourKey':'fourHour'},
		'6 hrs':{'label':6,'hourKey':'sixHour'},
		'8 hrs':{'label':8,'hourKey':'eightHour'},
		0:{'label':2,'hourKey':'twoHour'},
		1:{'label':4,'hourKey':'fourHour'},
		2:{'label':6,'hourKey':'sixHour'},
		3:{'label':8,'hourKey':'eightHour'}
	};
	
	var indicatorColumnIndicies = {};
	var activeIndicatorColumnNames = getListFromActiveLayers("name");
	result['ColumnList'].forEach(function(obj) {
		
		var columnName = obj['ColumnName'];
		if(activeIndicatorColumnNames.indexOf(columnName) !== -1) {
			indicatorColumnIndicies[columnName] = obj['ColumnIndex'];
		}
	});

	var features = [];
	indicatorValueList.forEach(function(valuesArray, idx) {
		
		var wktGeometry = valuesArray[valuesArray.length-1];
		features.push({feature:convertWKTToGeometry(wktGeometry),hourCode:labelAndHourKeyObj[idx]['hourKey']});
	});
		
	activeIndicatorColumnNames.forEach(function(columnName) {
		indicatorValueList.forEach(function(valuesArray) {

			var labelValue = valuesArray[0];
			var hourKey = labelAndHourKeyObj[labelValue]['hourKey'];
			var label = labelAndHourKeyObj[labelValue]['label'];

			var valueIndex = indicatorColumnIndicies[columnName];
			var value = getIndicatorValueForAnalyticDisplay(columnName, valuesArray[valueIndex]);
			
			addMarketShedResultTableRow(uniqueID, columnName, value, hourKey);		
			addMarketShedResultChartRow(uniqueID, columnName, value, hourKey, label);
		});
	});

	loadMarketShedResultGeometry(features, uniqueID, layerObj['mapLayerID']);
	
	var onToolResultCloseFunction = function() {
		removeInertLayerFromList(layerObj['dmsl'], layerObj['ActiveLayerDivID']);
	};
	
	var shapefileFullpath = result['ColumnList'][result['ColumnList'].length - 1]['ColumnDesc'];
	var dataDownloadsObj = {'title':'Download shapefile', 'url':shapefileFullpath};
		
	var accordianTitleBottom = createAccordianTitle();
	
	onToolResult(uniqueID, accordianTitleTop, accordianTitleBottom, onToolResultCloseFunction, function(tablesDiv, chartsDiv, callback) {

		createMarketShedTable(tablesDiv, uniqueID);
		creatMarketShedChart(chartsDiv, uniqueID, AppGlobals['MarketShedTool']['chartRows'][uniqueID]);
		onToolExecuteComplete();
		setActiveToolDisabled();
		callback();
		
	}, dataDownloadsObj);
}

function setActiveToolDisabled() {
	
	AppGlobals['ActiveToolEnabled'] = false;
	dojo.style(dojo.byId("map_container"), "cursor", "default");
}

var G_AnalysisCount = 0;

function getNextAnalysisTitle(dontIncrement) {
	
	if(!dontIncrement) {
		G_AnalysisCount++;
	}
	
	if(G_AnalysisCount === 0) {
		G_AnalysisCount = 1;
	}
	
	return "Analysis " + G_AnalysisCount;
}

function addMarketShedResultTableRow(uniqueID, columnName, value, hourKey) {
	
	var indicatorResultsObj = {"name":columnName, "value":value};
	AppGlobals['MarketShedTool']['Results'][uniqueID][hourKey]['rows'].push(indicatorResultsObj);
}

function addMarketShedResultChartRow(uniqueID, columnName, value, hourKey, label) {
	
	if(!AppGlobals['MarketShedTool']['chartRows'][uniqueID][columnName]) {
		AppGlobals['MarketShedTool']['chartRows'][uniqueID][columnName] = {};
		AppGlobals['MarketShedTool']['chartRows'][uniqueID][columnName]['values'] = [];
		AppGlobals['MarketShedTool']['chartRows'][uniqueID][columnName]['chartTitle'] = createChartTitle(columnName);		
	}
	
	var id = columnName + hourKey + value;
	id = id.replace(".","").replace(",","");
	
	var onResultSelectUniqueID = uniqueID + AppGlobals['MarketShedTool'][hourKey+"Color"].toRgb().join("");;

	AppGlobals['MarketShedTool']['chartRows'][uniqueID][columnName]['values'].push({
		indicator:columnName,
		value:value, 
		fillColor: AppGlobals['MarketShedTool'][hourKey+"Color"],
		id:id,
		label:label, 
		uniqueID:onResultSelectUniqueID,
		symbol:AppGlobals['MarketShedTool'][hourKey+"Symbol"]
	});
	
	var onSelect = function() {
		d3.select("#"+id).attr("fill", "rgb(255,255,0)");
	};
	var onDeselect = function() {
		d3.select("#"+id).attr("fill", AppGlobals['MarketShedTool'][hourKey+"Color"].toCss());
	};
	addComponentCollectionOnSelect(onResultSelectUniqueID, 'chart', onSelect, onDeselect);
}

function createChart(chartsDivID, chartTitle, values, yAxisLabel, noPaddingLeft) {
		
	var chartID = chartsDivID + getUniqueID() +  "_chart";
	var chartPlaceholderDivID = chartID + "_div";
	dojo.place('<div class="resultChart" id="'+chartPlaceholderDivID+'"></div>', dojo.byId(chartsDivID));		
	var chartPlaceholderContainerDivID = chartID + "_container";
	dojo.place('<div id="'+chartPlaceholderContainerDivID+'"></div>', dojo.byId(chartPlaceholderDivID));
	
	var chartTitleFontSize = 14;
	var chartTitleHeight = 14;
	
	var padding = {top:20, bottom:20, left:20, right:20}; 
	var barHeight = 20;
	var barLabelFontSize = barHeight/2;
	var axisFontSize = chartTitleFontSize;
	var verticalPaddingBetweenBars = barHeight/4;
	var barLabelCenterY = (barHeight - barLabelFontSize/2) - verticalPaddingBetweenBars/2;
	var barHeightWithPadding = barHeight + verticalPaddingBetweenBars;
	var totalheightOfBarsWithPadding = barHeightWithPadding * values.length;
	var chartHeight = totalheightOfBarsWithPadding;
	var yPaddingTotal = padding.top + padding.bottom;
	var xAxisLabelsHeight = 14;
	var paddingBetweenChartTitleAndChart = 25;

	var svgHeight = chartHeight; 
	svgHeight += yPaddingTotal;
	svgHeight += chartTitleHeight;
	svgHeight += paddingBetweenChartTitleAndChart;
	svgHeight += xAxisLabelsHeight;
	
	var xPaddingTotal = padding.left + padding.right;
	var yAxisLabelWidth = getWidthForChartYAxisLabel(values, 'label');
	var valueLabelWidth = getWidthForChartYAxisLabel(values, 'value');		
	var chartWidth = AppConstants['CHART_WIDTH'];
	var paddingBetweenYLabelAndChart = noPaddingLeft ? 0 : 25;
	var paddingBetweenBarAndBarValue = 5;
	var paddingBetweenYAxisLabelAndChartTitle = noPaddingLeft ? 0 : 10;
	
	var svgWidth = chartWidth;
	svgWidth += yAxisLabelWidth; 
	svgWidth += valueLabelWidth;
	svgWidth += xPaddingTotal;
	svgWidth += paddingBetweenYLabelAndChart;
	svgWidth += paddingBetweenBarAndBarValue;
	svgWidth += paddingBetweenYAxisLabelAndChartTitle;
	
	var chartStartYPos = padding.top + paddingBetweenChartTitleAndChart;
	var chartStartXPos = yAxisLabelWidth + padding.left + paddingBetweenBarAndBarValue + paddingBetweenYLabelAndChart;
	var xAxisLabelsYStartPos = chartStartYPos + chartHeight;
	 
	var svg = d3.select("#"+chartPlaceholderContainerDivID)
		.append("svg")
		.attr("id", chartID)
		.attr("width", svgWidth)
		.attr("height", svgHeight);	
	
	svg.append("text")
	    .text(chartTitle)
	    .attr("x", svgWidth/2)
	    .attr("y", 12)
	    .attr("text-anchor", "middle")
	    .attr("height",chartTitleHeight)
	    .attr("font-weight", "bold")
	    .attr("font-size", chartTitleFontSize);
	
	svg.append("text")
	    .text(yAxisLabel)
	    .attr("x", padding.left)
	    .attr("y", padding.top)
	    .attr("font-size", axisFontSize);
			
	svg.selectAll("text.xAxisLabel")
		.data(values)
	    .enter()
	    .append("text")
	    .attr("class", "xAxisLabel")
	    .text(function(d) {
	    	return d['label'];
	    })
	    .attr("x", padding.left)
	    .attr("y", function(d, i) { 
	    	return chartStartYPos + (i * barHeightWithPadding) + barLabelCenterY;
	    })
	    .attr("fill", "black")
	    .attr("font-size", axisFontSize);
	
	var chart = svg.append("svg")
		.attr("x", chartStartXPos)
	    .attr("y", chartStartYPos)
	    .attr("width", chartWidth)
	    .attr("height", chartHeight);
			
	var maxValue = getMaxValueFromArrayOfObjectsWithKey(values, 'value');
	var x = d3.scale.linear()
		.domain([0, maxValue])
		.range([0, chartWidth]);
	
	var numberOfTicks = 5;
	chart.selectAll("line")
	.data(x.ticks(numberOfTicks))
	.enter()
	.append("line")
		.attr("x1", x)
		.attr("x2", x)
		.attr("y1", 0)
		.attr("y2", chartHeight)
		.style("stroke", "#ccc");
	
	chart.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", chartHeight)
		.style("stroke-width", "5")
		.style("stroke", "#ccc");
	
	chart.append("line")
		.attr("x1", 0)
		.attr("y1", chartHeight)
		.attr("x2", chartWidth)
		.attr("y2", chartHeight)
		.style("stroke-width", "5")
		.style("stroke", "#ccc");
	
	var f = d3.format("s");
	svg.selectAll(".rule")
		.data(x.ticks(numberOfTicks))
		.enter()
		.append("text")
			.attr("class", "rule")
			.attr("x", x)
			.attr("dx", chartStartXPos)
			.attr("y", 40)
			.attr("dy", 0)
			.attr("font-size", 14)
			.attr("text-anchor", "middle")
			.text(function(d) {
				return f(d);
			});

	chart.selectAll("rect")
		.data(values)
	    .enter()
	    .append("rect")
	    .attr("id", function(d, idx) {
	    	return d['id'];
	    })
	    .attr("y", function(d, i) { 
	    	return (i * barHeightWithPadding);
	    })
	    .attr("x", 0)
		.attr("fill", function(d, i) {
		    return d['fillColor'].toCss();
		})
	    .attr("height", barHeight)
		.on('mouseover', function(d, i) {
			d3.select(this).attr("opacity", 0.8);
		})
		.on('mouseout', function(d, i) {
			d3.select(this).attr("opacity", 1);
		})
		.attr("width", function(d) {
	    	return x(d['value']);
	    })
	    .on("click",function(d,i) {
	    	selectResultComponents(d['uniqueID']);
	    });

	svg.selectAll("text.value")
		.data(values)
	    .enter()
	    .append("text")
	    .attr("class", "value")
	    .text(function(d) {
	    	return getNumberWithCommas(d['value']);
	    })
	    .attr("y", function(d, i) { 
	    	return (i * barHeightWithPadding) + barLabelCenterY + chartStartYPos;
	    })
	    .attr("x", function(d) {
	    	return chartStartXPos + x(d['value']) + paddingBetweenBarAndBarValue;
	    })
	    .attr("fill", "#000")
	    .attr("font-size", barLabelFontSize);

		var xAxis = d3.svg.axis()
	        .scale(x)
	        .orient("bottom")
	        .ticks(4);

		svg.append("g")
			.attr("class", "axis")
			.attr("height",xAxisLabelsHeight)
			.style("fill", "none")
			.style("shape-rendering", "crispEdges")
			.style("stroke-width", "1px")
			.style("stroke", "#000")
			.attr("transform", "translate("+chartStartXPos+"," + xAxisLabelsYStartPos + ")")
	    	.call(xAxis);
	
	addChartDownloadButton(chartPlaceholderDivID, chartPlaceholderContainerDivID, chartID, svgHeight, svgWidth, 'chart');
}

function createColumnGroupsChart(chartsDivID, chartTitle, groupPermutations) {
	
	var uniqueID = getUniqueID();
	var chartsDivNode = dojo.byId(chartsDivID);
	var chartID = chartsDivID + uniqueID  +  "_chart";
	var shuffleAxisButtonID = uniqueID + "shuffle";
	var chartPlaceholderDivID = chartID + "_div";
	var yAxisLabelDivID = chartID + "yAxisLabel";
	
	if(dojo.byId(chartPlaceholderDivID)) {
		dojo.destroy(chartPlaceholderDivID);
	}
	
	dojo.place('<div class="resultChart" id="'+chartPlaceholderDivID+'"></div>', chartsDivNode);
	
	var chartShuffler = new ChartShuffle(groupPermutations, chartID, chartPlaceholderDivID, yAxisLabelDivID, chartTitle);
	
	if(groupPermutations.length > 1) {
		
		dojo.place('<div id="'+shuffleAxisButtonID+'" class="chartShuffleButton">Shuffle Axes<div>', dojo.byId(chartPlaceholderDivID));
		var shuffleAxisButtonNode = dojo.byId(shuffleAxisButtonID);
		dojo.connect(shuffleAxisButtonNode, "onclick", chartShuffler.executeChartShuffle);
		
		dojo.place('<div id="'+yAxisLabelDivID+'" class="axisLabel"></div>', shuffleAxisButtonNode);
		dojo.place('<div id="'+yAxisLabelDivID+'_series" class="axisLabel"></div>', shuffleAxisButtonNode);

	}
	chartShuffler.executeChartShuffle();
}

function shuffleAndShowChart(chartID, chartPlaceholderDivID, chartPlaceholderContainerDivID, valuesGroups, chartTitle) {
	
	var totalColumnsForAllGroups = (function() {
		var totalColumns = 0;
		dojo.forEach(valuesGroups, function(obj) {
			if(obj['groupValues'].length === 0) {
				obj['groupValues'] = [{
					series: obj['groupLabel'],
					fillColor:new dojo.Color('transparent'),
					value:null
				}];
			}
			totalColumns += obj['groupValues'].length;
		});
		return totalColumns;
	})();
	
	var axisFontSize = 14;
	var numberOfColumnGroups = valuesGroups.length;
	var numberOfColumnsPerGroup = totalColumnsForAllGroups / numberOfColumnGroups;
	
	if(numberOfColumnsPerGroup === 0) {
		$("#"+chartPlaceholderDivID).hide().siblings().hide();
		return;
	}
	
	var paddingBetweenColumnGroups = 15;
	var totalPaddingForColumnGroups = numberOfColumnGroups * paddingBetweenColumnGroups;
	
	var barHeight = axisFontSize * 2;
	var barLabelFontSize = axisFontSize;
	var barHeightWithPadding = barHeight;
	
	var totalheightOfBarsWithPadding = barHeightWithPadding * totalColumnsForAllGroups;
	var totalheightOfBarGroupWithPadding = barHeightWithPadding * numberOfColumnsPerGroup;
	var barLabelCenterY = (barHeight - barLabelFontSize/2);
	
	var chartTitleFontSize = 14;
	var chartTitleHeight = 14;	
	var padding = {top:20, bottom:0, left:20, right:20}; 

	var chartHeight = 0;
	chartHeight += totalheightOfBarsWithPadding;
	chartHeight += totalPaddingForColumnGroups;
	
	var yPaddingTotal = padding.top + padding.bottom;
	var paddingBetweenChartTitleAndChart = 25;

	var svgHeight = 0;
	svgHeight += chartHeight; 
	svgHeight+= yPaddingTotal;
	svgHeight += chartTitleHeight;
	svgHeight += paddingBetweenChartTitleAndChart;
		
	var yAxisLabelWidth = (function() {
		var maxValues = [];
		dojo.forEach(valuesGroups, function(obj) {
			maxValues.push(getWidthOfString(obj['groupLabel']));
		});
		return Math.max.apply(Math, maxValues);
	})();

	var valueLabelWidth = (function() {
		var maxValues = [];
		dojo.forEach(valuesGroups, function(obj) {
			maxValues.push(getWidthForChartYAxisLabel(obj['groupValues'], 'value'));
		});
		return Math.max.apply(Math, maxValues);
	})();
	
	var chartWidth = AppConstants['CHART_WIDTH'];
	var xPaddingTotal = padding.left + padding.right;
	var paddingBetweenYLabelAndChart = 15;
	var paddingBetweenBarAndBarValue = 5;
	var paddingBetweenYAxisLabelAndChartTitle = 10;
	
	var svgWidth = chartWidth;
	svgWidth += yAxisLabelWidth; 
	svgWidth += valueLabelWidth;
	svgWidth += xPaddingTotal;
	svgWidth += paddingBetweenYLabelAndChart;
	svgWidth += paddingBetweenBarAndBarValue;
	svgWidth += paddingBetweenYAxisLabelAndChartTitle;
	
	var chartStartYPos = padding.top + paddingBetweenChartTitleAndChart;
	var chartStartXPos = yAxisLabelWidth + padding.left + paddingBetweenBarAndBarValue + paddingBetweenYLabelAndChart;
	 
	var svg = d3.select("#"+chartPlaceholderContainerDivID)
		.append("svg")
		.attr("id", chartID)
		.attr("width", svgWidth)
		.attr("height", svgHeight);	
	
	svg.append("text")
	    .text(chartTitle)
	    .attr("x", svgWidth/2)
	    .attr("y", 12)
	    .attr("text-anchor", "middle")
	    .attr("height",chartTitleHeight)
	    .attr("font-weight", "bold")
	    .attr("font-size", chartTitleFontSize);
	
	var maxValueForAllGroups = (function() {
		var maxValues = [];
		dojo.forEach(valuesGroups, function(obj) {
			var maxValueForGroup = getMaxValueFromArrayOfObjectsWithKey(obj['groupValues'], 'value');
			maxValues.push(maxValueForGroup);
		});
		return Math.max.apply(Math, maxValues);
	})();
	
	
	var x = d3.scale.linear()
	.domain([0, maxValueForAllGroups])
	.range([0, chartWidth]);
	

	svg.selectAll("text.yAxisLabel")
		.data(valuesGroups)
		.enter()
	    .append("text")
	    .attr("class", "yAxisLabel")
	    .text(function(d) {
	    	return d['groupLabel'];
	    })
	    .attr("x",padding.left + yAxisLabelWidth)
	    .attr("y", function(d, i) { 
	    	return chartStartYPos + (i * (totalheightOfBarGroupWithPadding + paddingBetweenColumnGroups)) + totalheightOfBarGroupWithPadding/2;	    	
	    })
	    .attr("text-anchor", "end")
	    .attr("fill", "black")
	    .attr("font-size", axisFontSize);

	var chart = svg.append("svg")
		.attr("x", chartStartXPos)
	    .attr("y", chartStartYPos)
	    .attr("width", chartWidth)
	    .attr("height", chartHeight);

		
	var totalGroupValues = (function() {
		var values = [];
		dojo.forEach(valuesGroups, function(groupObj) {
			values.push.apply(values, groupObj['groupValues']);
		});
		return values;
	})();
	
	var labelYOffset = 0;
	var barYOffset = 0;
	
	var numberOfTicks = 5;
	chart.selectAll("line")
	.data(x.ticks(numberOfTicks))
	.enter()
	.append("line")
		.attr("x1", x)
		.attr("x2", x)
		.attr("y1", 0)
		.attr("y2", chartHeight)
		.style("stroke", "#ccc");
	
	chart.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", chartHeight)
		.style("stroke-width", "5")
		.style("stroke", "#ccc");
	
	chart.append("line")
		.attr("x1", 0)
		.attr("y1", chartHeight)
		.attr("x2", chartWidth)
		.attr("y2", chartHeight)
		.style("stroke-width", "5")
		.style("stroke", "#ccc");
	
	var f = d3.format("s");
	svg.selectAll(".rule")
		.data(x.ticks(numberOfTicks))
		.enter()
		.append("text")
			.attr("class", "rule")
			.attr("x", x)
			.attr("dx", chartStartXPos)
			.attr("y", 40)
			.attr("dy", 0)
			.attr("font-size", 14)
			.attr("text-anchor", "middle")
			.text(function(d) {
				return f(d);
			});
	
	chart.selectAll("rect")
		.data(totalGroupValues)
	    .enter()
	    .append("rect")
	    .attr("id", function(d, i) {	
	    	return d['id'];		    	
	    })
	    .attr("x", 0)
	    .attr("opacity", 0.8)
		.attr("fill", function(d, i) {
		    return d['fillColor'].toCss();
		})
	    .attr("height", barHeight)
		.on('mouseover', function(d, i) {
			d3.select(this).attr("opacity", 0.4);
		})
		.on('mouseout', function(d, i) {
			d3.select(this).attr("opacity", 0.8);
		})
		.attr("y", function(d, i) { 
			
			if(i % numberOfColumnsPerGroup === 0 && i !== 0) {
				barYOffset += paddingBetweenColumnGroups;
			}
			return  (i * barHeightWithPadding) + barYOffset;
	    })
		.attr("width", function(d) {
			if(d['value'] === null) {
				return 0;
			}
	    	return x(d['value']);
	    }).on("click",function(d, i) {	    	
	    	selectResultComponents(d['uniqueID']);
	    });

	svg.selectAll("text.value")
		.data(totalGroupValues)
	    .enter()
	    .append("text")
	    .attr("class", "value")
	    .text(function(d) {
	    	return getNumberWithCommas(d['value']);
	    })
	    .attr("y", function(d, i) { 
	    	
			if(i % numberOfColumnsPerGroup === 0 && i !== 0) {
				labelYOffset += paddingBetweenColumnGroups;
			}
			return chartStartYPos + (i * barHeightWithPadding) + barLabelCenterY + labelYOffset;
	    })
	    .attr("x", function(d) {
	    	if(d['value'] === 0) {
		    	return chartStartXPos + 0 + paddingBetweenBarAndBarValue;
	    	}
	    	return chartStartXPos + x(d['value']) + paddingBetweenBarAndBarValue;
	    })
	    .attr("fill", "#000")
	    .attr("font-size", barLabelFontSize);
	
	addChartDownloadButton(chartPlaceholderDivID, chartPlaceholderContainerDivID, chartID, svgHeight, svgWidth, 'chart');
}

function ChartShuffle(groupPermutations, chartID, chartPlaceholderDivID, yAxisLabelDivID, chartTitle) {
	
	this.groupPermutationsList = groupPermutations;
	this.groupPermutationsCount = groupPermutations.length;
	this.currentIndex = 0;
	var self = this;
	
	this.executeChartShuffle = function() {
					
		var chartPlaceholderContainerDivID = chartID + "_container";
		if(dojo.byId(chartPlaceholderContainerDivID)) {
			dojo.destroy(chartPlaceholderContainerDivID);
		}
		dojo.place('<div id="'+chartPlaceholderContainerDivID+'"></div>', dojo.byId(chartPlaceholderDivID), "first");
		
		if(self.currentIndex >= self.groupPermutationsCount) {
			self.currentIndex = 0;
		}
		var values = self.groupPermutationsList[self.currentIndex]['values'];
		shuffleAndShowChart(chartID, chartPlaceholderDivID, chartPlaceholderContainerDivID, values, chartTitle);

		var yAxisNode = dojo.byId(yAxisLabelDivID);
		var seriesLabelNode = dojo.byId(yAxisLabelDivID + "_series");
		var o = self.groupPermutationsList[self.currentIndex];
		
		if(yAxisNode && o) {
			yAxisNode.innerHTML =  "Y-axis: " + o['yAxisLabel'];
			var nextIndex = (self.currentIndex + 1) == self.groupPermutationsCount ? 0:1;
			var seriesLabel = self.groupPermutationsList[nextIndex]['yAxisLabel'];
			seriesLabelNode.innerHTML = "Series: " + seriesLabel;
		}
		self.currentIndex++;
	};
}

function creatMarketShedChart(parentDiv, uniqueID, data) {
	
	var chartsDivID = "MarketShedChart" + uniqueID;	
	dojo.place('<div id="'+chartsDivID+'"></div>', dojo.byId(parentDiv), "last");
	var yAxisLabel = "Hours";
	
	for(columnName in data) {
		(function() {
			var indicatorObj = data[columnName];
			createChart(chartsDivID, indicatorObj['chartTitle'], indicatorObj['values'], yAxisLabel);
		})();
	}
}

function appendMarketShedRow(rowID, color, rows, hour) {
	
	var html = "";
	html += '<tr id="'+rowID+'">';
	html += '<td class="colorSwatch" style="background:'+color.toHex()+'"></td>';
	html += '<td>'+hour+' Hr.</td>';
	dojo.forEach(rows, function(row) {
		html += '<td>'+getNumberWithCommas(row['value'])+'</td>';
	});
    html += "</tr>";
    
    return html;
}

function createMarketShedTable(tableDiv, uniqueID) {
	
    var twoHourRowID = uniqueID + AppGlobals['MarketShedTool']['twoHourColor'].toRgb().join("");
    var fourHourRowID = uniqueID + AppGlobals['MarketShedTool']['fourHourColor'].toRgb().join("");
    var sixHourRowID = uniqueID + AppGlobals['MarketShedTool']['sixHourColor'].toRgb().join("");
    var eightHourRowID = uniqueID + AppGlobals['MarketShedTool']['eightHourColor'].toRgb().join("");
	
	var createTableRowsFunc = function() {
				
	    var rowHTML = "";
	    rowHTML += appendMarketShedRow(twoHourRowID, AppGlobals['MarketShedTool']['twoHourColor'], AppGlobals['MarketShedTool']['Results'][uniqueID]['twoHour']['rows'], "2");
	    rowHTML += appendMarketShedRow(fourHourRowID, AppGlobals['MarketShedTool']['fourHourColor'], AppGlobals['MarketShedTool']['Results'][uniqueID]['fourHour']['rows'], "4");
	    rowHTML += appendMarketShedRow(sixHourRowID, AppGlobals['MarketShedTool']['sixHourColor'], AppGlobals['MarketShedTool']['Results'][uniqueID]['sixHour']['rows'], "6");
	    rowHTML += appendMarketShedRow(eightHourRowID, AppGlobals['MarketShedTool']['eightHourColor'], AppGlobals['MarketShedTool']['Results'][uniqueID]['eightHour']['rows'], "8");

	    return rowHTML;
	};
	
	var tableDivID = uniqueID + "TableDiv";
    var table = dojo.byId(tableDivID);
    if(table) {
    	dojo.destroy(table);
    }

    var tableID = uniqueID + "Table";
    var tableHTML = '<div id="'+tableDivID+'" class="summaryTable"><table id="'+tableID+'" cellpadding="0" cellspacing="0">';
    tableHTML += '<thead><tr>';
    tableHTML += '<th></th>';
    tableHTML += '<th>Travel Time</th>';
    
    dojo.forEach(getActiveLayers(true), function(indicator) {
    	
		var indicatorObj = indicator['indicatorInfo'];
		tableHTML += '<th>'+createIndicatorLabel(indicatorObj, '<br>')+'</th>';
    });
    tableHTML += '</tr></thead><tbody>' + createTableRowsFunc() + '</tbody></table><div>';

    dojo.place(tableHTML, dojo.byId(tableDiv));
    
    connectTableRowOnClick(twoHourRowID, uniqueID, "twoHour");
    connectTableRowOnClick(fourHourRowID, uniqueID, "fourHour");
    connectTableRowOnClick(sixHourRowID, uniqueID, "sixHour");
    connectTableRowOnClick(eightHourRowID, uniqueID, "eightHour");
    
    initCSVDownloadButton(tableID, tableDivID, "Summary Variables for Mappr TravelTime", "MarketFinder");
}

function getIndicatorValueForAnalyticDisplay(columnName, value) {
	
	if(columnName === "CELL5M") {
		return parseInt(value);
	}
	
	if(isNaN(parseFloat(value))) {
		return "No Data";
	}
	
	var indicatorInfo = AppGlobals['LayerIndicatorInfo'][columnName];
	var decimalPlaces = indicatorInfo ? indicatorInfo['DecimalPlaces'] : 0;
	
	return parseFloat(value).toFixed(decimalPlaces);
}

function connectTableRowOnClick(rowId) {
	
	var onResultSelectUniqueID = rowId;
	var rowIdNode = dojo.byId(rowId);
	var onSelect = function() {
		dojo.style(rowIdNode, "background", "rgb(255, 255, 0)");
	};
	var onDeselect = function() {
		dojo.style(rowIdNode, "background", "rgb(255, 255, 255)");
	};
	addComponentOnSelect(onResultSelectUniqueID, 'table', onSelect, onDeselect);
	
	dojo.connect(rowIdNode, "onclick", function() {
		selectResultComponents(onResultSelectUniqueID);
	});
}

function retrieveMarketShedTableResults(wktList, indicatorIdsList, resultList, uniqueID, callback) {
	
	var numberOfWKTRemaning = wktList.length;
	var currentWKT = (4 - numberOfWKTRemaning) + 1;
	updateLoadingMessage("ToolExecuting", "Summarizing areas (" + currentWKT + "/4)");

	if(wktList.length === 0) {
		callback(uniqueID);		
		return;
	}
	
	var wktGeom = wktList.pop();
	var indicatorArgs = "indicatorIds=" + indicatorIdsList.join("&indicatorIds=");
	var args = indicatorArgs + "&wktGeometry="+wktGeom;
	dojoXHRGet(AppConstants['CellValuesServiceURL'] + "?" + args, function(result) {
		
		resultList.push(result);
		retrieveMarketShedTableResults(wktList, indicatorIdsList, resultList, uniqueID, callback);
	});
}

function geomToWKT(geom) {
	
    var innerRingWKT = [];
    var geomRings = geom.rings;
    
    dojo.forEach(geomRings, function (ring, idx) {
    	
        var wktCoords = [];

        dojo.forEach(ring, function (point) {        	
        	wktCoords.push(point[0].toFixed(3) + " " + point[1].toFixed(3));
        });
            
        if(idx === ring.length) {
        	wktCoords.push(wktCoords[0]);
        }
        innerRingWKT.push("(" + wktCoords.join(",") + ")");
    });
        
    return "POLYGON({0})".replace('{0}', innerRingWKT.join(","));
}

function initOptionsMenuNub() {
	
	initBasemapOnClicks();
	initBoundryCheckboxes();
	initNubMenu("optionsNubIcon", AppConstants['OPTIONS_NUB_WIDTH_PX'], "optionsNubMenuContainer", "optionsNubArrowDiv", closeToolsNubMenu, hideAllNubContainers);
	initNubButton("basemapsButton","basemapsContainer", AppConstants['BASEMAP_CONTAINER_HEIGHT_PX']);
	initNubButton("boundriesButton", "boundriesContainer", AppConstants['BOUNDRY_CONTAINER_HEIGHT_PX']);
}

function initBoundryCheckboxes() {
	
	addBoundryItemCheckbox("admin0BoundryCheckBox", "admin0CheckboxDiv", "admin0Boundry", AppConstants['AdminBoundryMapServiceURL'], 2);
	addBoundryItemCheckbox("admin1BoundryCheckBox", "admin1CheckboxDiv", "admin1Boundry", AppConstants['AdminBoundryMapServiceURL'], 3);
	addBoundryItemCheckbox("admin2BoundryCheckBox", "admin2CheckboxDiv", "admin2Boundry", AppConstants['AdminBoundryMapServiceURL'], 4);
	addBoundryItemCheckbox("cell5mBoundryCheckBox", "cell5mCheckboxDiv", "cell5mGrid", AppConstants['Cell5MGridMapServiceURL'], null);
}

function addBoundryItemCheckbox(checkboxID, checkBoxDiv, boundryKey, boundryMapServiceURL, boundryMapServiceIndex) {
	
	var onSelect = function(checked) {
		if(checked) {
			addBoundryToMap(boundryKey, boundryMapServiceURL, boundryMapServiceIndex);
		}
		else {
			removeBoundryLayerFromMap(boundryKey);
		}
	};
	addCheckbox(checkboxID, checkBoxDiv, onSelect);
}

function addBoundryToMap(boundryKey, mapServiceURL, index) {
	
	AppGlobals['BoundryLayerGlobals']['Layers'][boundryKey] = new esri.layers.ArcGISDynamicMapServiceLayer(mapServiceURL);
	
	fireOneTimeConnectEvent(AppGlobals['BoundryLayerGlobals']['Layers'][boundryKey], "onLoad", function() {
		
		if(index !== null) {
			AppGlobals['BoundryLayerGlobals']['Layers'][boundryKey].setVisibleLayers([index]);

			if(boundryKey !== "cell5mGrid") {
				var layerDefinitions = [];
				layerDefinitions[index] = getADM0WhereClauseForBoundaryLayer();
				AppGlobals['BoundryLayerGlobals']['Layers'][boundryKey].setLayerDefinitions(layerDefinitions);	
			}
		}
		addBoundryToMapProcedure(boundryKey);
	});		
}

var iso3ToCorrectCountryNameMap = {
	'CMR':"Cameroon",
	'CIV':'Ivory Coast',
	'TZA':'United Republic of Tanzania',
	'COD':'Democratic Republic of the Congo',
	'COG':'Congo'
};

function getADM0WhereClauseForBoundaryLayer() {

	var query = "ADM0_NAME IN (";
	var singleQuoteValues = AppGlobals['RegionMegaDropDown']['ISO3List'].filter(function(iso3) {
		return AppGlobals['ISO3CountryMap'][iso3];
	});
	singleQuoteValues = singleQuoteValues.map(function(iso3) {		
		var countryName = iso3ToCorrectCountryNameMap[iso3] ? iso3ToCorrectCountryNameMap[iso3] : AppGlobals['ISO3CountryMap'][iso3];
		return "\'" + countryName.replace(/'/g, "\'\'") +  "\'";
	});
	query += singleQuoteValues.join(",");
	query += ")";
	return query;
}

function addBoundryToMapProcedure(adminBoundry) {
	
	fireOneTimeConnectEvent(AppGlobals['Map'], "onLayerAdd", function() {
		
		AppGlobals['BoundryLayerGlobals']['ActiveBoundryLayers'].push(adminBoundry);
		reorderMapLayers();
	});
	AppGlobals['Map'].addLayer(AppGlobals['BoundryLayerGlobals']['Layers'][adminBoundry], 1);
}

function removeBoundryLayerFromMap(boundryKey) {
	
	fireOneTimeConnectEvent(AppGlobals['Map'], "onLayerRemove", function() {
		
		var indexOfBoundry = AppGlobals['BoundryLayerGlobals']['ActiveBoundryLayers'].indexOf(boundryKey);
		AppGlobals['BoundryLayerGlobals']['ActiveBoundryLayers'].splice(indexOfBoundry, 1);
		reorderMapLayers();
	});
	AppGlobals['Map'].removeLayer(AppGlobals['BoundryLayerGlobals']['Layers'][boundryKey]);	
}

function removeAllBoundryLayersFromMap() {
	
	dojo.forEach(AppGlobals['BoundryLayerGlobals']['ActiveBoundryLayers'], function(boundryKey) {
		removeBoundryLayerFromMap(boundryKey);
	});
}

function addCheckbox(name, parentDivID, onChange) {
	
	new dijit.form.CheckBox({
        name:name,
        value:false,
        checked:false,
        onChange:onChange
    }, parentDivID);
}

function initNubButton(buttonID, containerID, height, onSelectCallback, onDeselectCallback) {
	
	var buttonNode = dojo.byId(buttonID);
	var containerNode = dojo.byId(containerID);
	var containerArrowNode = dojo.byId(containerID + "Arrow");
	
	dojo.connect(buttonNode, "onclick", function() {
		
		deselectAllNubMenuButtons();
		deselectAllNubActiveArrows();
				
		if(dojo.style(containerNode, "height") > 0) {
			
			dojo.removeClass(buttonNode, "activeToolButton");
			dojo.removeClass(containerArrowNode, "menuItemDownArrow");
			hideContainer(containerID, function() {
				dojo.style(containerNode, "display", "none");
				if(onDeselectCallback){
					onDeselectCallback();
				}
			});

		}
		else {
			
			toggleNubVisibility(containerID);
			dojo.style(containerNode, "display", "block");
			dojo.addClass(buttonNode, "activeToolButton");
			dojo.addClass(containerArrowNode, "menuItemDownArrow");
			showContainer(containerID, height, function(){});
			if(onSelectCallback) {
				onSelectCallback();
			}
		}
	});
}

function animateAllMenusUp() {
	showContainer(containerID, height, function(){});
}

function toggleNubVisibility(nubToExlude) {
	
	dojo.forEach(dojo.query(".nubMenuContainerItem"), function(node) {
		var containerID = node.id;
		if(nubToExlude === containerID) {
			return;
		}
		dojo.style(dojo.byId(containerID), "display", "none");
		dojo.style(dojo.byId(containerID), "height", "0");
	});
}

function deselectAllNubMenuButtons(buttonToExclude) {
	
	dojo.forEach(dojo.query(".activeToolButton"), function(node) {
		
		var buttonID = node.id;
		if(buttonID === buttonToExclude) {
			return;
		}
		dojo.removeClass(dojo.byId(buttonID), "activeToolButton");
	});
}

function deselectAllNubActiveArrows() {
	
	dojo.forEach(dojo.query(".menuItemDownArrow"), function(node) {
		dojo.removeClass(dojo.byId(node.id), "menuItemDownArrow");
	});
}

function hideAllNubContainers(nubToExlude, buttonToExclude) {
	
	dojo.forEach(dojo.query(".nubMenuContainerItem"), function(node) {
		var containerID = node.id;
		
		if(nubToExlude === containerID) {
			return;
		}
		
		hideContainer(containerID, function() {
			dojo.style(dojo.byId(containerID), "display", "none");
		});
	});
}

function showContainer(containerID, height, callback) {
	animateProperties(containerID, {height:{end:height, units:'px'}}, 300, callback);	
}

function hideContainer(containerID, callback) {
	animateProperties(containerID, {height:{end:0, units:'px'}}, 300, callback);	
}

function updateDomainsDropDown() {
	
	if(AppGlobals['RegionMegaDropDown']['SelectedRegionName'] === "Sub-Saharan Africa" || AppGlobals['RegionMegaDropDown']['SelectedRegionName'] === null) {
		initDomainsDropDown(AppGlobals['RestrictedDomainDropDownValues']);
	}
	else {
		initDomainsDropDown(AppGlobals['DomainDropDownValues']);
	}
}

function initDomainsDropDownArrays() {
	
	var domainsToExclude = ['2012 Region and District Boundaries', 'AGRA Breadbasket Areas', 'BMGF Strategy Domains', 'Agro-Ecological Zones (16 Class)'];
	var restrictedDomainsForSSA = ['Travel time to 50K pop. centers', 'Provinces within countries', 'Marketsheds 50K'];
	var domains = getListOfValuesFromGlobalsObject('DomainsInfo');
	domains = domains.filter(function(d){
		return domainsToExclude.indexOf(d) === -1;
	});
	AppGlobals['DomainDropDownValues'] = domains;
	AppGlobals['RestrictedDomainDropDownValues'] = dojo.filter(AppGlobals['DomainDropDownValues'], function(d) {
		return restrictedDomainsForSSA.indexOf(d) === -1;
	});
}

function initToolsMenuNub() {
	
	var onMenuItemSelect = function() {};
	
	initNubButton("summarizeTopAdminButton", "summarizeTopAdminContainer", AppConstants['TOOL_ADMIN_CONTAINER_HEIGHT_PX'], onMenuItemSelect);
	initNubButton("summarizeTopCropButton", "summarizeTopCropContainer", AppConstants['TOOL_CROP_CONTAINER_HEIGHT_PX'], onMenuItemSelect);
	
	initNubButton("summarizeLocationButton", "summarizeLocationContainer", AppConstants['TOOL_LOCATION_CONTAINER_HEIGHT_PX'], onMenuItemSelect);
	initDomainsDropDownArrays();
	initNubButton("summarizeDomainButton", "summarizeDomainContainer", AppConstants['TOOL_DOMAIN_CONTAINER_HEIGHT_PX'], function() {
		updateDomainsDropDown();
	});
	initNubButton("summarizeMarketButton", "summarizeMarketContainer", AppConstants['TOOL_MARKET_SHED_CONTAINER_HEIGHT_PX'], onMenuItemSelect);
	
	initNubMenu("toolsNubIcon", AppConstants['TOOLS_NUB_WIDTH_PX'], "toolsNubMenuContainer", "toolsNubArrowDiv", closeOptionsNubMenu, function() {
		hideAllNubContainers();
	});

	var activeLocationPointToolImg = '<img class="activeToolImg locationToolImg" id="activeToolImg" width=13 height=19 src="images/summarize_point.png"/>';
	initToolButtonOnClickEvent("summarizeLocation", activeLocationPointToolImg, "executeSummarizeLocationsButton", function() {
		
		deactivateESRIDrawingToolBar();
		closeToolsNubMenu();
	});

	var activeLocationAreaToolImg = '<img class="activeToolImg customAreaToolImg" id="activeToolImg" width=15 height=14 src="images/summarize_custom_area.png"/>';
	initToolButtonOnClickEvent("summarizeArea", activeLocationAreaToolImg, "executeSummarizeCustomAreaButton", function() {
		
		executeSummarizeCustomAreaToolMain();
		closeToolsNubMenu();
	});

	dojo.connect(dojo.byId("executeSummarizeDomainButton"), "onclick", function() {
		
		if(toolCanExecute()) {
			
			AppGlobals['ActiveTool'] = "summarizeDomain";
			
			closeToolsNubMenu();
			hideActiveToolNub();
			onToolExecute();
			deactivateESRIDrawingToolBar();
			
			var domain = dijit.byId("domainDropDown").value;
			executeDomainsTool(domain);
		}
	});
		
	dojo.connect(dojo.byId("executeSummarizeMarketButton"), "onclick", function() {
		
		if(toolCanExecute()) {
			
			AppGlobals['ActiveToolEnabled'] = true;
			dojo.style(dojo.byId("map_container"), "cursor", "crosshair");
			AppGlobals['ActiveTool'] = "summarizeMarket";
			
			hideActiveToolNub();
			deactivateESRIDrawingToolBar();
			closeToolsNubMenu();
		}
	});
	
	dojo.connect(dojo.byId("executeAdminTOPPRButton"), "onclick", function() {
		
		if(toolCanExecute()) {
			
			AppGlobals['ActiveTool'] = "summarizeTOPPRAdmin";
			
			onToolExecute();
			hideActiveToolNub();
			deactivateESRIDrawingToolBar();
			closeToolsNubMenu();
			
			executeAdminTOPPR();
		}		
	});
	dojo.connect(dojo.byId("executeCropTOPPRAdminButton"), "onclick", function() {
		
		if(!AppGlobals['ActiveToolExecuting']) {
			
			AppGlobals['ActiveTool'] = "summarizeCropTOPPR";
			closeToolsNubMenu();
			hideActiveToolNub();
			onToolExecute();
			deactivateESRIDrawingToolBar();
			executeCropTOPPRForSelectedAdmin("summarizeCropTOPPR");
		}
	});
	dojo.connect(dojo.byId("executeCropTOPPRCustomAreaButton"), "onclick", function() {
		
		if(!AppGlobals['ActiveToolExecuting']) {
			
			AppGlobals['ActiveTool'] = "summarizeCropTOPPRArea";
			closeToolsNubMenu();
			hideActiveToolNub();
			executeCropTOPPRForCustomArea();
		}
	});

	initActiveToolsButton();
}

function toolCanExecute() { 
	
	if(AppGlobals['ActiveToolExecuting'] || !activeLayersVisible()) {
		return false;
	}
	
	return atLeastOneSummarizableLayerIsVisible();
}


function getDomainTitle(d) {

	for(var domainName in AppGlobals['DomainsInfo']) {
		var domainObj = AppGlobals['DomainsInfo'][domainName];
		var domainColumnName = domainObj['DomainAreas'][0]['ColumnName'];
		if(domainColumnName === d) {
			return domainObj['DomainAreas'][0]['MicroLabel'];
		}
	}
	return d;
}

function executeAdminTOPPR() {
	executeQuickCountryStats(true);
	closeToolsNubMenu();
}

function executeDomainsTool(domain, isAdminTOPPR) {
	
	_gaq.push(['_trackEvent', 'Tools', 'Domains tool executed', domain]);
	
	var uniqueID = getUniqueID() + "_domainsTool";
	var indicatorIds = getListFromActiveLayers("indicatorId");
	var domainIdList = [AppGlobals['DomainsInfo'][domain]['Id']];
		
	var callback = function(result, countryResults) {
		
		if(result['ValueList'].length === 0) {
			onToolExecuteComplete();
			return;
		}
			
		initDomainsFeaturesForToolRun(uniqueID);
		initFillColorForToolFeature(uniqueID);
		
		var hasCountryResults = countryResults !== undefined;
		var tableResultObj = createDomainsTableObject(result, uniqueID, hasCountryResults);
		var tableRows = tableResultObj["rows"];
		var domainNamesList = tableResultObj["domainNamesList"];
		var indicatorChartGroups = createDomainsChartObject(result, uniqueID);
		
		var accordianTitleTop = getNextAnalysisTitle() + ": " + (isAdminTOPPR ? "TOP RANKINGS FOR " + domain:domain);
		
		var uniqueLayerID = uniqueID + domain;
		var layerObj = {'name':uniqueLayerID, 'id':uniqueID, 'dmsl':getUniqueGraphicsLayer(uniqueLayerID), 'label':domain};
		var activeLayerContainerDivID = addInertLayerToUserInterface(layerObj, accordianTitleTop);
		
		if(!isAdminTOPPR) {
			mapDomainFeatures(uniqueID, domain, uniqueLayerID);
		}
		
		var accordianTitleBottom = createAccordianTitle();
		var onToolResultCloseFunction = function() {
			if(!isAdminTOPPR) {
				removeInertLayerFromList(layerObj['dmsl'], activeLayerContainerDivID);
			}
		};
		
		onToolResult(uniqueID, accordianTitleTop, accordianTitleBottom, onToolResultCloseFunction, function(tablesDiv, chartsDiv, callback) {
			
			if(isAdminTOPPR === true) {
				createAdminTOPPRDomainsTable(tablesDiv, uniqueID, domainNamesList, tableRows, domain);
				$("#"+chartsDiv).parent().hide();
				callback(tablesDiv);
			}
			else {
				createDomainsTable(tablesDiv, uniqueID, domainNamesList, tableRows);
				createDomainsChart(chartsDiv, uniqueID, indicatorChartGroups);
				
				if(hasCountryResults) {
					var domainCountryTableRows = createDomainCountryRows(tableResultObj, countryResults, uniqueID);
					createDomainsTableAccordianGroup(tablesDiv, uniqueID, domainNamesList, domainCountryTableRows);
				}		
				callback();
			}		
			onToolExecuteComplete();
			setActiveToolDisabled();
		});
	};
	
	var adminUnitColumn = "countryIds";
	if(domain === "2008 Region and District Boundaries") {
		adminUnitColumn = "regionNames";
	}
	
	var indicatorArgs = "indicatorIds=" + indicatorIds.join("&indicatorIds=");
	var domainArgs = "domainIds=" + domainIdList.join("&domainIds=");
	var countryArgs = adminUnitColumn + "=" + AppGlobals['RegionMegaDropDown']['ISO3List'].join("&"+adminUnitColumn+"=");
	var args = indicatorArgs + "&" + domainArgs + "&" + countryArgs + "&returnGeometry=true";
	
	if(AppGlobals['RegionMegaDropDown']["RegionSelected"] && AppGlobals['RegionMegaDropDown']['SelectedRegionName'] !== "Sub-Saharan Africa") {
		dojoXHRGet(AppConstants['CellValuesServiceURL'] + "?" + args, function(countryResults) {
			callback(countryResults);
		});
	}
	else  {
				
		var indicatorArgs = "indicatorIds=" + indicatorIds.join("&indicatorIds=");
		var domainArgs = "domainIds=" + domainIdList.join("&domainIds=");
		var countryArgs = adminUnitColumn + "=" + AppGlobals['ISO3sForSSA'].join("&"+adminUnitColumn+"=");
		var args = indicatorArgs + "&" + domainArgs + "&" + countryArgs + "&returnGeometry=false&groupCountry=true";

		dojoXHRGet(AppConstants['CellValuesServiceURL'] + "?" + args, function(countryResults) {
			
			var indicatorArgs = "indicatorIds=" + indicatorIds.join("&indicatorIds=");
			var domainArgs = "domainIds=" + domainIdList.join("&domainIds=");
			var args = indicatorArgs + "&" + domainArgs + "&" + countryArgs + "&returnGeometry=true";
			
			dojoXHRGet(AppConstants['CellValuesServiceURL'] + "?" + args, function(aggregatedResults) {
				callback(aggregatedResults, countryResults);
			});
		});
	}
}

function createAdminTOPPRDomainsTable(tablesDivID, uniqueID, domainNamesList, tableRows, domain) {

	var indicatorCodeToValueObjs = {};
	tableRows.forEach(function(obj) {
		
		var indicatorsArray = obj['indicatorValues'];
		indicatorsArray.forEach(function(indicatorObj) {
			
			var indicatorName = indicatorObj['name'];
			if(!indicatorCodeToValueObjs[indicatorName]) {
				indicatorCodeToValueObjs[indicatorName] = {};
				indicatorCodeToValueObjs[indicatorName]['values'] = [];
				indicatorCodeToValueObjs[indicatorName]['top'] = [];
				indicatorCodeToValueObjs[indicatorName]['bottom'] = [];
			}
			indicatorCodeToValueObjs[indicatorName]['values'].push(indicatorObj);
		});
	});
	
	var topN = 5;
	var rankObjs = {};
	for(var k in indicatorCodeToValueObjs) {
		indicatorCodeToValueObjs[k]['values'] = indicatorCodeToValueObjs[k]['values'].filter(function(o){
			return !isNaN(parseFloat(o['value']));
		}).sort(function(o1, o2) {
			return parseFloat(o2['value']) - parseFloat(o1['value']);
		});
		var numberOfValues = indicatorCodeToValueObjs[k]['values'].length;
		rankObjs[k] = {};
		rankObjs[k]['top'] = indicatorCodeToValueObjs[k]['values'].slice(0, topN);
		rankObjs[k]['bottom'] = indicatorCodeToValueObjs[k]['values'].slice(numberOfValues - topN, numberOfValues);
	}
	createRankTable(rankObjs, tablesDivID, topN, domain);
}

function createRankTable(rankObjs, tablesDivID, topN, domain) {
	
	for(var indicatorCode in rankObjs) {
		
		var rankObj = rankObjs[indicatorCode];
		var topRanked = rankObj['top'];
		var bottomRanked = rankObj['bottom'];
		var rankTableSectionNode = null;
		var label = AppGlobals['Layers'][indicatorCode]['label'];
		
		if(topRanked.length > 0) {
			rankTableSectionNode = $('<div>').addClass("summaryRankTableSection").appendTo($("#"+tablesDivID));
			$('<div>').html("Rankings for " + label).addClass("summaryRankTableTitle").appendTo(rankTableSectionNode);
			createRankTableHTML(rankTableSectionNode, topRanked, "Top " + topN, indicatorCode, domain);
		}
		
		if(bottomRanked.length > 0) {
			bottomRanked.reverse();
			createRankTableHTML(rankTableSectionNode, bottomRanked, "Bottom " + topN, indicatorCode, domain);	
		}
	}
}

function createRankTableHTML(rankTableSectionNode, rankedObjs, label, indicatorCode, domain) {
	
	var tableDivWrapperDivID = getUniqueID() + "_tableDivWrapper";
	var tableDivWrapper = $('<div>').addClass("summaryRankTable").attr('id', tableDivWrapperDivID);
	var tableDivTitle = $('<div>').html(label).addClass("summaryRankTableTitle");
	var tableID = getUniqueID() + "_topprTable";
	var tableDiv = 
	'<table id="'+tableID+'" cellpadding="0" cellspacing="0">' +
		'<thead>' + 
			'<tr><th>Rank</th><th>'+domain+'</th><th>Value</th></tr>' + 
		'</thead>' +
		'<tbody>';
	
	rankedObjs.forEach(function(obj, idx) {
		var value = "";
		if(obj['subNatUnit']) {
			value = obj['subNatUnit'];
		}
		else if(obj['iso3']) {
			 value = AppGlobals['ISO3CountryMap'][obj['iso3']];
		}
		else {
			value = obj['name'];
		}
		tableDiv += '<tr><td>'+(idx + 1)+'</td><td>'+value+'</td><td>'+obj['value']+'</td></tr>';
	});
		
	tableDiv += '</tbody></table>';
	tableDivWrapper.append(tableDivTitle).append(tableDiv);
	rankTableSectionNode.append(tableDivWrapper);
    initCSVDownloadButton(tableID, tableDivWrapperDivID, "Top Admin Unit Rankings", "Top Admin Unit Rankings");
}

function getCropTOPPRResult(result) {

	var res = [];
	result.forEach(function(obj, idx) {
		
		var columns = [];
		obj['ColumnList'].forEach(function(cObj) {
			columns.push(cObj['ColumnName']);
		});
		
		var group = "";
		if(idx === 0) {
			group = "Harvested area";
		}
		else if(idx === 1) {
			group = "Production";
		}
		else if(idx === 2) {
			group = "Value of production";
		}
		
		res.push({'group':group, 'columns':columns, 'values':obj['ValueList']});
	});
	return res;
}

function executeCropTOPPRForSelectedAdmin(toolName, wktGeometry, onToolClose) {
	
	AppGlobals['ActiveToolEnabled'] = false;
	deactivateESRIDrawingToolBar();
	
	var args = null;
	var selectedRegionCode = AppGlobals['RegionMegaDropDown']['SelectedRegionCode'];
	
	if(wktGeometry) {
		args = "wktGeometry=" + wktGeometry;
	}
	else {
		if(geographicRegionIsSelected(selectedRegionCode)) {			
			args = "countryName=" + AppGlobals['RegionMegaDropDown']['ISO3List'].join("&countryName=");
		}
		else {
			args = "countryName="+selectedRegionCode;
		}
	}

	dojoXHRGet(AppConstants['CellValuesTOPPRURL'] + "?" + args, function(result) {
		
		if(result && result.length === 0) {
			onToolExecuteComplete();
		}
		
		var topN = 5;
		result = getCropTOPPRResult(result);

		var accordianTitleBottom = createAccordianTitle(true);
		onToolClose = onToolClose ? onToolClose : function() {};
		var accordianTitleTop = getNextAnalysisTitle() + ": TOP RANKINGS FOR COMMODITIES";
		onToolResult(getUniqueID(), accordianTitleTop, accordianTitleBottom, onToolClose, function(tablesDiv, chartsDiv, callback) {
			createCropRankTable(result, tablesDiv, topN, toolName);
			$("#"+chartsDiv).parent().hide();
			onToolExecuteComplete();
			callback(tablesDiv);
		});
	});
}

function createCropRankTable(rankObjs, tablesDivID, topN, toolName) {
	
	rankObjs.forEach(function(rankObjs) {

		var groupTitle = rankObjs['group'];
		var rankTableSectionNode = $('<div>').addClass("summaryRankTableSection").appendTo($("#"+tablesDivID));
		$('<div>').addClass("summaryRankTableTitle").appendTo(rankTableSectionNode);
		createCropRankTableHTML(rankTableSectionNode, rankObjs['columns'], rankObjs['values'], "Top " + topN + " " + groupTitle, toolName);
	});
}

function createCropRankTableHTML(rankTableSectionNode, rankColumns, rankValues, label, toolName) {
	
	rankColumns = rankColumns.map(function(c, cIdx) {
		return '<th>' + c + '</th>';
	});
		
	var tableDivWrapperDivID = getUniqueID() + "_tableDivWrapper";
	var tableDivWrapper = $('<div>').addClass("summaryRankTable summaryTable").attr('id', tableDivWrapperDivID);
	var tableDivTitle = $('<div>').html(label).addClass("summaryRankTableTitle");
	var tableID = getUniqueID() + "_topprTable";
	var tableDiv = 
	'<table id="'+tableID+'" cellpadding="0" cellspacing="0">' +
		'<thead>' + 
			'<tr>'+ rankColumns.join("") +'</tr>' + 
		'</thead>' +
		'<tbody>';
	
	rankValues.forEach(function(row, idx) {
		tableDiv += '<tr>';
		row.forEach(function(value, rIdx) {
			if(rIdx > 1) {
				value = getNumberWithCommas(parseFloat(value).toFixed(2));
			}			
			tableDiv += '<td>'+value+'</td>';
		});
		tableDiv += '</tr>';
	});
		
	tableDiv += '</tbody></table>';
	tableDivWrapper.append(tableDivTitle).append(tableDiv);
	rankTableSectionNode.append(tableDivWrapper);
    initCSVDownloadButton(tableID, tableDivWrapperDivID, "Top Rankings", toolName);
}

function executeCropTOPPRForCustomArea() {

	AppGlobals['CustomAreaTool']['DrawingToolBar'] = new esri.toolbars.Draw(AppGlobals['Map']);
	activateESRIDrawingToolBar();
	
	if(!AppGlobals["FloatingLayerMenuInitialized"]) {
		initFloatingLayerMenu();
	}
	
	dojo.connect(AppGlobals['CustomAreaTool']['DrawingToolBar'], "onDrawEnd", function(geometry) {
		
		onToolExecute();
		var uniqueID =  getUniqueID();
		AppGlobals['CustomAreaTool']['NumberOfAreas']++;
		var uniqueLayerID = uniqueID + "summarizeCropTOPPRArea";		
		var accordianTitleTop = getNextAnalysisTitle() + ": TOP RANKINGS FOR COMMODITIES";
		var layerObj = {'name':uniqueLayerID, 'id':uniqueID, 'dmsl':getUniqueGraphicsLayer(uniqueLayerID), 'label':'Summarize Crop Area Tool'};
		var activeLayerContainerDivID = addInertLayerToUserInterface(layerObj, accordianTitleTop);
						
		var dojoColorObj = getRandomDojoColor();
	    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, 
	    	new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, dojoColorObj, 1),
	    	dojoColorObj
	    );	        
	    addToolGraphicAndGetID(geometry, symbol, "summarizeCropTOPPRArea", uniqueLayerID);
	    
	    var onToolResultCloseFunction = function() {
			removeInertLayerFromList(layerObj['dmsl'], activeLayerContainerDivID);
	    };

	    var webMercatorGeom = esri.geometry.webMercatorToGeographic(geometry);
		var wktGeom = geomToWKT(webMercatorGeom);
		executeCropTOPPRForSelectedAdmin("summarizeCropTOPPRArea", wktGeom, onToolResultCloseFunction);
	});
}

function createDomainCountryRows(tableResultObj, countryResults, uniqueID) {

	var tempTableRows = createDomainsTableObject(countryResults, uniqueID, true);
	var countryRowsObj = {};
	var numberOfActiveIndicators = getActiveLayers(true).length;
	
	dojo.forEach(tempTableRows['rows'], function(obj) {
		var indicatorValues = obj['indicatorValues'];		
		dojo.forEach(indicatorValues, function(indObj, idx) {
			var iso3 = indObj['iso3'];
			if(!countryRowsObj[iso3]) {
				countryRowsObj[iso3] = [];
			}
			if(idx % numberOfActiveIndicators === 0) {
				countryRowsObj[iso3].push(obj);
			}
		});
	});
	
	var countryRowsObjList = [];
	for(var iso3 in countryRowsObj) {
		var countryName = AppGlobals['ISO3CountryMap'][iso3];
		countryRowsObjList.push({'title':countryName,'iso3':iso3,'data':countryRowsObj[iso3]});	
	}
	return countryRowsObjList;
}

function createDomainsTableAccordianGroup(tablesDiv, uniqueID, domainNamesList, domainCountryTableRows) {
	
	dojo.place('<div class="accordianResultChildTitle accordianResultGroupChildTitle">TABLE RESULTS BY COUNTRY</div>', dojo.byId(tablesDiv));
	var dropDownDivID = "countryDropDown" + uniqueID;
	dojo.place('<div id="'+dropDownDivID+'" class="countryDropDownDiv"></div>', dojo.byId(tablesDiv));
	
	var countryResultsDivID = uniqueID + "_CountryResultDiv";
	dojo.place('<div id="'+countryResultsDivID+'"></div>', dojo.byId(tablesDiv));
	
	var parentDivID = uniqueID + "_countryAccordianGroup";
	dojo.place('<div id="'+parentDivID+'"></div>', dojo.byId(countryResultsDivID));
	var parentNode = dojo.byId(parentDivID);
	
	var countryNameList = [];
	var countryToTableID = {};

	dojo.forEach(domainCountryTableRows, function(rowObj, idx) {
		
		var rowID = uniqueID + idx;
		var rowTitle = rowObj['title'];
		var rows = rowObj['data'];
		
		var rowContentDivID = rowTitle + "_DropDownTable";
		dojo.place('<div id="'+rowContentDivID+'" class="summaryTable" style="display:none;"></div>', parentNode);
		createDomainsTable(rowContentDivID, rowID, domainNamesList, rows, true, rowTitle);	
		
		var tableID = "Domain" + rowID;
		updateDomainCountryTableFillColors(tableID, uniqueID, domainNamesList.length);
		
		countryNameList.push(rowTitle);
		countryToTableID[rowTitle] = rowContentDivID;
	});
	countryNameList.sort();
	
	addDropDownList(dropDownDivID + uniqueID, dropDownDivID, countryNameList, function(c) {
		for(countryName in countryToTableID) {
			if(countryName === c) {
				dojo.style(dojo.byId(c + "_DropDownTable"), "display", "table");
			}
			else {
				dojo.style(dojo.byId(countryName + "_DropDownTable"), "display", "none");
			}
		}
	});
	dojo.style(dojo.byId(countryNameList[0]+ "_DropDownTable"), "display", "table");
}

function updateDomainCountryTableFillColors(tableID, uniqueID, numberOfDomainColumns) {
	
	if(tableID === "ALL") {
		dojo.forEach(dojo.query(".summaryTableNoBorder table"), function(tableNode) {
			updateTableColorSwatches(tableNode.id, uniqueID, numberOfDomainColumns, true);
		});
	}
	else {
		updateTableColorSwatches(tableID, uniqueID, numberOfDomainColumns);
	}
}

function updateTableColorSwatches(tableID, uniqueID, numberOfDomainColumns, isSSA) {
	
	var tableRows = dojo.query("#"+tableID)[0].children[1].children;
	var colorSwatchNodeOffset = 1;
	
	dojo.forEach(tableRows, function(rowNode, idx) {

		var domains = [];
		for(var i=0; i < numberOfDomainColumns; i++) {
			var domain = rowNode.children[i + colorSwatchNodeOffset].innerHTML;
			
			domain = domain.replace("&lt;", "<").replace("&gt;", ">");
			domains.push(domain);
		}
		var colorSwatchNode = rowNode.children[0];
		
		var fillColor = null;

		if(isSSA) {
			var fillColorKey = uniqueID + domains.join("");
			fillColor = getFillColorForToolFeature(fillColorKey, idx);
		}
		else {
			fillColor = getFillColorForToolFeature(uniqueID, idx);
		}
		if(fillColor) {
			colorSwatchNode.style.background = fillColor.toCss();
		}
	});
}

function mapDomainFeatures(uniqueID, domain, uniqueLayerID) {
		
	var featuresForToolRun = getFeaturesForToolRun(uniqueID);	
	
	for(var domainColumnName in featuresForToolRun) {
		
		(function() {
			
			var obj = featuresForToolRun[domainColumnName];
			var features = obj['features'];
			
			if(!features) {
				return;
			}
			
			var fillColor = obj['fillColor'];					
			var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, 
		    	new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, fillColor, 1),
		    	fillColor
		    );
		    
	    	var toolGraphicID = addToolGraphicAndGetID(features, symbol, "summarizeDomain", uniqueLayerID);
    		AppGlobals['ToolGraphics'][toolGraphicID].currentSymbol = symbol;
    		
	    	var onResultSelectUniqueID = uniqueID + fillColor.toRgb().join("");
	    	features.uniqueID = onResultSelectUniqueID;
	    	
	    	var onSelect = function() {
				AppGlobals['ToolGraphics'][toolGraphicID].setSymbol(AppGlobals['MarketShedTool']['highlightSymbol']);
	    	};
	    	var onDeselect = function() {
	    		
	    		var currentSymbol = AppGlobals['ToolGraphics'][toolGraphicID].currentSymbol;
				AppGlobals['ToolGraphics'][toolGraphicID].setSymbol(currentSymbol);
	    	};
			var onUpdate = function(dataObj) {
				
				if(dataObj && dataObj['fillColor']) {
					
					AppGlobals['ToolGraphics'][toolGraphicID].currentSymbol = createSymbol(dataObj['fillColor']);
					var currentSymbol = AppGlobals['ToolGraphics'][toolGraphicID].currentSymbol;
					AppGlobals['ToolGraphics'][toolGraphicID].setSymbol(currentSymbol);
				}
			};
	    	addComponentOnSelect(onResultSelectUniqueID, 'map', onSelect, onDeselect, onUpdate);
		})();
	}
}

function OnResultSelect(select, deselect, onUpdate) {
	
	var self = this;
	this.deselect = deselect;
	this.select = select;
	this.update = onUpdate || function(){};
	
	this.onSelect = function() {
		
		if(!self.flag) {
			self.flag = true;
			this.select();
		}
		else if(self.flag) {
			self.flag = false;
			this.deselect();
		}
	};
	this.onUpdate = function(dataObj) {
		this.update(dataObj);
	};
}

function createAccordianTitle(dontReturnIndicatorNames) {
	
	var currentRegion = AppGlobals['RegionMegaDropDown']['SelectedRegionName'];
	var indicatorNames = getStringFromListOfValuesWithKeySeparatedBy(getActiveLayers(true), "label", ", ");
	
	var titleElementsList = [];
	if(currentRegion) {
		titleElementsList.push(currentRegion);
	}
	if(!dontReturnIndicatorNames) {
		titleElementsList.push(indicatorNames);
	}

	return titleElementsList.join(", ");
}

function getIndicatorValueForTableDisplay(columnName, indicatorValue) {
	return isNaN(parseFloat(indicatorValue)) ? "No data" : getCorrectDecimalFormattedIndicatorValue(columnName, indicatorValue);
}

function getCorrectDecimalFormattedIndicatorValue(columnName, indicatorValue) {
	
	dojo.forEach(getActiveLayers(true), function(indicator) {
		if(columnName === indicator['name']) {
    		var decimalPlaces = indicator['indicatorInfo']['DecimalPlaces'] || 0;
    		return parseFloat(indicatorValue).toFixed(decimalPlaces);	
		}
	});
}

function addComponentOnSelect(uniqueID, component, onSelect, onDeselect, onUpdate) {
	
	initResultComponentIfNotInitialized(uniqueID);
	var onSelectFunc = new OnResultSelect(onSelect, onDeselect, onUpdate);
	AppGlobals['ResultOnSelectComponents'][uniqueID][component] = onSelectFunc;
}

function initResultComponentIfNotInitialized(uniqueID) {
	
	if(!AppGlobals['ResultOnSelectComponents'][uniqueID]) {
		AppGlobals['ResultOnSelectComponents'][uniqueID] = {};
	}
}

function addComponentCollectionOnSelect(uniqueID, component, onSelect, onDeselect, onUpdate) {
	
	initResultComponentIfNotInitialized(uniqueID);
	if(!AppGlobals['ResultOnSelectComponents'][uniqueID][component]) {
		AppGlobals['ResultOnSelectComponents'][uniqueID][component] = [];
	}
	
	var onSelectFunc = new OnResultSelect(onSelect, onDeselect, onUpdate);
	AppGlobals['ResultOnSelectComponents'][uniqueID][component].push(onSelectFunc);
}

function selectResultComponents(uniqueID) {
	updateResultProcedure(uniqueID, function(r) {
		r.onSelect();
	});
}

function updateResultComponents(uniqueID, dataObj) {
	updateResultProcedure(uniqueID, function(r) {
		r.onUpdate(dataObj);
	});
}

function updateResultProcedure(uniqueID, func) {
	
	for(component in AppGlobals['ResultOnSelectComponents'][uniqueID]) {
		if(component === 'chart') {
			dojo.forEach(AppGlobals['ResultOnSelectComponents'][uniqueID]['chart'], func);
		}
		else {
			func(AppGlobals['ResultOnSelectComponents'][uniqueID][component]);
		}
	}
}

function initDomainsFeaturesForToolRun(uniqueID) {
	AppGlobals['DomainFeatures'][uniqueID] = {};
}

function setDomainFeatureForToolRun(uniqueID, featureKey, features, fillColor) {
	AppGlobals['DomainFeatures'][uniqueID][featureKey] = {'features':features, 'fillColor':fillColor};
}

function getFeaturesForToolRun(uniqueID) {
	return AppGlobals['DomainFeatures'][uniqueID];
}

function initFillColorForToolFeature(uniqueID) {
	
	if(!AppGlobals["FillColors"][uniqueID]) {
		AppGlobals["FillColors"][uniqueID] = {};
	}
}

function setFillColorForToolFeature(uniqueID, fillColorKey, fillColor) {
	
	initFillColorForToolFeature(uniqueID);
	AppGlobals["FillColors"][uniqueID][fillColorKey] = fillColor;
}

function getFillColorForToolFeature(uniqueID, fillColorKey) {
	return AppGlobals["FillColors"][uniqueID][fillColorKey];
}

function createDomainsTableObject(result, uniqueID, hasCountryResults) {
	
	var domainNamesList = [];
	var domainColumnIndicies = {};
	var indicatorColumnIndicies = {};
	var indicatorColumnNames = getListFromActiveLayers("name");
	var ISO3ColumnIndex = null;
	var subNatColumnIndex = null;
	
	dojo.forEach(result['ColumnList'], function(obj) {
		
		var columnName = obj['ColumnName'];
		var columnIndex = obj['ColumnIndex'];
		
		if(columnName.indexOf("sortorder_") !== -1) {
			return;
		}
		else if(columnName.indexOf("Geometry") !== -1) {
			return;
		}
		else if(indicatorColumnNames.indexOf(columnName) !== -1) {
			indicatorColumnIndicies[columnName] = columnIndex;
		}
		else {
			domainColumnIndicies[columnName] = columnIndex;
			domainNamesList.push(columnName);
		}
		if(columnName.indexOf("ISO3") !== -1) {
			ISO3ColumnIndex = columnIndex;
		}
		else if(columnName.indexOf("subNatUnit") !== -1) {
			subNatColumnIndex = columnIndex;
		}
	});
	
	var rows = [];
	var valueList = result['ValueList'];

	dojo.forEach(valueList, function(obj, idx) {
		
		var fillColor = getRandomDojoColor();
		var uniqueResultsComponentID = uniqueID + fillColor.toRgb().join("");
		var rowObj = {'domainValues':[], 'indicatorValues':[], 'fillColor':fillColor, 'uniqueID':uniqueResultsComponentID};

		var domainValuesList = [];
		dojo.forEach(domainNamesList, function(domainColumnName) {
			
			var domainColumnIndex = domainColumnIndicies[domainColumnName];
			var domainValue = obj[domainColumnIndex];		
			domainValuesList.push(domainValue);
			rowObj['domainValues'].push({'name':domainColumnName, 'value':domainValue});
		});
		
		if(hasCountryResults) {
			var fillColorKey = uniqueID + domainValuesList.join("");
			setFillColorForToolFeature(fillColorKey, idx, fillColor);
		}
		setFillColorForToolFeature(uniqueID, idx, fillColor);
		
		dojo.forEach(indicatorColumnNames, function(columnName) {
			
			var indicatorValueIndex = indicatorColumnIndicies[columnName];
			var indicatorValue = obj[indicatorValueIndex];
			indicatorValue = getIndicatorValueForAnalyticDisplay(columnName, indicatorValue);
	    	
			var row = {'name':columnName, 'value':indicatorValue};
			
			if(ISO3ColumnIndex) {
				row['iso3'] = obj[ISO3ColumnIndex];
			}
			else if(subNatColumnIndex) {
				row['subNatUnit'] = obj[subNatColumnIndex];
			}
			
			rowObj['indicatorValues'].push(row);
		});
		rows.push(rowObj);
	});

	return {"rows":rows, "domainNamesList":domainNamesList};
}

function createDomainsChartObject(result, uniqueID) {

	var domainFeaturesIdx = null;
	var domainNamesLists = {};
	var domainColumnIndicies = {};
	var indicatorColumnIndicies = {};
	var indicatorColumnNames = getListFromActiveLayers("name");
	var valueList = result['ValueList'];
	
	dojo.forEach(result['ColumnList'], function(obj, idx) {
		
		var columnName = obj['ColumnName'];
		var columnIndex = obj['ColumnIndex'];
		
		if(columnName.indexOf("sortorder_") !== -1) {
			return;
		}
		else if(columnName.indexOf("Geometry") !== -1) {
			domainFeaturesIdx = idx;
		}
		else if(indicatorColumnNames.indexOf(columnName) !== -1) {
			indicatorColumnIndicies[columnName] = columnIndex;
		}
		else {	
			
			if(!domainNamesLists[columnName]) {
				domainNamesLists[columnName] = [];
			}
			domainColumnIndicies[columnName] = columnIndex;
			
			dojo.forEach(valueList, function(valueObj) {
				var domainValue = valueObj[columnIndex];
				if(domainNamesLists[columnName].indexOf(domainValue) === -1) {
					domainNamesLists[columnName].push(domainValue);
				}
			});
		}
	});

	var indicatorChartGroups = [];
	dojo.forEach(indicatorColumnNames, function(columnName) {
		
		var chartGroupsObj = {};
		chartGroupsObj['chartTitle'] = createChartTitle(columnName);
		chartGroupsObj['values'] = [];
		for(var domainColumnName in domainNamesLists) {
			
			(function() {
						
				var chartGroup = [];
				var domainNamesList = domainNamesLists[domainColumnName];
				dojo.forEach(domainNamesList, function(domainName) {
					
					var charObj = {};
					charObj['groupLabel'] = domainName;
					charObj['groupValues'] = [];
					
					dojo.forEach(valueList, function(valueObj, idx) {
											
						var domainNamesForFillColorKey = (function() {
							var dNames = [];
							for(var dCol in domainColumnIndicies) {
								var dColIdx = domainColumnIndicies[dCol];
								var dName = valueObj[dColIdx];
								dNames.push(dName);
							}
							return dNames;
						})();
							
						var domainColumnIndex = domainColumnIndicies[domainColumnName];
						var domainValue = valueObj[domainColumnIndex];
							
						if(domainName === domainValue) {
								
							var chartRowObj = {};
							var fillColorForDomainValue = getFillColorForToolFeature(uniqueID, idx);
								
							var indicatorValueIndex = indicatorColumnIndicies[columnName];
							var indicatorValue = getIndicatorValueForAnalyticDisplay(columnName, valueObj[indicatorValueIndex]);
							
							if(isNaN(indicatorValue)) {
								return;
							}
							
							var wktFearture = valueObj[domainFeaturesIdx];
							if(wktFearture) {
								var features = convertWKTToGeometry(wktFearture);
								setDomainFeatureForToolRun(uniqueID, domainValue, features, fillColorForDomainValue);
							}
							
							chartRowObj['label'] = columnName;
							chartRowObj['series'] = getDomainTitle(domainName);
							chartRowObj['value'] = indicatorValue;
							chartRowObj['fillColor'] = fillColorForDomainValue;
							
							var charBarID = columnName + domainColumnName + idx + indicatorValue;
							charBarID = charBarID.replace(".","").replace(",","");
							chartRowObj['id'] = charBarID;
														
					    	var onResultSelectUniqueID = uniqueID + fillColorForDomainValue.toRgb().join("");
					    	chartRowObj['uniqueID'] = onResultSelectUniqueID;
					    	
					    	var fillColor = fillColorForDomainValue.toCss();
					    	
					    	var onSelect = function() {
								d3.select("#"+charBarID).attr("fill", "rgb(255,255,0)");
					    	};
					    	var onDeselect = function() {
								d3.select("#"+charBarID).attr("fill", fillColor);
					    	};
							var onUpdate = function(dataObj) {
								
								var fillColorObj =  dataObj['fillColor'];
								
								if(dataObj && fillColorObj) {
									
									var colorObj = new dojo.Color(fillColorObj);
									chartRowObj['fillColor'] = colorObj;
									fillColor = colorObj.toCss();
																		
									if(AppGlobals['RegionMegaDropDown']['SelectedRegionName'] === "Sub-Saharan Africa" || AppGlobals['RegionMegaDropDown']['SelectedRegionName'] === null) {
										var fillColorKey = uniqueID + domainNamesForFillColorKey.join("");
										setFillColorForToolFeature(fillColorKey, idx, fillColor);
									}
									setFillColorForToolFeature(uniqueID, idx, colorObj);
									
									updateDomainCountryTableFillColors("ALL", uniqueID, domainNamesForFillColorKey.length);
									
									d3.select("#"+charBarID).attr("fill", fillColor);
								}
							};
					    	addComponentCollectionOnSelect(onResultSelectUniqueID, 'chart', onSelect, onDeselect, onUpdate);
							
							charObj['groupValues'].push(chartRowObj);	
						}
					});
					chartGroup.push(charObj);
				});
				chartGroupsObj['values'].push({'values':chartGroup,'yAxisLabel':getDomainTitle(domainColumnName)});
				})();
			}
		indicatorChartGroups.push(chartGroupsObj);
	});
	return indicatorChartGroups;
}

function convertWKTToGeometry(wktString) {
	
    if(wktString.indexOf("MULTIPOLYGON") !== -1 || wktString.indexOf("POLYGON") !== -1) {
    	
        var wkt = new Wkt.Wkt();
        wkt.read(wktString);
        var polygon = wkt.toObject({spatialReference:{wkid:4326},editable:true});
    	return new esri.geometry.geographicToWebMercator(polygon);    	
    }
}

function getRandomDojoColor() {
	
	var rgbArray = getRandomRGBColorArray();
	var rgbaObj = {r:rgbArray[0],g:rgbArray[1],b:rgbArray[2], a:1};
	
	return new dojo.Color([rgbaObj.r,rgbaObj.g,rgbaObj.b, 1]);	
}

function getRandomRGBColorArray() {	
	
	function getRandomNumberRGBValue() {
		return (Math.random() * 256).toFixed(0);
	}
	
	if(!this.RandomColorCache) {
		this.RandomColorCache = {};
	}
	
	var randomColorArray = [getRandomNumberRGBValue(), getRandomNumberRGBValue(), getRandomNumberRGBValue()];
	var randomColorArrayString = randomColorArray.join("");
	
	if(this.RandomColorCache[randomColorArrayString]) {
		getRandomRGBColorArray();
	}
	this.RandomColorCache[randomColorArrayString] = true;
	
	return randomColorArray;
}

function createDomainsTable(tableDiv, uniqueID, domainNamesList, rows, justTable, countryName) {

	var domainTitlesList = (function() {
		var l = [];
		dojo.forEach(domainNamesList, function(d) {
			 l.push(getDomainTitle(d));
		 });
		return l;
	})();
	
	var createTableHeaderFunc = function() { 		
		 
		 var html = '<th class="colorSwatch"></th>';
		 dojo.forEach(domainTitlesList, function(domainName) {
			 html += '<th>'+domainName+'</th>';
		 });
		 return html;
	};
	
	var colorPickerIDsList = [];
	var isCountries = domainNamesList.length === 1 && domainNamesList[0] == "ISO3";
	 
	var createTableRowsFunc = function() {
		
		var html = "";
		
		dojo.forEach(rows, function(obj, idx) {
			
			var resultComponentUniqueID = uniqueID + obj['fillColor'].toRgb().join("");
			html += '<tr id="'+resultComponentUniqueID+'">';
						
			var fillColor = obj['fillColor'];
			var hexColorString = fillColor.toCss();
			var uniqueIDGroup = uniqueID + fillColor.toRgb().join("");
			var colorSwatchID = uniqueIDGroup + "_colorSwatch" +  getUniqueID();
			colorPickerIDsList.push(colorSwatchID);
			
			html += '<td id="'+colorSwatchID+'" class="colorSwatch" style="background:'+hexColorString+'"></td>';
			dojo.forEach(obj['domainValues'], function(domainObj) {
				var value = domainObj['value'];
				if(isCountries) {
					value = AppGlobals['ISO3CountryMap'][value];
					html += '<td>'+value+'</td>'; 
				}
				else if(!AppGlobals['ISO3CountryMap'][value]) {
					html += '<td>'+value+'</td>'; 
				}
			});
			
			dojo.forEach(obj['indicatorValues'], function(valueObj) {
				html += '<td>'+getNumberWithCommas(valueObj['value'])+'</td>'; 
			});
			html += "</tr>";
		});
		return html;
	};
	
	var csvFirstRowValue = "Summary Variables for schema: " + domainTitlesList.join(" and ");
	
	if(justTable && countryName) {
		csvFirstRowValue += " and Country: " + countryName;
	}
	
	var tableID = "Domain" + uniqueID;
	createSummarizeGeometryTable(tableID, tableDiv, getActiveLayers(true), createTableHeaderFunc, createTableRowsFunc, csvFirstRowValue, "Advizer", justTable);
	
	if(!justTable) {
		addColorPickerOnClickEvents(colorPickerIDsList);
		addRowOnClickEvents(tableID);	
	}
}

function addColorPickerOnClickEvents(colorPickerIDsList) {
		
	dojo.forEach(colorPickerIDsList, function(id) {
		dojo.connect(dojo.byId(id), "onclick", function() {
			dijit.byId("colorPickerDijit").currentColorSwatchID = id;
			showColorPicker();
		});
	});
	
	dojo.connect(dojo.byId("colorPickerCancel"), "onclick", hideColorPicker);
	dojo.connect(dojo.byId("colorPickerSubmit"), "onclick", function() {

		var currentColorSwatchID = dijit.byId("colorPickerDijit").currentColorSwatchID;
		if(currentColorSwatchID) {
			var uniqueID = currentColorSwatchID.split("_")[0];
			var colorPickerHexValue = dijit.byId("colorPickerDijit").value;
			if(currentColorSwatchID && colorPickerHexValue) {
				updateResultComponents(uniqueID, {'fillColor':colorPickerHexValue});
			}
		}
		hideColorPicker();	
	});
}

function showColorPicker() {
	
	var windowBox = dojo.window.getBox();
	var colorPickerDivTopY = windowBox.t + windowBox.h/3;
	dojo.style(dojo.byId("colorPickerDiv"), "marginTop", colorPickerDivTopY + "px");
	dojo.style(dojo.byId("colorPickerContentDiv"), "display", "block");
}

function hideColorPicker() {
	
	dijit.byId("colorPickerDijit").currentColorSwatchID = null;
	dojo.style(dojo.byId("colorPickerContentDiv"), "display", "none");
}

function addRowOnClickEvents(tableID) {
	
	var tableRows = dojo.query("#"+tableID)[0].children[1].children;
	dojo.forEach(tableRows, function(rowNode) {
		
		var rowID = rowNode.id;
		var rowIdNode = dojo.byId(rowID);

		var onSelect = function() {
			dojo.style(rowIdNode, "background", "rgb(255, 255, 0)");
		};
		var onDeselect = function() {
			dojo.style(rowIdNode, "background", "rgb(255, 255, 255)");
		};
		var onUpdate = function(dataObj) {
			if(dataObj && dataObj['fillColor']) {
				var fillColor = new dojo.Color(dataObj['fillColor']).toCss();
				var colorSwatchNode = dojo.byId(rowNode.children[0].id);
				dojo.style(colorSwatchNode, "background", fillColor);
			}
			dojo.style(rowIdNode, "background", "rgb(255, 255, 255)");
		};
		addComponentOnSelect(rowID, 'table', onSelect, onDeselect, onUpdate);
		
		dojo.connect(rowIdNode, "onclick", function(e) {
			if(e.target.className !== "colorSwatch") {
				selectResultComponents(rowID);
			}
			return true;
		});
	});
}

function getMaxWidthFromTextList(listOfText) {
	
	var array = [];
	dojo.forEach(listOfText, function(text) {
		array.push(getWidthOfString(text));
	});
	var maxWidth = Math.max.apply(Math, array);
	
	return maxWidth;
}

function getWidthOfString(text) {
	
	if(!this.i) {
		this.i = 1;
	}
	
	var id = "text_" + this.i++;
	var element = document.createElement("div");
	element.setAttribute('id', id);
	element.setAttribute('class', "textWidthHidden");
	document.body.appendChild(element);
	
	var node = document.getElementById(id);
	node.innerHTML = text;
	
	return node.clientWidth;	
}
 
function addChartDownloadButton(chartPlaceholderDivID, chartPlaceholderContainerDivID, chartID, h, w, type) {
	
	var downloadButtonId = chartID + "_downloadButton";
	if(dojo.byId(downloadButtonId)) {
		return;
	}
	
	dojo.place('<div class="downloadResultDataButton chartsDownloadButton" id="'+downloadButtonId+'">Export '+type+'</div>', dojo.byId(chartPlaceholderDivID));

	dojo.connect(dojo.byId(downloadButtonId), "onclick", function() {
		
		var html = dojo.byId(chartPlaceholderContainerDivID).innerHTML;
		HCPrintObj.executeSingleElementExport(html, h, w);	
	});
}

function addTableImageDownloadButton(tableParentDivID, tableID, h, w) {
	
	var downloadButtonId = tableID + "_downloadButton";
	if(dojo.byId(downloadButtonId)) {
		return;
	}
	
	dojo.place('<div class="downloadResultDataButton chartsDownloadButton" id="'+downloadButtonId+'">Export as image</div>', dojo.byId(tableParentDivID));

	dojo.connect(dojo.byId(downloadButtonId), "onclick", function() {
		
		var html = $("#"+tableID).outerHTML();
		HCPrintObj.executeSingleElementExport(html, h, w);	
	});
}

function getMaxValueFromArrayOfObjectsWithKey(array, key) {
	
	var tempValues = [];
	dojo.forEach(array, function(obj) {
		tempValues.push(obj[key]);
	});
	return Math.max.apply(Math, tempValues);
}

function createDomainsChart(parentDiv, uniqueID, indicatorChartGroups) {
		
	var chartsDivID = "DomainsChart" + uniqueID;	
	dojo.place('<div id="'+chartsDivID+'"></div>',  dojo.byId(parentDiv), "last");

	dojo.forEach(indicatorChartGroups, function(indicatorGroupObj) {
		createColumnGroupsChart(chartsDivID, indicatorGroupObj['chartTitle'], indicatorGroupObj['values']);
	});
}

function getListOfValuesFromGlobalsObject(key) {
	
	var l = [];
	for(k in AppGlobals[key]) {l.push(k);}
	return l;
}

function initDomainsDropDown(dropDownValues) {
	
	var dropDownContainerNode = dojo.byId("summarizeDomainThumbContainer");
	dojo.empty("summarizeDomainThumbContainer");
	
	var rowNode = null;
	var numberOfThumbnailsPerRow = 3;
	dropDownValues.forEach(function(domain, idx) {
		
		if(idx % numberOfThumbnailsPerRow === 0) {
			rowNode = dojo.place('<div class="domainThumbnailRow"></div>', dropDownContainerNode);
		}
		
		var thumbID = "dt"+ getUniqueID();
		var thumbHTML = 
		'<div class="domainThumbnailContainer">' +
			'<img id="'+thumbID+'" class="domainThumbnailImage" />' +
			'<div class="domainThumbnailCaption">'+domain+'</div>' +
		'</div>';
		dojo.place(thumbHTML, rowNode);
		
		var thumbNode = dojo.byId(thumbID);
		
		dojo.connect(thumbNode, "onmouseover", function() {
			setDomainsDropDown(domain);
		});
		dojo.connect(thumbNode, "onmouseout", function() {
			setDomainsDropDown();
		});
		
		var  imageUrl = "images/"+domain+".png";
		$("#"+thumbID).attr('src', imageUrl);
		
		dojo.connect(thumbNode, "onclick", function() {
			
			if(AppGlobals['ActiveToolExecuting'] || !activeLayersVisible()) {
				return;
			}
			
			if(toolCanExecute()) {
				
				AppGlobals['ActiveTool'] = "summarizeDomain";
						
				hideActiveToolNub();
				onToolExecute();
				deactivateESRIDrawingToolBar();
				executeDomainsTool(domain);
				closeToolsNubMenu();
			}
		});
	});
}

function setDomainsDropDown(domain) {

	if(AppGlobals['DomainsInfo']) {
		dojo.byId("summarizeDomainBottomDesc").innerHTML = domain ? AppGlobals['DomainsInfo'][domain]['Description']:"";
	}
}

function addDropDownList(dropDownID, parentDivID, dropDownValues, onChange) {
	
	var dropDownDijit = dijit.byId(dropDownID);
	if(dropDownDijit) {
		dropDownDijit.destroy();
	}
	
	var dijitDivID = "summarizeDomainDropdownDijitDiv" + dropDownID;
	dojo.place('<div id="'+dijitDivID+'"></div>', dojo.byId(parentDivID));

	var values = [];
	dojo.forEach(dropDownValues, function(value) {		
		values.push({name:value});
	});
		
	new dijit.form.ComboBox({
		id:dropDownID,
		store: new dojo.data.ItemFileWriteStore({data:{
			identifier:'name',
			label:'name',
			items:values
		}}),
		value:dropDownValues[0],
        searchAttr:"name",
		onChange:onChange,
	}, dojo.byId(dijitDivID));	
}

function initActiveToolsButton() {
	
	dojo.connect(dojo.byId("activeToolSlider"), "onclick", function() {

		if(!this.flag) {
			this.flag = true;
			onToolDeactive();
		}
		else {
			this.flag = false;
			onToolActive();
		}		
	});
	
	dojo.connect(dojo.byId("activeToolCloseButton"), "onclick", exitActiveToolMode);
}

function exitActiveToolMode() {
	hideAndDeactivateActiveToolNub();
	onActiveToolCLose();
}

function showActiveToolNub() {

	var activeToolImg = dojo.byId("activeToolImg");
	if(activeToolImg) {
		dojo.destroy(dojo.byId("activeToolImg"));
	}
	dojo.place(AppGlobals['ActiveToolImage'], dojo.byId("activeToolNub"));
	animateProperties("activeToolNub", {top:{end:195, units:'px'}}, 1000);	
	dojo.style(dojo.byId("activeToolCloseButton"), "display", "block");
	onToolActive();
}

function hideAndDeactivateActiveToolNub() {
	
	onToolDeactive();
	hideActiveToolNub();
}

function hideActiveToolNub() {
	animateProperties("activeToolNub", {top:{end:120, units:'px'}}, 1000, function() {
		dojo.destroy(dojo.byId("activeToolImg"));
		dojo.style(dojo.byId("activeToolCloseButton"), "display", "none");
	});
}

function onToolActive() {
	
	AppGlobals['ActiveToolEnabled'] = true;
	toggleActiveToolActiveState("crosshair", "1", "images/tool_active.png", activateESRIDrawingToolBar);
}

function onToolDeactive() {
	
	AppGlobals['ActiveToolEnabled'] = false;
	toggleActiveToolActiveState("default", "0.5", "images/tool_inactive.png", deactivateESRIDrawingToolBar);
}

function toggleActiveToolActiveState(cursor, opacity, image, callback) {
	
	dojo.style(dojo.byId("map_container"), "cursor", cursor);
	dojo.style(dojo.byId("activeToolImg"), "opacity", opacity);
	dojo.byId("activeToolSlider").src = image;
	callback();
}

function onActiveToolCLose() {
	
	AppGlobals['ActiveTool'] = null;
	resetAllToolButtonSelectedStates();
}

function initToolButtonOnClickEvent(toolName, activeToolImage, toolButtonName, onToolStart) {
	
	var toolButtonNode = dojo.byId(toolButtonName);
	dojo.connect(toolButtonNode, "onclick", function() {
		
		if(AppGlobals['ActiveToolExecuting'] || !activeLayersVisible()) {
			return;
		}
										
		AppGlobals['ActiveTool'] = toolName;
		AppGlobals['ActiveToolImage'] = activeToolImage;
		dojo.addClass(toolButtonNode, "activeToolButton");

		showActiveToolNub();
		
		if(onToolStart) {
			onToolStart();
		}
	});
}

function resetAllToolButtonSelectedStates() {
	
	var activeToolButtons = dojo.query(".activeToolButton");
	dojo.forEach(activeToolButtons, function(node) {
		dojo.removeClass(node, "activeToolButton");
	});
}

function initBasemapOnClicks() {

	connectBasemapOnClick('national-geographic');
	connectBasemapOnClick('gray');
	connectBasemapOnClick('satellite');
	connectBasemapOnClick('topo');
	connectBasemapOnClick('hybrid');
	connectBasemapOnClick('streets');
}

function connectBasemapOnClick(basemap) {
	
	dojo.connect(dojo.byId(basemap), "onclick", function() {
		changeBasemap(basemap);
	});
}

function addToolGraphicAndGetID(geometry, symbol, toolType, uniqueLayerID) {
	
	var graphicKey = getUniqueID();
    AppGlobals['ToolGraphics'][graphicKey] = new esri.Graphic(geometry, symbol);
	
	if(toolType) {
		AppGlobals['ToolGraphics'][graphicKey].toolType = toolType;
	}
			
	AppGlobals['ToolResultGraphicsLayers'][uniqueLayerID].add(AppGlobals['ToolGraphics'][graphicKey]);
		    
    return graphicKey;
}

function activateESRIDrawingToolBar() {
	
	if(("summarizeCropTOPPRArea" === AppGlobals['ActiveTool'] || "summarizeArea" === AppGlobals['ActiveTool']) && AppGlobals['CustomAreaTool']['DrawingToolBar']) {
		AppGlobals['CustomAreaTool']['DrawingToolBar'].activate(esri.toolbars.Draw.POLYGON);
	}
}

function deactivateESRIDrawingToolBar() {
	
	if(AppGlobals['CustomAreaTool']['DrawingToolBar']) {
		AppGlobals['CustomAreaTool']['DrawingToolBar'].deactivate();
	}
}

function onToolExecute() {
	
	showLoading("Executing tool", "map", "ToolExecuting");
	AppGlobals['ActiveToolExecuting'] = true;
}

function onToolExecuteComplete() {
	
	hideLoading("ToolExecuting");
	AppGlobals['ActiveToolExecuting'] = false;
}

function executeSummarizeCustomAreaToolMain() {

	AppGlobals['CustomAreaTool']['DrawingToolBar'] = new esri.toolbars.Draw(AppGlobals['Map']);
	activateESRIDrawingToolBar();
	
	dojo.connect(AppGlobals['CustomAreaTool']['DrawingToolBar'], "onDrawEnd", function(geometry) {
		
		onToolExecute();
		
		var uniqueID =  getUniqueID();
		AppGlobals['CustomAreaTool']['NumberOfAreas']++;
		
		var accordianTitleTop = getNextAnalysisTitle() + ": Summary Area";
		
		var uniqueLayerID = uniqueID + "SummarizeAreaTool";
		var layerObj = {'name':uniqueLayerID, 'id':uniqueID, 'dmsl':getUniqueGraphicsLayer(uniqueLayerID), 'label':'Summarze Area Tool'};
		var activeLayerContainerDivID = addInertLayerToUserInterface(layerObj, accordianTitleTop);
						
		var dojoColorObj = getRandomDojoColor();
	    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, 
	    	new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, dojoColorObj, 1),
	    	dojoColorObj
	    );	    
	    addToolGraphicAndGetID(geometry, symbol, "summarizeArea", uniqueLayerID);
	    
	    var onToolResultCloseFunction = function() {
			removeInertLayerFromList(layerObj['dmsl'], activeLayerContainerDivID);
	    };
	    
	    var webMercatorGeom = esri.geometry.webMercatorToGeographic(geometry);
		var wktGeom = geomToWKT(webMercatorGeom);
		var activeIndicators = getActiveLayers(true);
		var indicatorIdsList = getListFromActiveLayers("indicatorId");
				
		_gaq.push(['_trackEvent', 'Tools', 'Polygon tool executed', wktGeom]);
		
		var indicatorArgs = "indicatorIds=" + indicatorIdsList.join("&indicatorIds=");
		var args = indicatorArgs + "&wktGeometry="+wktGeom;
		dojoXHRGet(AppConstants['CellValuesServiceURL'] + "?" + args, function(result) {
						
			var indicatorDataList = result['ValueList'];
			if(indicatorDataList.length === 0) {
				onToolExecuteComplete();
				return;
			}
			indicatorDataList = indicatorDataList[0];
			
			var rows = [];
			dojo.forEach(result['ColumnList'], function(obj) {
				
		    	var columnName = obj['ColumnName'];
				var indicatorValue = indicatorDataList[obj['ColumnIndex']];	
				indicatorValue = getIndicatorValueForAnalyticDisplay(columnName, indicatorValue);
						    	
		    	var indicatorResultsObj = {"name":columnName, "value":indicatorValue};
		    	rows.push(indicatorResultsObj);
			});
						
			var accordianTitleBottom = createAccordianTitle();

			onToolResult(uniqueID, accordianTitleTop, accordianTitleBottom, onToolResultCloseFunction, function(tablesDiv, chartsDiv, callback) {
				
				createSummaryAreaTable(tablesDiv, uniqueID, rows, activeIndicators, dojoColorObj);
				createSummaryAreaCharts(chartsDiv, uniqueID, rows, activeIndicators, dojoColorObj);
				onToolExecuteComplete();
				if(callback) {
					callback();
				}
			});
		});
	});
}

function resetSummarizeLocationTool() {
	
	AppGlobals['CustomLocationTool']['NumberOfDrops'] = 0;
	AppGlobals['CustomLocationTool']['Rows'] = []; 
	AppGlobals['ToolResultGraphicsLayers']["SummarizeLocationToolLayer"] = null;
}

function executeSummarizeLocationTool(mapPoint) {
	
	AppGlobals['CustomLocationTool']['NumberOfDrops']++;
	
	var accordianTitleTop = getNextAnalysisTitle(true) + ": Summary Location";
	
	var uniqueLayerID = "SummarizeLocationToolLayer";
	var layerObj = {'name':uniqueLayerID, 'id':uniqueLayerID, 'dmsl':getUniqueGraphicsLayer(uniqueLayerID), 'label':'Summarze Location Tool'};	
	var activeLayerContainerDivID = addInertLayerToUserInterface(layerObj, accordianTitleTop);
	
	var point = new esri.geometry.Point(mapPoint.x, mapPoint.y, AppGlobals['Map'].spatialReference);
	var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12,
		new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
		new dojo.Color([197,83,45]), 1),
		new dojo.Color([197,83,45,1])
	);
    addToolGraphicAndGetID(point, markerSymbol, "summarizeLocation", uniqueLayerID);
	
	var markerNumber = AppGlobals['CustomLocationTool']['NumberOfDrops'];	
	var textSymbol =  new esri.symbol.TextSymbol(markerNumber).setColor(
		new dojo.Color([255,255,255])).setAlign(esri.symbol.Font.ALIGN_START).setFont(
		new esri.symbol.Font("8pt").setWeight(esri.symbol.Font.WEIGHT_BOLD)
	);
	textSymbol.setOffset(-2, -4);
    addToolGraphicAndGetID(point, textSymbol, "summarizeLocation", uniqueLayerID);
    
	var onToolResultCloseFunction = function() {
		removeInertLayerFromList(layerObj['dmsl'], activeLayerContainerDivID, function() {
			resetSummarizeLocationTool();
		});
	};
	
	var mapPointGeographic = esri.geometry.webMercatorToGeographic(mapPoint);
	var x = parseFloat(mapPointGeographic['x']).toFixed(4);
	var y = parseFloat(mapPointGeographic['y']).toFixed(4);
	
	_gaq.push(['_trackEvent', 'Tools', 'Droppr tool executed', "x = " + x + ", " + "y = " + y]);
	
	var indicatorIdsList = getListFromActiveLayers("indicatorId");
	var indicatorArgs = "indicatorIds=" + indicatorIdsList.join("&indicatorIds=");
	var args = indicatorArgs + "&wktGeometry=POINT("+x+" "+y+")";
	dojoXHRGet(AppConstants['CellValuesServiceURL'] + "?" + args, function(result) {
				
		var indicatorDataList = result['ValueList'];		
		if(indicatorDataList.length === 0) {
			onToolExecuteComplete();
			return;
		}
		
		var indicatorObjs = result['ColumnList'];
		indicatorDataList = indicatorDataList[0];
		
		dojo.forEach(indicatorObjs, function(obj) {
			
			if(!AppGlobals['CustomLocationTool']['MarkerNumberCell5MValueCache'][markerNumber]) {
				AppGlobals['CustomLocationTool']['MarkerNumberCell5MValueCache'][markerNumber] = {};
			}
			var columnName = obj['ColumnName'];
			var indicatorValue = indicatorDataList[parseInt(obj['ColumnIndex'])];
			indicatorValue = getIndicatorValueForAnalyticDisplay(columnName, indicatorValue);		
			AppGlobals['CustomLocationTool']['MarkerNumberCell5MValueCache'][markerNumber][columnName] = indicatorValue;
		});
		
		var cell5mID = AppGlobals['CustomLocationTool']['MarkerNumberCell5MValueCache'][markerNumber]["CELL5M"];
		AppGlobals['CustomLocationTool']['Rows'].push({'cell5m':cell5mID, 'x':x, 'y':y, 'markerNumber':markerNumber});
		
		var accordianTitleBottom = createAccordianTitle();		
		var activeIndicators = getActiveLayers(true);
		
		onToolResult("DropperTool", accordianTitleTop, accordianTitleBottom, onToolResultCloseFunction, function(tablesDiv, chartsDiv, callback) {
			
			createDropperTable(tablesDiv, activeIndicators);
			createDropperCharts(chartsDiv, activeIndicators);
			onToolExecuteComplete();
			
			if(callback) {
				callback();
			}
		});	
	});		
}

function createSummaryAreaTable(tableDiv, uniqueID, rows, activeIndicators, dojoColorObj) {
		
	 var createTableHeaderFunc = function() {
		 return '<th>Area</th>';
	 };
	 
 	var createTableRowsFunc = function() {
 		
		var html = "<tr>";
		html += '<td class="colorSwatch" style="background:'+dojoColorObj.toCss()+'"></td>';
		dojo.forEach(rows, function(obj, idx) {
			var indicatorSummaryAreaValue = obj['value'];
			indicatorSummaryAreaValue = getNumberWithCommas(indicatorSummaryAreaValue);
			html += '<td>'+indicatorSummaryAreaValue+'</td>'; 
		});
		html += "</tr>";
		return html;
 	};
 	createSummarizeGeometryTable("SummaryArea" + uniqueID, tableDiv, activeIndicators, createTableHeaderFunc, createTableRowsFunc, "Summary Variables for Mappr UDP", "UserDefinedArea");
}

function createDropperTable(tableDiv, activeIndicators) {
	
	var createTableHeaderFunc = function() {
		return '<th>Marker #</th><th>Lat</th><th>Lng</th><th>Cell ID</th>';
	};
	 
	var createTableRowsFunc = function() {
			
		var html = "";
		dojo.forEach(AppGlobals['CustomLocationTool']['Rows'], function(obj) {
	    	
	    	var markerNumber = obj['markerNumber'];
	    	html += 
	    	'<tr>' +
		    	'<td>'+markerNumber+'</td>' +
		    	'<td>'+obj['x']+'</td>' +
		    	'<td>'+obj['y']+'</td>' +
		    	'<td>'+obj['cell5m']+'</td>';

	    	dojo.forEach(activeIndicators, function(indicator) {
	    		
	    		var indicatorValue = AppGlobals['CustomLocationTool']['MarkerNumberCell5MValueCache'][markerNumber][indicator['name']]; 
	    		indicatorValue = getNumberWithCommas(indicatorValue);
	        	html += '<td>'+indicatorValue+'</td>';
	        });
	    	html += '</tr>';
	    });	
		return html;
	};
	createSummarizeGeometryTable("Droppr", tableDiv, activeIndicators, createTableHeaderFunc, createTableRowsFunc, null, "Mappr_CompareLocations");
}

function createSummarizeGeometryTable(toolID, tableDiv, activeIndicators, createTableHeaderFunc, createTableRowsFunc, csvFirstRowValue, toolName, justTable) {
	
	var tableDivID = toolID + "TableDiv";	
	if(dojo.byId(tableDivID)) {
		dojo.destroy(tableDivID);
	}
	
    var tableID = toolID;
    var html = '<div id="'+tableDivID+'" class="summaryTable"><table id="'+tableID+'" cellpadding="0" cellspacing="0">';
    html += '<thead><tr>' + createTableHeaderFunc();
    
    dojo.forEach(activeIndicators, function(indicator) {
    	    	
		var indicatorObj = indicator['indicatorInfo'];
    	html +=	'<th>'+createIndicatorLabel(indicatorObj, '<br>')+'</th>';
    });
    html +=	'</tr></thead><tbody>' + createTableRowsFunc() + '</tbody></table><div>';

    dojo.place(html, dojo.byId(tableDiv), "first");
    
    if(justTable) {
    	dojo.addClass(dojo.byId(tableDivID), "summaryTableNoBorder");
    }
    initCSVDownloadButton(tableID, tableDivID, csvFirstRowValue, toolName);
}

function createSummaryAreaCharts(chartsDiv, uniqueID, rows, activeIndicators, dojoColorObj) {

	var data = [];	
	dojo.forEach(activeIndicators, function(indicatorObj) {
		
		var columnName = indicatorObj['name'];
		var dataObj = {'indicator':columnName};
		dataObj['values'] = [];
		dataObj['chartTitle'] = indicatorObj['label'];
		
		dojo.forEach(rows, function(obj, idx) {
			
			if(columnName == obj['name']) {
				
		    	var indicatorValue = obj['value'];
		    	indicatorValue = getIndicatorValueForAnalyticDisplay(columnName, indicatorValue);
		    	
				if(isNaN(indicatorValue)) {
					return;
				}
		    	dataObj['values'].push({"value":indicatorValue, "label":"", 'fillColor':dojoColorObj});	
			}
	    });
		data.push(dataObj);
	});
	
	createSummarizeGeometryChart(chartsDiv, uniqueID, data, "", false, true);
}

function createChartTitle(columnName) {
	
	var indicatorObj = AppGlobals['LayerIndicatorInfo'][columnName];
	return indicatorObj ? createIndicatorLabel(indicatorObj) : columnName;
}

function createDropperCharts(chartsDiv, activeIndicators) {
	
	var data = [];		
	var fillColor =  new dojo.Color("#c5532d");
	dojo.forEach(activeIndicators, function(indicatorObj) {
		
		var columnName = indicatorObj['name'];
		var dataObj = {'indicator':columnName};
		dataObj['values'] = [];
		dataObj['chartTitle'] = indicatorObj['label'];
		
		dojo.forEach(AppGlobals['CustomLocationTool']['Rows'], function(obj, idx) {

			var markerNumber = obj['markerNumber'];
	    	var indicatorValue = AppGlobals['CustomLocationTool']['MarkerNumberCell5MValueCache'][markerNumber][columnName];
	    	indicatorValue = getIndicatorValueForAnalyticDisplay(columnName, indicatorValue);
	    	
	    	if(isNaN(indicatorValue)) {
	    		return;
	    	}
	  
	    	dataObj['values'].push({"value":indicatorValue, "label":markerNumber, 'fillColor':fillColor});
	    });
		data.push(dataObj);
	});	
	createSummarizeGeometryChart(chartsDiv, "", data, "Drops", true);
}

function getWidthForChartYAxisLabel(values, key) {
	
	var yAxisLabelsList = [];
	dojo.forEach(values, function(obj) {
		yAxisLabelsList.push(obj[key]);
	});
	return getMaxWidthFromTextList(yAxisLabelsList);	
}

function createSummarizeGeometryChart(parentDiv, uniqueID, data, yAxisLabel, sameChart, yLabelPadding) {
	
	var chartsDivID = "SummaryAreaChart" + uniqueID;	
	if(sameChart && dojo.byId(chartsDivID)) {
		dojo.destroy(chartsDivID);
	}
	dojo.place('<div id="'+chartsDivID+'"></div>', dojo.byId(parentDiv), "last");
			
	dojo.forEach(data, function(obj) {
		createChart(chartsDivID, obj['chartTitle'],  obj['values'], yAxisLabel, yLabelPadding);
	});
}

function initCSVDownloadButton(tableId, parentDivID, firstRowValue, toolName) {
	
	var downloadButtonId = tableId + "_button";
	dojo.place('<div class="downloadResultDataButton" id="'+downloadButtonId+'">Download CSV</div>', dojo.byId(parentDivID));
	
	dojo.connect(dojo.byId(downloadButtonId), "onclick", function() {
				
		var rows = [];
		if(firstRowValue) {
			rows.push(firstRowValue);
		}
		
		dojo.forEach(dojo.byId(tableId).rows, function(rowChild, idx) {
			
			var rowValues = [];
			dojo.forEach(rowChild.children, function(row, colIdx) {
				
				if(colIdx === 0) {
					return;
				}
				
				rowValues.push(row.innerHTML.replace(/<br>/g, "").replace(/,/g, ""));
			});
			rows.push(rowValues.join(","));
		});
		rows.push("Mappr HarvestChoice " + new Date().getFullYear());

		var f = dojo.byId("downloadform");
	    f.action = AppConstants['CSVServiceURL'];
	    dojo.byId("reportinput").value = rows.join("\r");	    
	    dojo.byId("filename").value = toolName;
	    dojo.byId("s").value = new Date().getSeconds();
	    f.submit();
	});	
	
	var estimatedTimeToHaveTableLoadInDOM = 500;
	setTimeout(function() {
		var height = $("#" + tableId).height();
		var width = $("#" + tableId).width() + 100;
		addTableImageDownloadButton(parentDivID, tableId, height, width);
	}, estimatedTimeToHaveTableLoadInDOM);
}

function getNumberWithCommas(x) {
	if(!x) {
		return "No data";
	}
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function initFloatingLayerMenu() {
			
	var floatingSelectedLayersDivID = "floatingSelectedLayersDiv";
	var dockDivID = floatingSelectedLayersDivID + "Dock";
	dojo.place('<div id="' + floatingSelectedLayersDivID + '"></div>', dojo.byId("map"));
	
	var ConstrainedFloatingPane = dojo.declare(dojox.layout.FloatingPane, {
	    postCreate: function() {
	        this.inherited(arguments);
	        this.moveable = new dojo.dnd.move.constrainedMoveable(this.domNode, {
	            handle: this.focusNode,
	            constraints: function() {
	            	
	            	var coords = dojo.coords(dojo.byId("map_root"));
	            	coords['w'] -= (260);
	            	coords['h'] -= (339);

	            	return coords;
	            }
	        });
	    }
	});
	
	var legendDivInfo = dojo.position(dojo.byId("legendsButton"));
	var startX = legendDivInfo.x - 110;
	var startY = legendDivInfo.y - 339 - dojo.position(dojo.byId("bottomWrapper")).h - legendDivInfo.h - 10;
	
	AppGlobals['ConstrainedFloatingPane'] = new ConstrainedFloatingPane({
	    title:"SELECTED LAYERS",
	    resizable: false,
	    dockable: true,
	    closeable:false,
	    dockTo:dockDivID,
	    constrainToContainer:true,
	    duration:400,
	    style:"position:absolute;top:"+startY+"px;left:"+startX+"px;",
	}, dojo.byId(floatingSelectedLayersDivID));
	AppGlobals['ConstrainedFloatingPane'].resize = function() {};
	AppGlobals['ConstrainedFloatingPane'].startup();
	
	var floatingCanvasContentPane = dojo.query("#" + floatingSelectedLayersDivID + " .dojoxFloatingPaneContent")[0];

	var headerNode = dojo.place('<div class="floatingLayerHeader"></div>', floatingCanvasContentPane);

	var clearAllButtonId = "clearAllLayers";
	var quickSummaryStatsButtonID = "quickSummaryStats";
	dojo.place('<div id="'+clearAllButtonId+'" class="floatingLayerMenuButton">Clear All</div>', headerNode);
	dojo.place('<div id="'+quickSummaryStatsButtonID+'"class="floatingLayerMenuButton">Quick Statistics</div>', headerNode);
	dojo.connect(dojo.byId(clearAllButtonId), "onclick", clearAllLayers);
	dojo.connect(dojo.byId(quickSummaryStatsButtonID), "onclick", function() {
		executeQuickCountryStats();
	});
	
	addLayerListHTMLSection("inertLayerSelectionContainer", "inertLayerSelectionTitle", "inertLayerSelectionList", "TOOL RESULT LAYERS", floatingCanvasContentPane);
	addLayerListHTMLSection("activeLayerSelectionContainer", "activeLayerSelectionTitle", "activeSelectionLayerList", "ACTIVE LAYERS", floatingCanvasContentPane);
	
	var summariableLayerIconID = "summariableLayerIcon";
	var inertLayerIconID = "inertLayerIcon";
	var layerListTypeLegendHTML = 
		'<div id="layerListTypeLegend">' +
			'<div id="layerListTypeLegendItemLeft">' +
				'<img id="'+summariableLayerIconID+'" src="images/sum_layer_legend.png" height=16.3px width=19.7px/>' +
				'<div class="layerListTypeLegendItemLabel">Summarizable Layer</div>' +
			'</div>' +
			'<div id="layerListTypeLegendItemRight">' +
				'<img id="'+inertLayerIconID+'" src="images/inert_layer_legend.png" height=16.3px width=19.7px/>' +
				'<div class="layerListTypeLegendItemLabel">Inert Layer</div>' +
			'</div>' +
		'</div>';
	dojo.place(layerListTypeLegendHTML, dojo.byId(floatingSelectedLayersDivID));
		
	createToolTipDialog(summariableLayerIconID, AppConstants['ToolTipDescriptions']['SummarizableLayerInfo']);
	createToolTipDialog(inertLayerIconID, AppConstants['ToolTipDescriptions']['InertLayerInfo']);
	
	initDragAndDrop();
	AppGlobals["FloatingLayerMenuInitialized"] = true;
}

function geographicRegionIsSelected(regionCode) {
	return AppGlobals['RegionMegaDropDown']['ISO3List'].indexOf(regionCode) === -1;
}

function executeQuickCountryStats(isAdminTOPPR) {	
	
	AppGlobals['ActiveTool'] = "summarizeDomain";
	onToolExecute();
	var selectedRegionCode = AppGlobals['RegionMegaDropDown']['SelectedRegionCode'];
	if(geographicRegionIsSelected(selectedRegionCode)) {
		executeDomainsTool("Countries", isAdminTOPPR);
	}
	else {
		executeDomainsTool("Provinces within countries", isAdminTOPPR);
	}
}

function addLayerListHTMLSection(containerID, titleID, layerListID, title, floatingCanvasContentPane) {
	dojo.place(
		'<div id="'+containerID+'">' + 
			'<div id="'+titleID+'">'+title+'</div>' + 
			'<div id="'+layerListID+'"></div>' + 
		'</div>', 
	floatingCanvasContentPane);	
}

function showClearAllLayersButton() {
	dojo.style(dojo.byId("clearAllLayers"), "display", "block");
	dojo.style(dojo.byId("quickSummaryStats"), "display", "block");
}

function hideClearAllLayersButton() {
	dojo.style(dojo.byId("clearAllLayers"), "display", "none");
	dojo.style(dojo.byId("quickSummaryStats"), "display", "none");
}

function initLegendPane() {
	
	dojo.connect(dojo.byId("legendsButton"), "onclick", function() {
		dojo.style(dojo.byId("legendsContainer"), "height") === AppConstants['LEGEND_HEIGHT_PX'] ? closeLegendTab():openLegendTab();
	});
}

function openLegendTab() {
	animateLegendContainer(AppConstants['LEGEND_HEIGHT_PX'], "images/legend_down_arrow.png");
}

function closeLegendTab() {	
	animateLegendContainer(0, "images/legend_up_arrow.png");
}

function animateLegendContainer(height, arrowImageSrc) {
	
	animateProperties("legendsContainer", {height:{end:height, units:'px'}}, AppConstants['LEGEND_HEIGHT_DURATION_MS'], function() {
		dojo.byId("legendArrowImg").src = arrowImageSrc;
	});	
}

function createObjFromArrayOfLayerInfosWithKey(layerInfosArray, key) {
	
	obj = {};
	dojo.forEach(layerInfosArray, function(transferObject) {
		dojo.forEach(transferObject['layerInfoList']['layers'], function(layerObj) {
			layerObj['mapServiceURL'] = transferObject['mapServiceURL'];
			obj[layerObj[key]] = layerObj;
		});
	});
	return obj;
}
function dojoXHRGet(url, callback) {
	
	dojo.xhrGet({
	    url:url,
	    handleAs:"json",
	    load:function(result) {
	    	callback(result);
	    },
	    error:onAppError
	});
}

function onAppError(error, url, lineNumber) {
	
	var errorMessage = [error, url, lineNumber].join(" ");
	onToolExecuteComplete();
	hideAllLoaders();
	showErrorMessage(errorMessage);
	console.log("onAppError: ", error, url, lineNumber);
}

function loadMapServiceLayerInfos(mapServiceURLList, callback, layerInfoList) {

	layerInfoList = layerInfoList ? layerInfoList:[];
	
	if(mapServiceURLList.length == 0) {	
		
		AppGlobals['MapServiceLayers'] = createObjFromArrayOfLayerInfosWithKey(layerInfoList, 'name');
		callback();
		return;
	}
	
	var url = mapServiceURLList.pop();
	dojoXHRGet('proxy.ashx?' + url + "?f=json", function(result) {
		layerInfoList.push({'mapServiceURL':url, 'layerInfoList':result});
    	loadMapServiceLayerInfos(mapServiceURLList, callback, layerInfoList);
    });	
}

function loadJavascriptFromURL(url, callback) {
	
	var newscript = document.createElement('script');
	newscript.type = 'text/javascript';
	newscript.async = true;
	newscript.src = url;
	(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(newscript);
	
    var script = document.createElement("script");
    script.type = "text/javascript";

    if(script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                if(callback) {
                    callback();
                }
            }
        };
    } else {
        script.onload = function () {
        	if(callback) {
                callback();
        	}
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

function deselectDownArrows() {
	removeClassFromNodes("menuItemDownArrow");
}

function deselectActiveButtons() {
	removeClassFromNodes("activeToolButton");
}
function removeClassFromNodes(className) {
	dojo.forEach(dojo.query("."+className), function(node) {
		dojo.removeClass(dojo.byId(node.id), className);
	});
}

function flattenArrayIntoObjUsingKey(arr, key) {
	var o = {};
	dojo.forEach(arr, function(obj) {		
		o[obj[key]] = obj;
	});
	return o;
}


function addSubMenuHTMLAndGetLayerNode(uniqueId, layerName, parentNode, cssClass, titleCssClass) {
	
	var layerNameRowDivId = "group_" + getUniqueID() + "_row";
	G_LabelToDivID[layerName] = layerNameRowDivId;
	var layerTitleDiv = uniqueId + "_div";
	var layerMenuDiv = uniqueId + "_menu";
	var layerMenuArrowImgId = uniqueId + "_arrow";
	
	dojo.place('<div id="'+layerNameRowDivId+'"></div>', parentNode);	
	var layerRowDivNode = dojo.byId(layerNameRowDivId);
	
	dojo.place('<div id="'+layerTitleDiv+'">'+layerName+'</div>', layerRowDivNode);
	var layerTitleDivNode = dojo.byId(layerTitleDiv);
	
	dojo.place('<img id="'+layerMenuArrowImgId+'" class="menuArrow" height=3 width=7 src="images/menu_arrow_down.png"/>', layerTitleDivNode);
	var layerArrowImg = dojo.byId(layerMenuArrowImgId);
	
	dojo.place('<div id="' + layerMenuDiv + '"></div>', parentNode);
	var layerNode = dojo.byId(layerMenuDiv);

	dojo.addClass(layerTitleDivNode, "submenuLayerGroupRow");
	dojo.addClass(layerTitleDivNode, cssClass);
	dojo.addClass(layerTitleDivNode, titleCssClass);
	dojo.addClass(layerNode, "accordianSliderGroup");
	if(cssClass === "topLevelLayerMenuGroup") {
		dojo.addClass(layerTitleDivNode, "layerMenuBorderBottom");
	}
	dojo.addClass(layerNode, cssClass);
	
	dojo.connect(layerRowDivNode, "onclick", function() {
		
		$("#"+layerNameRowDivId).siblings('.submenuLayerGroupRow').slideUp({duration:300});
		
		if($(this).next().is(':hidden')) {
			
			$(this).next().slideDown({duration:300});
			layerArrowImg.src = "images/menu_arrow_up.png";
			
			if(cssClass === "topLevelLayerMenuGroup") {
				dojo.removeClass(layerTitleDivNode, "layerMenuBorderBottom");
				dojo.addClass(layerNode, "layerMenuBorderBottom");
			}
		}			
		else {
			$(this).next().slideUp({duration:300, complete:function() {
				
				if(cssClass === "topLevelLayerMenuGroup") {
					dojo.addClass(layerTitleDivNode, "layerMenuBorderBottom");
				}
			}});
			layerArrowImg.src = "images/menu_arrow_down.png";
		}
	});
	
	return layerNode;
}

function changeBasemap(basemapKey) {
	AppGlobals['Map'].setBasemap(basemapKey);
}

function createCountryCollectionMap(countryCollectionJSON) {
	
	var obj = {};
	dojo.forEach(countryCollectionJSON, function(countryCollectionObj) {
		
		if(!obj[countryCollectionObj['group']]) {
			obj[countryCollectionObj['group']] = [];
		}
		obj[countryCollectionObj['group']].push(countryCollectionObj);
	});
	return obj;
}

function createCountryCollectionNameAndCodeMap(countryCollectionJSON) {
	
	var obj = {};
	dojo.forEach(countryCollectionJSON, function(countryCollectionObj) {
		obj[countryCollectionObj['name']] = countryCollectionObj['ISOs'];
		obj[countryCollectionObj['code']] = countryCollectionObj['ISOs'];
	});
	return obj;
}

function createISO3CountryMap(countryJSON) {
	
	var obj = {};
	dojo.forEach(countryJSON, function(iso3Obj) {
		obj[iso3Obj['name']] = iso3Obj['label'];
	});
	return obj;
}

function initNubMenu(iconID, menuMaxWidth, menuContainerID, nubArrowDivID, onOpenCallback, onCloseCallback) {
	
	dojo.connect(dojo.byId(iconID), "onclick", function() {
		
		var MENU_END_WIDTH_PX = menuMaxWidth;
		var MENU_ARROW_START_PX = 53;
		var MENU_ARROW_END_PX = MENU_END_WIDTH_PX + MENU_ARROW_START_PX;
		
		var nubMenuNode = dojo.byId(menuContainerID);
		dojo.style(nubMenuNode, "display", "block");
		
		var width = MENU_END_WIDTH_PX;
		var arrowRight = MENU_ARROW_END_PX;
		var callback = function() {
			dojo.addClass(nubMenuNode, "overflowVisible");
		};
		
		if($("#"+menuContainerID).width() > 0) {
			width = 0;
			arrowRight = MENU_ARROW_START_PX;
			dojo.removeClass(nubMenuNode, "overflowVisible");
			dojo.addClass(nubMenuNode, "overflowHidden");
			callback = function() {
				dojo.style(nubMenuNode, "display", "none");
				onCloseCallback();
			};
		}
		
		animateProperties(menuContainerID, {width:{end:width, units:'px'}}, AppConstants['ANIMATION_DURATION'], callback);
		animateProperties(nubArrowDivID, {right:{end:arrowRight, units:'px'}}, AppConstants['ANIMATION_DURATION']);
		onOpenCallback();
	});
}

function openToolsNubMenu() {
	openNubMenu("toolsNubMenuContainer", AppConstants['TOOLS_NUB_WIDTH_PX'], "toolsNubArrowDiv");
}

function openOptionsNubMenu() {
	openNubMenu("optionsNubMenuContainer", AppConstants['OPTIONS_NUB_WIDTH_PX'], "optionsNubArrowDiv");
}

function openNubMenu(menuContainerID, endWidth, nubArrowDiv) {
	
	var nubMenuNode = dojo.byId(menuContainerID);
	if(dojo.style(nubMenuNode, "width") === endWidth) {
		return;
	}
	
	dojo.style(nubMenuNode, "display", "block");
	animateNubMenuState(menuContainerID, endWidth, nubArrowDiv, function() {
		dojo.addClass(nubMenuNode, "overflowVisible");
	});
}

function closeToolsNubMenu() {
	closeNubMenu("toolsNubMenuContainer", 0, "toolsNubArrowDiv");
}

function closeOptionsNubMenu() {
	closeNubMenu("optionsNubMenuContainer", 0, "optionsNubArrowDiv");
}

function closeNubMenu(menuContainerID, endWidth, nubArrowDiv) {
	
	hideAllNubContainers();
	deselectDownArrows();
	deselectActiveButtons();
	
	var nubMenuNode = dojo.byId(menuContainerID);
	if(dojo.style(nubMenuNode, "width") === endWidth) {
		return;
	}
	
	dojo.removeClass(nubMenuNode, "overflowVisible");
	dojo.addClass(nubMenuNode, "overflowHidden");
	
	animateNubMenuState(menuContainerID, endWidth, nubArrowDiv, function() {
		dojo.style(nubMenuNode, "display", "none");
	});
}

function animateNubMenuState(menuContainerID, endWidth, nubArrowDiv, callback) {
	
	var nubMenuNode = dojo.byId(menuContainerID);
	dojo.style(nubMenuNode, "display", "block");
	
	animateProperties(menuContainerID, {width:{end:endWidth, units:'px'}}, 400, callback);
	animateProperties(nubArrowDiv, {right:{end:endWidth + 54, units:'px'}}, 400);
}

function animateProperties(divID, propObj, duration, callback) {

	var anim = dojo.animateProperty({
		duration:duration,
		node:dojo.byId(divID),
		properties:propObj
	});	
	if(callback) {
	    dojo.connect(anim, "onEnd", callback);
	}
	anim.play();
}

function resetMap() {

	hideAllLoaders();
	clearAllLayers();
	removeAllBoundryLayersFromMap();
	resetMapDefaultExtent();
	changeBasemap(AppConstants['DEFAULT_BASEMAP_KEY']);
	closeLayerMenu();
	closeLegendTab();
	closeToolsNubMenu();
	closeOptionsNubMenu();
	closeMegaRegionDropDown();
	hideFloatingLayersDiv();
	clearRegionSelectedState();
	hideActiveToolNub();
	resetLayerMenu();
	deactivateESRIDrawingToolBar();
	
	setTimeout(setDefaultGeographicSelection, 100);
}

function resetLayerMenu() {
	dojo.forEach(AppGlobals['LayerMenuHTMLNodes'], function(node) {
		dojo.destroy(node.id);
	});
}

function hideFloatingLayersDiv() {
	
	var floatingLayersDijit = dijit.byId("floatingSelectedLayersDiv");
	if(floatingLayersDijit) {
		floatingLayersDijit.minimize();
	}
}

function fireOneTimeConnectEvent(obj, event, callback) {
	
	var connectHandle = null;
	connectHandle = dojo.connect(obj, event, function() {
		dojo.disconnect(connectHandle);
		callback();
	});
}

function resetMapDefaultExtent() {
	AppGlobals['Map'].setExtent(AppGlobals['DefaultExtent']);
}

function clearAllLayers() {

	dojo.forEach(getActiveLayers(), function(layer) {
		removeLayerFromUserInterface(layer);
	});
	
	dojo.forEach(getActiveInertLayers(), function(layer) {
		removeInertLayerFromList(layer['dmsl'], layer['name'] + "|" + layer['id']);
	});
}

function showLoading(message, div_id, loadingKey) {
	
	if(!AppGlobals['Loaders'][loadingKey]) {
		AppGlobals['Loaders'][loadingKey] = new CustomComponents.Classes.loading(div_id, message);
		AppGlobals['Loaders'][loadingKey].show();
	}
};

function hideLoading(loadingKey) {
	
	if(AppGlobals['Loaders'][loadingKey]) {		
		AppGlobals['Loaders'][loadingKey].kill();
		AppGlobals['Loaders'][loadingKey] = null;
	}
};

function updateLoadingMessage(loadingKey, message) {
	
	if(AppGlobals['Loaders'][loadingKey]) {		
		AppGlobals['Loaders'][loadingKey].setMessage(message);
	}
}

function hideAllLoaders() {
	
	for(loadingKey in AppGlobals['Loaders']) {
		hideLoading(loadingKey);
	}
}

function getStringFromListOfValuesWithKeySeparatedBy(array, key, joinStr) {
	
	var outArray = [];
	dojo.forEach(array, function(obj) {
		outArray.push(obj[key]);
	});
	return outArray.join(joinStr);
}

var PrintObjsToToolID = {};

function onToolResult(uniqueID, accordianTitleTop, accordianTitleBottom, onToolClose, toolFunction, dataDownloadObj) {
	
	var accordianPaneID = uniqueID + "_accordianPane";
	var accordianResultsContainerID = uniqueID + "_results";
	var accordianResultsChildContainerID = accordianResultsContainerID + "_child";
	var tableDivID = accordianResultsContainerID + "_table";
	var chartsDivID = accordianResultsContainerID + "_charts";

	if(dojo.byId(accordianPaneID)) {
		toolFunction(tableDivID, chartsDivID);
		return;
	}
	
	var accordianExpandToggleID =  uniqueID + "_expandToggle";
	var accordianExpandToggleImgID = accordianExpandToggleID + "_img";
	var accordianPaneRemoveID = uniqueID + "_remove";	
	var accordianExportButtonImgID = uniqueID + "_export";
	
	var downloadPaneHTML = "";
	if(dataDownloadObj) {
		downloadPaneHTML = 
		'<div class="accordianResultChild" style="clear:both;">' +
			'<div class="accordianResultChildTitle">DATA</div>' +
			'<a href="'+dataDownloadObj['url']+'" class="downloadResultDataButton">'+dataDownloadObj['title']+'</a>' +
		'</div>';
	}
	var accordianBottomText = accordianTitleBottom.toUpperCase();
	var accordianBottomTextID = accordianResultsContainerID + "_tooltip";

	var html = 
		'<div id="'+accordianPaneID+'" class="toolResultAccordianPane boxShadowAllSides accordianMarginTop">' +
			'<div id="'+accordianExpandToggleID+'"  class="toolResultAccordianPaneRow">' +
				'<img id="'+accordianExpandToggleImgID+'" height=13 width=22 src="images/accordian_arrow_down.png" class="toolResultAccordianPaneExpandToggleImg"/>' +
				'<div id="'+accordianExportButtonImgID+'" class="toolResultAccordianPaneExportButtonImg">EXPORT RESULTS</div>' +
				'<div class="toolResultAccordianPaneTitle">'+
					'<div class="toolResultAccordianPaneRemoveImg"><img id="'+accordianPaneRemoveID+'" src="images/accordian_remove.png" height=17 width=18/></div>' +
					'<div class="accordianHeadlineContainer">'+
						'<div class="accordianHeadlineContainerTop accordianTextOverflow">'+accordianTitleTop.toUpperCase()+'</div>' +
						'<div id="'+accordianBottomTextID+'" class="accordianHeadlineContainerBottom accordianTextOverflow">'+accordianBottomText+'</div>' +
					'</div>' +
				'</div>' +
				'</div>' +
			'</div>' +
			'<div id="'+accordianResultsContainerID+'" class="accordianResultsContainer boxShadowBottomLeftRight">' +
				'<div id="'+accordianResultsChildContainerID+'" class="accordianResultsChildContainer">' +
					'<div class="accordianResultChild">' + 
						'<div class="accordianResultChildTitle">TABLES</div>' +
						'<div id="'+tableDivID+'"></div>' +
					'</div>' + 
					'<div class="accordianResultChild">' +
						'<div class="accordianResultChildTitle">CHARTS</div>' +
						'<div id="'+chartsDivID+'"></div>' +
					'</div>' + 
					downloadPaneHTML +
					'</div>' +
			'</div>' +
		'</div>';
	dojo.place(html, dojo.byId("analyticsResultsAccordian"), "first");
	
	createToolTipDialog(accordianBottomTextID, accordianBottomText);
	
	dojo.connect(dojo.byId(accordianPaneRemoveID), "onclick", function() {
		
		dojo.destroy(accordianPaneID);
		dojo.destroy(accordianResultsContainerID);
		onToolClose();
		onAnalyticsContainerUpdate();
		G_AnalysisCount--;
	});
	
	var accordianExpandToggleNode = dojo.byId(accordianExpandToggleImgID);
	var collapseImg = "images/accordian_arrow_up.png";
	initSubAccordianExpandEvent(accordianExpandToggleID, accordianExpandToggleNode, accordianPaneID, "images/accordian_arrow_down.png", collapseImg);
	
	PrintObjsToToolID[uniqueID] = new HCImageExportController(accordianPaneID);
	toolFunction(tableDivID, chartsDivID, function(tablesContainerID) {
		
		var exportConfig = PrintObjsToToolID[uniqueID].getDefaultExportConfigOptions();
		exportConfig['tablesHTML'] = getTableHTMLForImageExport(tableDivID);
		exportConfig['chartsHTML'] = getChartHTMLForImageExport(chartsDivID);
		
		dojo.connect(dojo.byId(accordianExportButtonImgID), "onclick", function() {	
			
			if(tablesContainerID) {
				var node = $("#"+tablesContainerID);
				PrintObjsToToolID[uniqueID].executeSingleElementExport(node.outerHTML(), node.height(), node.width());	
			}
			else {
				PrintObjsToToolID[uniqueID].showExportMenu(exportConfig);
			}
		});
	});
	onAnalyticsContainerUpdate();
	
	var accordianPaneNodeQueryID = "#" + accordianPaneID;
	expandAccordian(accordianPaneNodeQueryID, collapseImg, accordianExpandToggleNode, dojo.byId(accordianPaneID), function() {
	    $('html,body').animate({scrollTop:$('#analytics').offset().top - 20}, {complete:function() {
			updateWrapperLayout();
			updateMapSizeAndPosition();
	    }});
	});
}

function getChartHTMLForImageExport(chartsDivID) {
	return getInnerChildrenHTMLForImageExport(chartsDivID, "resultChart");
}

function getTableHTMLForImageExport(tableDivID) {
	return getInnerChildrenHTMLForImageExport(tableDivID, "summaryTable");
}

function getLegendHTMLForImageExport() {
	return getInnerChildrenHTMLForImageExport("legendsContainer", "legend", true);
}

function getInnerChildrenHTMLForImageExport(parentNodeID, childrenSelectorClass, wholeNode) {
	
	var html = "";
	
	if(wholeNode) {
		dojo.forEach(dojo.query("#"+parentNodeID+" ." + childrenSelectorClass), function(n) {			
			html = html + n.innerHTML;
		});
	}
	else {
		dojo.forEach(dojo.query("#"+parentNodeID+" ." + childrenSelectorClass), function(n) {			
			html = html + n.children[0].innerHTML;
		});
	}
	return html.replace(/\"/g,'\\"');
};

function onAnalyticsContainerUpdate() {
	toggleAnalyticsTitleDisplay();
}

function initSubAccordianExpandEvent(accordianExpandToggleID, accordianExpandToggleNode, accordianPaneID, expandImg, collapseImg) {

	var accordianPaneIDNode = dojo.byId(accordianPaneID);
	var accordianPaneNodeQueryID = "#" + accordianPaneID;
	
	dojo.connect(dojo.byId(accordianExpandToggleID), "onclick", function(e) {
		
		if(e.currentTarget.className !== 'toolResultAccordianPaneExportButtonImg' && e.target.className === 'toolResultAccordianPaneExportButtonImg') {
			return;
		}

		if($(accordianPaneNodeQueryID).next().is(':hidden')) {
			expandAccordian(accordianPaneNodeQueryID, collapseImg, accordianExpandToggleNode, accordianPaneIDNode, function() {});
		} 					
		else {
			$(accordianPaneNodeQueryID).next().slideUp({duration:300, complete:function() {
				accordianExpandToggleNode.src = expandImg;
			}});
		}
	});
}

function expandAccordian(accordianPaneNodeQueryID, collapseImg, accordianExpandToggleNode, accordianPaneIDNode, onExpandFinish) {
	
	$(accordianPaneNodeQueryID).next().slideDown({duration:300, complete:function() {
		onExpandFinish();
	}});
	accordianExpandToggleNode.src = collapseImg;
}

dojo.provide("CustomComponents.Classes.loading");
dojo.declare("CustomComponents.Classes.loading", null, {
	msg: "",
	outputDiv: "",
	loader: null,
	messageNode: "",
	constructor: function (outputDiv, message, args) {
	    if (args && args.msg) {this.msg = args.msg;}
	    this.outputDiv = outputDiv;
	    this.addNode();
	    this.msg = message;
	    this.show();
	},
	show: function (msg) {
	    if (msg) {this.msg = msg;}
	    this.messageNode.innerHTML = this.msg.toUpperCase();
	    this.loader.style.display = "block";
	},
	setMessage:function(msg) {
		this.messageNode.innerHTML = msg;
	},
	kill: function () {dojo.destroy(this.loader);},
	addNode: function () {
	    this.loader = dojo.place("<div class='loading'></div>", dojo.body());
	    this.messageNode = dojo.place("<div class='msg'></div>", this.loader);
	}
});

function HCImageExportController(parentDivID) {
	
	var self = this;
	self._LayoutOption = "portrait";
	self._ImageFormat = 'png';
	self._ImageExportHandle = null;
	self._UID = "UID" + new Date().getMilliseconds();
	
	self._ParentDivID = parentDivID;
	self._ExportOptionsDivID = "exportOptions" + self._UID;
	self._ExecuteExportButtonID = "executeExportButton" + self._UID;
	self._ExportLayoutContainerID = "exportLayoutContainer" + self._UID;
	self._PortraitLayoutDivID = "portraitLayoutRB" + self._UID;
	self._LandscapeLayoutDivID = "landscapeLayoutRB" + self._UID;
	self._ExportOptionsContainerDivID = "exportOptionsContainer" + self._UID;	
	self._PNGImageFormatDivID = "pngImageFormat" + self._UID;
	self._JPGImageFormatDivID = "jpgImageFormat" + self._UID;
	self._PDFImageFormatDivID = "pdfImageFormat" + self._UID;
	
	self._init = function() {
		
		self._loadExportButtonHTML();
		self._connectRadioButtonOnClicks();
	};
	
	this.showExportMenu = function(configObj) {
		
		var exportOptionsNode = dojo.byId(self._ExportOptionsDivID);
		var executeExportButton = dojo.byId(self._ExecuteExportButtonID);
		
		dojo.place(exportOptionsNode, dojo.byId(self._ParentDivID));
		var display = dojo.style(exportOptionsNode, "display") === 'none' ? 'block':'none';
		dojo.style(exportOptionsNode, "display", display);
		
		if(configObj) {
			
			self._ImageExportHandle = dojo.connect(executeExportButton, "onclick", function() {
				dojo.disconnect(self._ImageExportHandle);
				dojo.style(exportOptionsNode, "display", 'none');
				self.executeResultsLayout(configObj);
			});
		}
		else {
			
			self._ImageExportHandle = dojo.connect(executeExportButton, "onclick", function() {
				dojo.disconnect(self._ImageExportHandle);
				dojo.style(exportOptionsNode, "display", 'none');
				self.executeMapAndLegendExport();
			});
		}
	};
	
	this.executeMapAndLegendExport = function() {
		self._execute(self.getDefaultExportConfigOptions());
	};
	
	this.executeSingleElementExport = function(nodeHTML, h, w) {
				
		nodeHTML = nodeHTML.replace(/\"/g,'\\"');
		var codeblock = 'var body = dojo.body();';
		codeblock += 'body.innerHTML = "";';
		codeblock += 'var node = dojo.place("'+nodeHTML+'", body);';
		
		self._executePrintPost(codeblock, function(exportImageURL) {
			showFullscreenContent("pdfExportContainer", function() {
				dojo.byId("exportPreview").src = exportImageURL;
				self._ImageExportHandle = dojo.connect(dojo.byId("openExportResultButton"), "onclick", function() {
					dojo.disconnect(self._ImageExportHandle);
					window.open(exportImageURL, "MapprExport" + getUniqueID() + self._UID);
					hideFullscreenContent();
				});
			});
		}, h, w);
	};
	
	this.getDefaultExportConfigOptions = function() {
		
		var configObj = {};
		configObj['titleHTML'] = '<div><div class=\\"accordianHeadlineContainerTop accordianTextOverflow\\">'+createAccordianTitle()+'</div></div>';
		configObj['mapHTML'] = $("#map_root").outerHTML().replace(/\"/g,'\\"');
		if(configObj['mapHTML'].indexOf('-webkit-transform') === -1) {
			configObj['mapHTML'] = configObj['mapHTML'].replace(/-ms-transform/g, 'transform').replace(/transform/g, '-webkit-transform');
		}
		configObj['mapHeight'] = $("#map_root").height();
		configObj['mapWidth'] = $("#map_root").width();
		configObj['legendsHTML'] = $("#legendsContainer").outerHTML().replace(/\"/g,'\\"');
		configObj['metaDataHTML'] = getVariableMetaDataHTML().replace(/\"/g,'\\"');
		
		return configObj;
	};
	
	this.executeResultsLayout = function(configObj) {	
		self._execute(configObj);
	};
	
	self._execute = function(configObj) {
		
		self._exportImage(configObj, function(exportImageURL) {
			showFullscreenContent("pdfExportContainer", function() {
				dojo.byId("exportPreview").src = exportImageURL;
				self._ImageExportHandle = dojo.connect(dojo.byId("openExportResultButton"), "onclick", function() {
					dojo.disconnect(self._ImageExportHandle);
					window.open(exportImageURL, "MapprExport" + getUniqueID() + self._UID);
					hideFullscreenContent();
				});
			});
		});
	};
	
	self._loadExportButtonHTML = function() {
		
		var html = 
		'<div id="'+self._ExportOptionsDivID+'" class="exportOptions">'+
			'<div class="exportOptionsArrow dijitTooltipConnector" role="presentation" data-dojo-attach-point="connectorNode"></div>' +
			'<div id="'+self._ExportLayoutContainerID+'" class="exportLayoutContainer exportOptionsContainer">'+
				'<div class="exportGroupTitle">Page orientation:</div>' +
				'<div class="exportOptionsGroup">' +
					'<div class="exportOptionsGroupColumn">' +
						'<div class="exportOptionsItemRow">' +
							'<div id="'+self._PortraitLayoutDivID+'" class="exportRadioButtonUnselected exportRadioButtonSelected"></div>' +
							'<img class="exportLayoutIcon" src="images/portrait.png" width=20 height=26 />' +
						'</div>' +
					'</div>' +
					'<div class="exportOptionsGroupColumn">' +
						'<div class="exportOptionsItemRow">' +
							'<div id="'+self._LandscapeLayoutDivID+'" class="exportRadioButtonUnselected"></div>' +
							'<img class="exportLayoutIcon" src="images/landscape.png" width=26 height=20 />' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div id="'+self._ExportOptionsContainerDivID+'" class="exportOptionsContainer">' +
				'<div class="exportOptionsGroup">' +
					'<div class="exportGroupTitle">Image format:</div>' +
					'<div class="exportOptionsGroupColumn">'+
						'<div class="exportOptionsItemRow">' +
							'<div id="'+self._PNGImageFormatDivID+'" class="exportRadioButtonUnselected exportRadioButtonSelected"></div>' +
							'<div class="exportImageTypeLabel">png</div>' +
						'</div>' +
					'</div>' +
					'<div class="exportOptionsGroupColumn">'+
						'<div class="exportOptionsItemRow">' +
							'<div id="'+self._JPGImageFormatDivID+'" class="exportRadioButtonUnselected"></div>' +
							'<div class="exportImageTypeLabel">jpg</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<div id="'+self._ExecuteExportButtonID+'" class="executeExportButton">EXPORT</div>' +
		'</div>';
		dojo.place(html, dojo.byId(self._ParentDivID));
	};
	
	self._connectRadioButtonOnClicks = function() {
		
		var portraitLayoutRBNode = dojo.byId(self._PortraitLayoutDivID);
		dojo.connect(portraitLayoutRBNode, "onclick", self._getLayoutRadioButtonOnClick(portraitLayoutRBNode, 'portrait'));
		
		var landscapeLayoutRBNode = dojo.byId(self._LandscapeLayoutDivID);
		dojo.connect(landscapeLayoutRBNode, "onclick", self._getLayoutRadioButtonOnClick(landscapeLayoutRBNode, 'landscape'));
		
		var pngRBNode = dojo.byId(self._PNGImageFormatDivID);
		dojo.connect(pngRBNode, "onclick", self._getImageButtonRadioButtonOnClick(pngRBNode, 'png'));
		
		var jpgRBNode = dojo.byId(self._JPGImageFormatDivID);
		dojo.connect(jpgRBNode, "onclick", self._getImageButtonRadioButtonOnClick(jpgRBNode, 'jpg'));		
	};
	
	self._getImageButtonRadioButtonOnClick = function(node, imageFormat) {
		
		return function() {
			self._ImageFormat = imageFormat;
			self._removeAllSelectedRadioButtons(self._ExportOptionsContainerDivID);
			dojo.addClass(node, "exportRadioButtonSelected");
		};
	};
	
	self._getLayoutRadioButtonOnClick = function(node, layoutOption) {
		
		return function() {
			self._LayoutOption = layoutOption;
			self._removeAllSelectedRadioButtons(self._ExportLayoutContainerID);
			dojo.addClass(node, "exportRadioButtonSelected");
		};
	};
 	
 	self._removeAllSelectedRadioButtons = function(parentDivID) {
 		dojo.forEach(dojo.query("#"+parentDivID+" .exportRadioButtonSelected"), function(node) {
 			dojo.removeClass(node, "exportRadioButtonSelected");
 		});
 	};
		
	self._exportImage = function(configObj, callback) {
		
		var titleHTML = configObj['titleHTML'];
		var legendsHTML = configObj['legendsHTML'];
		var mapHTML = configObj['mapHTML'];
		var mapWidth  = configObj['mapWidth'];
		var mapHeight = configObj['mapHeight'];

		var codeblock = 'var map = dojo.byId("map");';
		codeblock += 'dojo.place("'+titleHTML+'", dojo.byId("title"));';
		codeblock += 'dojo.style(dojo.body(), "width", "'+mapWidth+'px");';
		codeblock += 'dojo.style(map, "height", "'+mapHeight+'px");';
		codeblock += 'dojo.place("'+mapHTML+'", map, "only");';
		codeblock += 'dojo.style(dojo.byId("map_zoom_slider"), "display", "none");';
		codeblock += 'dojo.place("'+legendsHTML+'", dojo.byId("legends"));';	

		if(configObj['tablesHTML']) {
			codeblock += 'dojo.place("'+configObj['tablesHTML']+'", dojo.byId("tables"));';
		}
		if(configObj['chartsHTML']) {
			codeblock += 'dojo.place("'+configObj['chartsHTML']+'", dojo.byId("charts"));';
		}
		if(configObj['metaDataHTML']) {
			codeblock += 'dojo.place("'+configObj['metaDataHTML']+'", dojo.byId("metaData"));';
		}				
		self._executePrintPost(codeblock, callback);
	};
	
	self._executePrintPost = function(codeblock, callback, h, w) {
		
		showLoading("Exporting image", "map", "ExportImage");
		var printPostArgs = {
				
			url:'http://apps.harvestchoice.org/mappr/print.html',
			imageformat:self._ImageFormat,
			format:'json',
			codeblock:codeblock,
			viewportheight:h || 768,
			viewportwidth:w || 1024
		};
		
		$.ajax({
			 type: "POST",
			 url:'proxy.ashx?http://services.spatialdev.com/print',
			 data: printPostArgs,
			 success: function(result) {
				hideLoading("ExportImage");
				callback(result.image);
			 }
		});
	};
	
	self._init();
}

})();