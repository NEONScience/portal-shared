import {
  parseLocationProperties,
  parseLocationHierarchy,
} from '../SiteMapUtils';

describe('SiteMapUtils', () => {
  describe('parseLocationProperties()', () => {
    const input = [
      {
        locationPropertyName: 'Value for Coordinate source',
        locationPropertyValue: 'Geomorphology Midpoint',
      },
      {
        locationPropertyName: 'Value for Coordinate uncertainty',
        locationPropertyValue: 10.0,
      },
      {
        locationPropertyName: 'Value for "DURATION"',
        locationPropertyValue: 'Core',
      },
      {
        locationPropertyName: 'Value for Elevation uncertainty',
        locationPropertyValue: 10.0,
      },
      {
        locationPropertyName: 'Value for Geodetic-(datum)',
        locationPropertyValue: 'WGS84',
      },
      {
        locationPropertyName: 'Value for HABITAT',
        locationPropertyValue: 'Aquatic Wadeable Stream',
      },
      {
        locationPropertyName: 'Value for Has Location-Started Receiving Data?',
        locationPropertyValue: 'N',
      },
      {
        locationPropertyName: 'Value for IS_ACTIVE',
        locationPropertyValue: 'Yes',
      },
      {
        locationPropertyName: 'Value for Site Timezone',
        locationPropertyValue: 'US/Mountain',
      },
    ];
    test('generates keyed object without defined whitelist', () => {
      expect(parseLocationProperties(input)).toStrictEqual({
        coordinateSource: 'Geomorphology Midpoint',
        coordinateUncertainty: 10.0,
        duration: 'Core',
        elevationUncertainty: 10.0,
        geodeticDatum: 'WGS84',
        habitat: 'Aquatic Wadeable Stream',
        hasLocationStartedReceivingData: 'N',
        isActive: 'Yes',
        siteTimezone: 'US/Mountain',
      });
    });
    test('generates keyed object with a defined whitelist', () => {
      const whiteList = ['coordinateUncertainty', 'habitat'];
      expect(parseLocationProperties(input, whiteList)).toStrictEqual({
        coordinateUncertainty: 10.0,
        habitat: 'Aquatic Wadeable Stream',
      });
    });
  });
  
  describe('parseLocationHierarchy()', () => {
    const input = {
      locationDescription: 'Arikaree River Site, CORE',
      locationName: 'ARIK',
      locationProperties: [],
      locationParentHierarchy: { locationName: 'D10' },
      locationChildHierarchy: [
        {
          locationDescription: 'Arikaree River Stream',
          locationName: 'STREAM100096',
          locationChildHierarchy: [
            {
              locationDescription: 'Arikaree River S1 Location',
              locationName: 'S1LOC100099',
              locationChildHierarchy: [
                {
                  locationDescription: 'Not Used - Arikaree River S1 Above Water',
                  locationName: 'ABVWAT100104',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Arikaree River PAR Radiation S1',
                  locationName: 'CFGLOC100111',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Arikaree River Water Level S1',
                  locationName: 'CFGLOC101669',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Arikaree River Water Chemistry and Temperature S1',
                  locationName: 'CFGLOC101670',
                  locationChildHierarchy: [],
                }
              ]
            },
            {
              locationDescription: 'Arikaree River S2 Location',
              locationName: 'S2LOC100103',
              locationChildHierarchy: [
                {
                  locationDescription: 'Not Used - Arikaree River S2 Above Water',
                  locationName: 'ABVWAT100109',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Arikaree River PAR Radiation S2',
                  locationName: 'CFGLOC100112',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Arikaree River Water Level S2',
                  locationName: 'CFGLOC101671',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Arikaree River Water Chemistry and Temperature S2',
                  locationName: 'CFGLOC101672',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Arikaree River Nitrate Analyzer S2',
                  locationName: 'CFGLOC101679',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'ss - S2 Location',
                  locationName: 'ARIK.AOS.S2',
                  locationChildHierarchy: [],
                }
              ]
            },
            {
              locationDescription: 'Not Used - Arikaree River Gauge',
              locationName: 'GAUGE101247',
              locationChildHierarchy: [
                {
                  locationDescription: 'Not Used - Arikaree River Discharge',
                  locationName: 'DISCHG101249',
                  locationChildHierarchy: [],
                }
              ]
            },
            {
              locationDescription: 'Arikaree River Staff Gauge',
              locationName: 'SGAUGE101248',
              locationChildHierarchy: [
                {
                  locationDescription: 'Arikaree River Staff Gauge Camera',
                  locationName: 'CFGLOC101673',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Gauge',
                  locationName: 'ARIK.AOS.gauge',
                  locationChildHierarchy: [],
                }
              ]
            },
            {
              locationDescription: 'Aquatic Plant Parent',
              locationName: 'ARIK.AOS.plant.parent',
              locationChildHierarchy: [
                {
                  locationDescription: '01 - Aquatic Plant Transect',
                  locationName: 'ARIK.AOS.aquatic.plant.transect.01',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: '02 - Aquatic Plant Transect',
                  locationName: 'ARIK.AOS.aquatic.plant.transect.02',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: '03 - Aquatic Plant Transect',
                  locationName: 'ARIK.AOS.aquatic.plant.transect.03',
                  locationChildHierarchy: [],
                },
              ]
            },
            {
              locationDescription: 'Fish parent',
              locationName: 'ARIK.AOS.fish.parent',
              locationChildHierarchy: [
                {
                  locationDescription: '01 Fish Point',
                  locationName: 'ARIK.AOS.fish.point.01',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: '02 Fish Point',
                  locationName: 'ARIK.AOS.fish.point.02',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: '03 Fish Point',
                  locationName: 'ARIK.AOS.fish.point.03',
                  locationChildHierarchy: [],
                },
              ]
            },
            {
              locationDescription: 'Sediment Parent',
              locationName: 'ARIK.AOS.sediment.parent',
              locationChildHierarchy: [
                {
                  locationDescription: '1 - Sediment',
                  locationName: 'ARIK.AOS.sediment.01',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: '2 - Sediment',
                  locationName: 'ARIK.AOS.sediment.02',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: '3 - Sediment',
                  locationName: 'ARIK.AOS.sediment.03',
                  locationChildHierarchy: [],
                }
              ]
            },
            {
              locationDescription: 'Reaeration Parent',
              locationName: 'ARIK.AOS.reaeration.parent',
              locationChildHierarchy: [
                {
                  locationDescription: 'Station 0 - Drip REA',
                  locationName: 'ARIK.AOS.reaeration.station.drip',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Station 1 - REA',
                  locationName: 'ARIK.AOS.reaeration.station.01',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Station 2 - REA',
                  locationName: 'ARIK.AOS.reaeration.station.02',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Station 3 - REA',
                  locationName: 'ARIK.AOS.reaeration.station.03',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'Station 4 - REA',
                  locationName: 'ARIK.AOS.reaeration.station.04',
                  locationChildHierarchy: [],
                }
              ]
            },
            {
              locationDescription: 'Discharge',
              locationName: 'ARIK.AOS.discharge',
              locationChildHierarchy: [],
            },
            {
              locationDescription: 'TOP - Top of reach',
              locationName: 'ARIK.AOS.reach.top',
              locationChildHierarchy: [],
            },
            {
              locationDescription: 'BOT - Bottom of reach',
              locationName: 'ARIK.AOS.reach.bottom',
              locationChildHierarchy: [],
            }
          ]
        },
        {
          locationDescription: 'Arikaree River Groundwater Wells',
          locationName: 'GWWELL101238',
          locationChildHierarchy: [
            {
              locationDescription: 'Arikaree River Well, 001',
              locationName: 'WELL101680',
              locationChildHierarchy: [
                {
                  locationDescription: 'Arikaree River Groundwater Well 001',
                  locationName: 'CFGLOC101239',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'w1 - GW Well 001',
                  locationName: 'ARIK.AOS.groundwater.well.001',
                  locationChildHierarchy: [],
                }
              ]
            },
            {
              locationDescription: 'Arikaree River Well, 002',
              locationName: 'WELL101681',
              locationChildHierarchy: [
                {
                  locationDescription: 'Arikaree River Groundwater Well 002',
                  locationName: 'CFGLOC101240',
                  locationChildHierarchy: [],
                },
                {
                  locationDescription: 'w2 - GW Well 002',
                  locationName: 'ARIK.AOS.groundwater.well.002',
                  locationChildHierarchy: [],
                }
              ]
            },
          ]
        },
        {
          locationDescription: 'Arikaree River Met Station',
          locationName: 'METSTN101250',
          locationChildHierarchy: [
            {
              locationDescription: 'Arikaree River 2d Wind',
              locationName: 'CFGLOC101251',
              locationChildHierarchy: [],
            },
            {
              locationDescription: 'Arikaree River Relative Humidity',
              locationName: 'CFGLOC101252',
              locationChildHierarchy: [],
            },
            {
              locationDescription: 'Arikaree River PAR Radiation Met Station',
              locationName: 'CFGLOC101253',
              locationChildHierarchy: [],
            },
            {
              locationDescription: 'Arikaree River Net Radiation',
              locationName: 'CFGLOC101254',
              locationChildHierarchy: [],
            },
            {
              locationDescription: 'Arikaree River Single Aspirated Air Temperature',
              locationName: 'CFGLOC101255',
              locationChildHierarchy: [],
            },
            {
              locationDescription: 'Arikaree River Barometric Pressure',
              locationName: 'CFGLOC101256',
              locationChildHierarchy: [],
            }
          ]
        },
        {
          locationDescription: 'Arikaree River Wet Deposition',
          locationName: 'CFGLOC101674',
          locationChildHierarchy: [
            {
              locationDescription: 'Wet Deposition',
              locationName: 'ARIK.AOS.wet.deposition',
              locationChildHierarchy: [],
            }
          ]
        },
        {
          locationDescription: 'Arikaree River Primary Precipitation',
          locationName: 'CFGLOC101675',
          locationChildHierarchy: [],
        },
        {
          locationDescription: 'Riparian Parent ',
          locationName: 'ARIK.AOS.riparian.parent',
          locationChildHierarchy: [
            {
              locationDescription: '01 - Riparian Transect',
              locationName: 'ARIK.AOS.riparian.transect.01',
              locationChildHierarchy: [],
            },
            {
              locationDescription: '02 - Riparian Transect',
              locationName: 'ARIK.AOS.riparian.transect.02',
              locationChildHierarchy: [],
            },
            {
              locationDescription: '03 - Riparian Transect',
              locationName: 'ARIK.AOS.riparian.transect.03',
              locationChildHierarchy: [],
            },
          ]
        },
        {
          locationDescription: 'BEN_1',
          locationName: 'ARIK.AOS.benchmark.1',
          locationChildHierarchy: [],
        },
        {
          locationDescription: 'BEN_2',
          locationName: 'ARIK.AOS.benchmark.2',
          locationChildHierarchy: [],
        },
        {
          locationDescription: 'BEN_3',
          locationName: 'ARIK.AOS.benchmark.3',
          locationChildHierarchy: [],
        },
        {
          locationDescription: 're - Reach',
          locationName: 'ARIK.AOS.reach',
          locationChildHierarchy: [],
        },
        {
          locationDescription: 'BEN_4',
          locationName: 'ARIK.AOS.benchmark.4',
          locationChildHierarchy: [],
        }
      ],
      locationParent: 'D10',
      locationParentUrl: 'https://data.neonscience.org/api/v0/locations/D10'
    };
    const output = {
      STREAM100096: { parent: null, description: 'Arikaree River Stream' },
      S1LOC100099: { parent: 'STREAM100096', description: 'Arikaree River S1 Location' },
      CFGLOC100111: { parent: 'S1LOC100099', description: 'Arikaree River PAR Radiation S1' },
      CFGLOC101669: { parent: 'S1LOC100099', description: 'Arikaree River Water Level S1' },
      CFGLOC101670: { parent: 'S1LOC100099', description: 'Arikaree River Water Chemistry and Temperature S1' },
      S2LOC100103: { parent: 'STREAM100096', description: 'Arikaree River S2 Location' },
      CFGLOC100112: { parent: 'S2LOC100103', description: 'Arikaree River PAR Radiation S2' },
      CFGLOC101671: { parent: 'S2LOC100103', description: 'Arikaree River Water Level S2' },
      CFGLOC101672: { parent: 'S2LOC100103', description: 'Arikaree River Water Chemistry and Temperature S2' },
      CFGLOC101679: { parent: 'S2LOC100103', description: 'Arikaree River Nitrate Analyzer S2' },
      'ARIK.AOS.S2': { parent: 'S2LOC100103', description: 'ss - S2 Location' },
      SGAUGE101248: { parent: 'STREAM100096', description: 'Arikaree River Staff Gauge' },
      CFGLOC101673: { parent: 'SGAUGE101248', description: 'Arikaree River Staff Gauge Camera' },
      'ARIK.AOS.gauge': { parent: 'SGAUGE101248', description: 'Gauge' },
      'ARIK.AOS.plant.parent': { parent: 'STREAM100096', description: 'Aquatic Plant Parent' },
      'ARIK.AOS.aquatic.plant.transect.01': { parent: 'ARIK.AOS.plant.parent', description: '01 - Aquatic Plant Transect' },
      'ARIK.AOS.aquatic.plant.transect.02': { parent: 'ARIK.AOS.plant.parent', description: '02 - Aquatic Plant Transect' },
      'ARIK.AOS.aquatic.plant.transect.03': { parent: 'ARIK.AOS.plant.parent', description: '03 - Aquatic Plant Transect' },
      'ARIK.AOS.fish.parent': { parent: 'STREAM100096', description: 'Fish parent' },
      'ARIK.AOS.fish.point.01': { parent: 'ARIK.AOS.fish.parent', description: '01 Fish Point' },
      'ARIK.AOS.fish.point.02': { parent: 'ARIK.AOS.fish.parent', description: '02 Fish Point' },
      'ARIK.AOS.fish.point.03': { parent: 'ARIK.AOS.fish.parent', description: '03 Fish Point' },
      'ARIK.AOS.sediment.parent': { parent: 'STREAM100096', description: 'Sediment Parent' },
      'ARIK.AOS.sediment.01': { parent: 'ARIK.AOS.sediment.parent', description: '1 - Sediment' },
      'ARIK.AOS.sediment.02': { parent: 'ARIK.AOS.sediment.parent', description: '2 - Sediment' },
      'ARIK.AOS.sediment.03': { parent: 'ARIK.AOS.sediment.parent', description: '3 - Sediment' },
      'ARIK.AOS.reaeration.parent': { parent: 'STREAM100096', description: 'Reaeration Parent' },
      'ARIK.AOS.reaeration.station.drip': { parent: 'ARIK.AOS.reaeration.parent', description: 'Station 0 - Drip REA' },
      'ARIK.AOS.reaeration.station.01': { parent: 'ARIK.AOS.reaeration.parent', description: 'Station 1 - REA' },
      'ARIK.AOS.reaeration.station.02': { parent: 'ARIK.AOS.reaeration.parent', description: 'Station 2 - REA' },
      'ARIK.AOS.reaeration.station.03': { parent: 'ARIK.AOS.reaeration.parent', description: 'Station 3 - REA' },
      'ARIK.AOS.reaeration.station.04': { parent: 'ARIK.AOS.reaeration.parent', description: 'Station 4 - REA' },
      'ARIK.AOS.discharge': { parent: 'STREAM100096', description: 'Discharge' },
      'ARIK.AOS.reach.top': { parent: 'STREAM100096', description: 'TOP - Top of reach' },
      'ARIK.AOS.reach.bottom': { parent: 'STREAM100096', description: 'BOT - Bottom of reach' },
      GWWELL101238: { parent: null, description: 'Arikaree River Groundwater Wells' },
      WELL101680: { parent: 'GWWELL101238', description: 'Arikaree River Well, 001' },
      CFGLOC101239: { parent: 'WELL101680', description: 'Arikaree River Groundwater Well 001' },
      'ARIK.AOS.groundwater.well.001': { parent: 'WELL101680', description: 'w1 - GW Well 001' },
      WELL101681: { parent: 'GWWELL101238', description: 'Arikaree River Well, 002' },
      CFGLOC101240: { parent: 'WELL101681', description: 'Arikaree River Groundwater Well 002' },
      'ARIK.AOS.groundwater.well.002': { parent: 'WELL101681', description: 'w2 - GW Well 002' },
      METSTN101250: { parent: null, description: 'Arikaree River Met Station' },
      CFGLOC101251: { parent: 'METSTN101250', description: 'Arikaree River 2d Wind' },
      CFGLOC101252: { parent: 'METSTN101250', description: 'Arikaree River Relative Humidity' },
      CFGLOC101253: { parent: 'METSTN101250', description: 'Arikaree River PAR Radiation Met Station' },
      CFGLOC101254: { parent: 'METSTN101250', description: 'Arikaree River Net Radiation' },
      CFGLOC101255: { parent: 'METSTN101250', description: 'Arikaree River Single Aspirated Air Temperature' },
      CFGLOC101256: { parent: 'METSTN101250', description: 'Arikaree River Barometric Pressure' },
      CFGLOC101674: { parent: null, description: 'Arikaree River Wet Deposition' },
      'ARIK.AOS.wet.deposition': { parent: 'CFGLOC101674', description: 'Wet Deposition' },
      CFGLOC101675: { parent: null, description: 'Arikaree River Primary Precipitation' },
      'ARIK.AOS.riparian.parent': { parent: null, description: 'Riparian Parent ' },
      'ARIK.AOS.riparian.transect.01': { parent: 'ARIK.AOS.riparian.parent', description: '01 - Riparian Transect' },
      'ARIK.AOS.riparian.transect.02': { parent: 'ARIK.AOS.riparian.parent', description: '02 - Riparian Transect' },
      'ARIK.AOS.riparian.transect.03': { parent: 'ARIK.AOS.riparian.parent', description: '03 - Riparian Transect' },
      'ARIK.AOS.benchmark.1': { parent: null, description: 'BEN_1' },
      'ARIK.AOS.benchmark.2': { parent: null, description: 'BEN_2' },
      'ARIK.AOS.benchmark.3': { parent: null, description: 'BEN_3' },
      'ARIK.AOS.benchmark.4': { parent: null, description: 'BEN_4' },
      'ARIK.AOS.reach': { parent: null, description: 're - Reach' },
    };
    test('generates a flat site location hierarchy object', () => {
      expect(parseLocationHierarchy(input)).toStrictEqual(output);
    });
  });
});
