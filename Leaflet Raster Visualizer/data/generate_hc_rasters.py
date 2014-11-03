from osgeo import ogr, osr
import os, sys
import csv, codecs


def getCell5MIdsForISO3(iso3):    
    rows = [r for r in csv.reader(codecs.open('data_tables/iso3.txt', 'rU', 'utf-16'))]
    obj = {}
    for r in rows[1:]: 
        if r[1] == iso3:
            obj[int(r[0])] = 1
    return obj
        
indicator_names = ['PN05_RUR', 'BMI', 'TT_50K']
target_iso3_id = 'GHA'

for indicator_name in indicator_names:
    
    target_cell5ms = {}
    cell5m_ids_for_iso3 = getCell5MIdsForISO3(target_iso3_id)
    with open('data_tables/'+indicator_name+'.txt', 'U') as csv_file:
        rows = [r for r in csv.reader(csv_file)]
        for row in rows[1:]:
            cell5m_id = int(row[0])
            if cell5m_id in cell5m_ids_for_iso3:
                value = None
                try:
                    value = float(row[1])
                except ValueError as e:
                    value = -9999
                target_cell5ms[cell5m_id] = value
            
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
        geom = f.GetGeometryRef().Clone()
        feat.SetGeometry(geom)
         
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

