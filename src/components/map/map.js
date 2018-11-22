import "./map.css";

import * as Plotly from 'plotly.js-dist';

export class Map {

  constructor(mapDiv) {
    this.mapDiv = mapDiv;
    this.hostCityColor = '#F7C736';
    this.colorScales = {
      Summer: [[0, 'rgb(253, 221, 225)'], [1.0, 'rgb(163, 10, 26)']],
      Winter: [[0, 'rgb(190,240,255)'], [1.0, 'rgb(10, 89, 128)']],
    }
    this.projectionType = 'orthographic';
    this.mapData = [];
    this.season = 'Summer';
  }

  drawMap(dataPoints, season) {
    const locations = [];
    const z = [];
    const text = [];
    this.mapData = dataPoints;
    this.season = season;
  
    this.mapData.forEach(el => {
      locations.push(el['noc']);
      z.push(el['total']);
      text.push(el['name']);
    });

    var data = [{
      type: 'choropleth',
      colorscale: this.colorScales[season],
      showscale: false,
      reversescale: false,
      marker: {
        line: {
          color: 'rgb(255,255,255)',
          width: 2
        }
      },
      locations: locations,
      z: z,
      text: text,
   
    }, {
      type: 'scattergeo',
      mode: 'markers',
      locations: ['USA'],
      marker: {
        size: 15,
        color: this.hostCityColor,
        line: {
          width: 1
        }
      },
      name: 'Host City'
    }];
  
    var layout = {
      geo: {
        projection: {
          type: this.projectionType,
        }
      },
      marker: {
        line: {
          color: 'rgb(255,255,255)',
          width: 2
        }
      },
      paper_bgcolor: "rgba(40,40,40, 1.0)",
    };
  
    Plotly.newPlot(this.mapDiv, data, layout, { showLink: false, displayModeBar: true });
  }

  setLegendColor(season) {
    document.getElementById('colorLegend').style = `background: linear-gradient(to right, ${colorScales[season][0][1]} 0%, ${colorScales[season][1][1]} 100%)`;
  }

  setMapProjectionType(projectionType) {
    this.projectionType = projectionType;
    this.drawMap(this.mapData);
  }

}
