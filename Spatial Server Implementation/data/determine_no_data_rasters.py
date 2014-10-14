import sys, os
import numpy
sys.path.reverse()
import gdal

input_raster_directory = r'/Users/D/Desktop/hc_rasters_ghana/'
list_of_rasters = [r for r in os.listdir(input_raster_directory) if r.endswith('tif')]
list_of_no_data_rasters = []

for tiff_name in list_of_rasters:
    
    input_raster_fullpath = os.path.join(input_raster_directory, tiff_name)
    raster = gdal.Open(input_raster_fullpath)
    raster_band = raster.GetRasterBand(1) 
    no_data_value = raster_band.GetNoDataValue()
    raster_values = raster_band.ReadAsArray()
    unique_values = numpy.unique(raster_values)
    has_all_no_data = len(unique_values) == 1 and int(unique_values[0]) == int(no_data_value)

    if has_all_no_data:
        list_of_no_data_rasters.append(tiff_name.replace("gha_", '').replace(".tif", ''))
    
    raster = None

from pprint import pprint
pprint(list_of_no_data_rasters)

    