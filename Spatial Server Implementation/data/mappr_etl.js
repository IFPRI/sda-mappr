var pg = require('/Users/D/Documents/githubclones/PGRestAPI/node_modules/pg');
var express = require("/Users/D/Documents/githubclones/PGRestAPI/node_modules/express");
var conString = "postgres://D:''@localhost/World Spatial";
var fs = require('fs');

var prefix = 'gha_';

var spatialID = 'GHA';
var configObj = {};
configObj['title'] = 'Ghana MAPPR';

configObj['mapConfig'] = {'defaultBounds':[[11.26461221250444, 6.328125], [4.68592950660633,-4.921875]]};


main();

function main() {
	
	processLayerMenuObject(spatialID, configObj);
	createIndicatorLegendJSONFiles();
	createIndicatorMetaDataJSONFiles();
}

function createIndicatorMetaDataJSONFiles() {
	
    var client = new pg.Client(conString);
    client.connect();
   	  
    client.query("SELECT varcode, vardesc, sources FROM indicator_metadata", function(error, result) {
    	result.rows.forEach(function(obj, idx) {
    		var res = {
               	'source':obj['sources'],
               	'description':obj['vardesc']
            };
            writeResultFileToDisk(obj['varcode'] + "_metadata", res);
    	});
    	client.end();
    });
}

function createIndicatorLegendJSONFiles() {
	
    var client = new pg.Client(conString);
    client.connect();
    
    var createLegendList = function(l) {
		return l.split("|").filter(function(v){
			return v != "";
		});
    };
   	  
    client.query("SELECT varcode, classcolors, classbreaks, classlabels FROM indicator_metadata", function(error, result) {
    	result.rows.forEach(function(obj, idx) {
    		var result = {
		    	"lgdcl":createLegendList(obj['classbreaks'] || ""),
		    	"lgdcr":createLegendList(obj['classcolors'] || ""),
		  		"lgdimg":[],
		   		"lgdlb":createLegendList(obj['classlabels'] || "")
		   	};
	    	writeResultFileToDisk(obj['varcode'] + "_legend", result);
    	});
    	client.end();
    });
}

function writeResultFileToDisk(fileName, data, callback) {
	console.log("creating cached result for ", fileName);
	fs.writeFileSync('/Users/D/Sites/mappr/web/data/'+fileName+'.json', JSON.stringify(data));
}

function processLayerMenuObject(spatialID, configObj) {
	
    var client = new pg.Client(conString);
    client.connect();
                
	getASAppConfig(client, function(rows) {
		
		var layerMenuJSON = getFormattedLayersObject(rows);
		layerMenuJSON['category1ToFontIcon'] = {
	    	'Administrative':'',
	    	'Agroecology':'',
	   		'Demographics':'',
	  		'Farming System':'',
	  		'Markets':'',
	    };

		configObj['layerMenuConfig'] = layerMenuJSON;
		
		writeResultFileToDisk('gha', configObj);
		client.end();
	});	
}

function getASAppConfig(client, callback) {
	
    var query_string = "SELECT id AS i, varlabel AS ll, varcode AS ln, cat1, cat2, cat3 FROM indicator_metadata WHERE published = 'True' AND isDomain = 'False'";
    client.query(query_string, function(error, result) {
    	result = result ? result.rows:[];
    	callback(result);
    });
}

function getFormattedLayersObjectForCustomLayers() {
	
	var layers = [];
	var cat1Name = 'CERSGIS Ghana layers';
	layers.push({'cat1':cat1Name, 'cat2':'Cereal', 'cat3':null, 'ln':'Maize_Farm', 'll':'Maize farm', 'geomType':'POLYGON'});
	layers.push({'cat1':cat1Name, 'cat2':'Cereal', 'cat3':null, 'ln':'Rice_Field', 'll':'Rice field', 'geomType':'POLYGON'});
	layers.push({'cat1':cat1Name, 'cat2':'Cereal', 'cat3':null, 'ln':'Soyabean_Farm', 'll':'Soya Bean farm', 'geomType':'POLYGON'});
	
	layers.push({'cat1':cat1Name, 'cat2':'Fruit', 'cat3':null, 'ln':'Cashew_Farm', 'll':'Cashew farm', 'geomType':'POLYGON'});
	layers.push({'cat1':cat1Name, 'cat2':'Fruit', 'cat3':null, 'ln':'Citrus_Farm', 'll':'Citrus Farm', 'geomType':'POLYGON'});
	layers.push({'cat1':cat1Name, 'cat2':'Fruit', 'cat3':null, 'ln':'Mango_Farm', 'll':'Mango Farm', 'geomType':'POLYGON'});
	layers.push({'cat1':cat1Name, 'cat2':'Fruit', 'cat3':null, 'ln':'Pinapple_Farm', 'll':'Pinapple farm', 'geomType':'POLYGON'});
	
	layers.push({'cat1':cat1Name, 'cat2':'Facilities', 'cat3':null, 'ln':'Feeder_Road_Network', 'll':'Feeder Roads', 'geomType':'LINE'});
	layers.push({'cat1':cat1Name, 'cat2':'Facilities', 'cat3':null, 'ln':'irrigation_site', 'll':'Irrigation sites', 'geomType':'POINT'});
	layers.push({'cat1':cat1Name, 'cat2':'Facilities', 'cat3':null, 'ln':'Mechanisation_Centres', 'll':'Mechanisation centres', 'geomType':'POINT'});
	layers.push({'cat1':cat1Name, 'cat2':'Facilities', 'cat3':null, 'ln':'Pack_house', 'll':'Pack Houses' , 'geomType':'POINT'});
	layers.push({'cat1':cat1Name, 'cat2':'Facilities', 'cat3':null, 'ln':'Tractor_Locations', 'll':'Tractor locations', 'geomType':'POINT'});
	
	layers.push({'cat1':cat1Name, 'cat2':'Commerce', 'cat3':null, 'ln':'agrochemical_shops', 'll':'Agrochemical Shops', 'geomType':'POINT'});
	layers.push({'cat1':cat1Name, 'cat2':'Commerce', 'cat3':null, 'ln':'financial_institutions', 'll':'Financial Institutions', 'geomType':'POINT'});
	layers.push({'cat1':cat1Name, 'cat2':'Commerce', 'cat3':null, 'ln':'Market_Locations', 'll':'Market Locations', 'geomType':'POINT'});
	
	layers.push({'cat1':cat1Name, 'cat2':'Landuse', 'cat3':null, 'ln':'Soil', 'll':'Soil', 'geomType':'POLYGON'});
	


	var rows = [];
	layers.forEach(function(obj) {
		var rowObj = {};
		rowObj['isTimeConstant'] = true;
		rowObj['MBTilesEndPoint'] = obj['ln'];
		rowObj['id'] = obj['ln'];
		rowObj['label'] = obj['ll'];
		rowObj['g1'] = obj['cat1'];
		rowObj['g2'] = obj['cat2'];
		rowObj['g3'] = obj['cat3'];
		rowObj['geomType'] = obj['geomType'];
		rowObj['noLegend'] = true;
		rowObj['noMetaData'] = true;
		
		rows.push(rowObj)
	});
	
	return rows;
}

function getFormattedLayersObject(rows) {
	
	var updatedRows = [];
	rows.forEach(function(obj) {
		
		var rowObj = {};
		rowObj['isTimeConstant'] = true;
		rowObj['MBTilesEndPoint'] = prefix + obj['ln'];
		rowObj['id'] = obj['ln'];
		rowObj['indicatorID'] = obj['i'];
		rowObj['label'] = obj['ll'];
		rowObj['g1'] = obj['cat1'];
		rowObj['g2'] = obj['cat2'];
		rowObj['g3'] = obj['cat3'];
		rowObj['isCell5MIndicator'] = true;
		
		if(obj['ll'] === 'Stemrust Prevalence - irr.') {
			rowObj['isGradientLegend'] = true;
		}
		
		updatedRows.push(rowObj)
	});
	
	updatedRows = updatedRows.filter(function(rowObj){
		return NO_DATA_INDICATORS.indexOf(rowObj['id']) === -1;
	});
	
	var moreRows = getFormattedLayersObjectForCustomLayers();
	updatedRows.push.apply(updatedRows, moreRows);
	
	return createLayerMenuObject(updatedRows);
}

function createLayerMenuObject(indicatorObjs) {
	
	var obj = {};
	indicatorObjs.forEach(function(rowObj) {
					
		var groupLayer = rowObj['g1'] ? rowObj['g1'].trim() : null;
		if(!groupLayer) {
			return;
		}
		var groupLayer2 = rowObj['g2'] ? rowObj['g2'].trim() : null;
		var groupLayer3 = rowObj['g3'] ? rowObj['g3'].trim() : null;
		var groupLayer4 = null;
			
		if(groupLayer && !obj[groupLayer]) {
			obj[groupLayer] = {};
			obj[groupLayer]['name'] = groupLayer;
			obj[groupLayer]['level'] = 1;
			obj[groupLayer]['layers'] = [];
			if(!obj['groupLayers']) {
				obj['groupLayers'] = [];
			}
			obj['groupLayers'].push(groupLayer);
		}
		if(groupLayer && groupLayer2 && !obj[groupLayer][groupLayer2]) {
			obj[groupLayer][groupLayer2] = {};
			obj[groupLayer][groupLayer2]['name'] = groupLayer2;
			obj[groupLayer][groupLayer2]['level'] = 2;
			obj[groupLayer][groupLayer2]['layers'] = [];
			if(!obj[groupLayer]['groupLayers']) {
				obj[groupLayer]['groupLayers'] = [];
			}
			obj[groupLayer]['groupLayers'].push(groupLayer2);
		}
		if(groupLayer && groupLayer2 && groupLayer3 && !obj[groupLayer][groupLayer2][groupLayer3]) {
			obj[groupLayer][groupLayer2][groupLayer3] = {};
			obj[groupLayer][groupLayer2][groupLayer3]['name'] = groupLayer3;
			obj[groupLayer][groupLayer2][groupLayer3]['level'] = 3;
			obj[groupLayer][groupLayer2][groupLayer3]['layers'] = [];
			if(!obj[groupLayer][groupLayer2]['groupLayers']) {
				obj[groupLayer][groupLayer2]['groupLayers'] = [];
			}
			obj[groupLayer][groupLayer2]['groupLayers'].push(groupLayer3);
		}
				
		if(groupLayer && !groupLayer2) {
			obj[groupLayer]['layers'].push(rowObj);
		}
		else if(groupLayer && groupLayer2 && !groupLayer3) {
			obj[groupLayer][groupLayer2]['layers'].push(rowObj);
		}
		else if(groupLayer && groupLayer2 && groupLayer3 && !groupLayer4) {
			obj[groupLayer][groupLayer2][groupLayer3]['layers'].push(rowObj);
		}
	});

	return obj;
}


var NO_DATA_INDICATORS = [];
