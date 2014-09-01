import os
import gdal
import sys
import json
import osr

input_raster_directory = 'output/rasters/'
list_of_rasters = [r for r in os.listdir(input_raster_directory) if r.endswith('tif')]
output_json_directory =   'output/json/'

for tiff_name in list_of_rasters:
    
    print "processing...",tiff_name
    
    input_raster_fullpath = os.path.join(input_raster_directory, tiff_name)
    raster = gdal.Open(input_raster_fullpath)
    
    wgs84 = osr.SpatialReference()
    wgs84.ImportFromEPSG(4326) 
    wgs84_wkt = wgs84.ExportToWkt()
    raster.SetProjection(wgs84_wkt)
    
    raster_band = raster.GetRasterBand(1)
    raster_transform = raster.GetGeoTransform() #(left_value, delta_x, rotation_x, top_value, rotation_y, delta_y)
    raster_x_origin = raster_transform[0]
    raster_y_origin = raster_transform[3]
    raster_cell_width = raster_transform[1]
    raster_cell_height = raster_transform[5]
    
    raster_values_array = raster_band.ReadAsArray()
    raster_shape = raster_values_array.shape;
    raster_values_array = raster_values_array.tolist()
    no_data_value = raster_band.GetNoDataValue()
        
    result = {}
    result['data'] = raster_values_array
    result['x_origin'] = raster_x_origin
    result['y_origin'] = raster_y_origin
    result['cell_width'] = raster_cell_width
    result['cell_height'] = raster_cell_height
    result['rows'] = raster_shape[0]
    result['cols'] = raster_shape[1]

    result_str = json.dumps(result)
    result_str = result_str.replace(str(no_data_value), '""')
    output_json_fullpath = os.path.join(output_json_directory, tiff_name.split(".tif")[0] + ".json")
    
    with open(output_json_fullpath, 'wb') as json_file:        
        json_file.write(result_str)

