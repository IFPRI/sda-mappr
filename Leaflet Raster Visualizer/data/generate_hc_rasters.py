from osgeo import ogr
import os
import csv

indicator_name = 'PN05_RUR'
target_iso3_id = 'GHA'
target_cell5ms = {}
with open('data_tables/'+indicator_name+'.csv', 'U') as csv_file:
    rows = [r for r in csv.reader(csv_file) if r[2] == target_iso3_id]
    for row in rows[1:]:
        target_cell5ms[int(row[1])] = float(row[0])
        
shapefile = "cell5m/cell5m.shp"
driver = ogr.GetDriverByName("ESRI Shapefile")
dataSource = driver.Open(shapefile, 0)
layer = dataSource.GetLayer()
filterKey = 'CELL5M'
features = [f for f in layer if int(f.GetField(filterKey)) in target_cell5ms]

layer_name = target_iso3_id + "_" + indicator_name
output_shapefile_fullpath = 'output/shapefiles/' + layer_name + ".shp"
driver = ogr.GetDriverByName('Esri Shapefile')
ds = driver.CreateDataSource(output_shapefile_fullpath)
layer = ds.CreateLayer(layer_name, None, ogr.wkbPolygon)

layer.CreateField(ogr.FieldDefn('cell5m', ogr.OFTInteger))
layer.CreateField(ogr.FieldDefn(indicator_name, ogr.OFTReal))

defn = layer.GetLayerDefn()

for f in features:
    
    cell5m_id = int(f.GetField('CELL5M'))
    indicator_value = target_cell5ms[cell5m_id]
    
    feat = ogr.Feature(defn)
    feat.SetField('cell5m', cell5m_id)
    feat.SetField(indicator_name, indicator_value)
    feat.SetGeometry(f.GetGeometryRef().Clone())    
    layer.CreateFeature(feat)
    feat = geom = None

ds = layer = None

no_data_value = -9999
cell_resolution = 0.083333333
gdal_fullpath = '/Library/Frameworks/GDAL.framework/Versions/1.11/Programs/'
output_tiff_fullpath = 'output/rasters/' + layer_name + ".tif"
gdal_command = "gdal_rasterize -a '" + indicator_name + "' -l '" + layer_name + "' -a_nodata "+str(no_data_value)+" -tr "+str(cell_resolution)+" "+str(cell_resolution)+" '" + output_shapefile_fullpath + "' '" + output_tiff_fullpath + "'"        
command = gdal_fullpath + gdal_command
print command
os.system(command)

