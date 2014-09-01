if(typeof(L) !== 'undefined') {

	L.RasterCanvasLayer = L.CanvasLayer.extend({

		options: {
			
			renderer:function(){},
			data:[],
			cell_height:0,
			cell_width:0,
			x_origin:0,
			y_origin:0,
			map:null,
			cellSizeForLat:{}
		},

		initialize:function(options) {
			
			L.CanvasLayer.prototype.initialize.call(this, options);
			this.getPXPointFromGEOPoint = this.getPXPointFromGEOPoint.bind(this);    
			this.getCellSizeForGEOPoint = this.getCellSizeForGEOPoint.bind(this);    
			this.getCellSizeForGEOPoint = this.getCellSizeForGEOPoint.bind(this);    
		},  

		getPXPointFromGEOPoint:function(geoY, geoX) {

			var rasterOriginGEO = [geoY, geoX];
			var rasterOriginMAP = this.options.map.latLngToLayerPoint(rasterOriginGEO);
			var rasterOriginPX = this.options.map.layerPointToContainerPoint(rasterOriginMAP);

			return rasterOriginPX;
		},

		getCellSizeForGEOPoint:function(geoY, geoX, delta) {
			
			var rasterCellHeightGEO = this.options.cell_height;
			var rasterCellWidthGEO = this.options.cell_width;

			var cellHeightDeltaGEO_Y_1 = geoY + (rasterCellHeightGEO * delta);
			var cellWidthDeltaGEO_X_1 = geoX + (rasterCellWidthGEO * delta);
			
			var cellHeightDeltaGEO_Y_2 = geoY + (rasterCellHeightGEO * (delta + 1.0));
			var cellWidthDeltaGEO_X_2 = geoX + (rasterCellWidthGEO * (delta + 1.0));
			
			var rasterCellDeltaPX_1 = this.getPXPointFromGEOPoint(cellHeightDeltaGEO_Y_1, cellWidthDeltaGEO_X_1);
			var rasterCellDeltaPX_2 = this.getPXPointFromGEOPoint(cellHeightDeltaGEO_Y_2, cellWidthDeltaGEO_X_2);
			var cellSizeYPX = rasterCellDeltaPX_2.y - rasterCellDeltaPX_1.y;
			var cellSizeXPX = rasterCellDeltaPX_2.x - rasterCellDeltaPX_1.x;

			return [cellSizeYPX, cellSizeXPX];
		},

		render:function() {

			var canvas = this.getCanvas();
			canvas.width = canvas.width;
			var context = canvas.getContext('2d');

			var renderer = this.options.renderer;
			var getPXPointFromGEOPoint = this.getPXPointFromGEOPoint;
			var getCellSizeForGEOPoint = this.getCellSizeForGEOPoint;

			var rasterOriginGEO_Y = this.options.y_origin;
			var rasterOriginGEO_X = this.options.x_origin;
			var rasterOriginPX = getPXPointFromGEOPoint(rasterOriginGEO_Y, rasterOriginGEO_X);
			
			var cellSizeForLatAndLon = getCellSizeForGEOPoint(rasterOriginGEO_Y, rasterOriginGEO_X, 0);
			var cellSizeXPX = cellSizeForLatAndLon[1];

			var y = rasterOriginPX.y;
			this.options.data.forEach(function(row, idx) {
				
				var cellSizeForLatAndLon = getCellSizeForGEOPoint(rasterOriginGEO_Y, rasterOriginGEO_X, idx);
				var cellSizeYPX = cellSizeForLatAndLon[0];
				
				var x = rasterOriginPX.x;		
				row.forEach(function(value) {

					var fillStyle = renderer(value);
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
} //L defined