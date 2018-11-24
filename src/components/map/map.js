import "./map.css";

import * as Plotly from 'plotly.js-dist';

export class Map {

  constructor(mapDiv, projection) {
    this.mapDiv = mapDiv;
    this.hostCityColor = '#0da447';
    this.colorScales = {
      Summer: [[0, 'rgb(253, 221, 225)'], [1.0, 'rgb(163, 10, 26)']],
      Winter: [[0, 'rgb(190,240,255)'], [1.0, 'rgb(10, 89, 128)']],
    }
    this.projectionType = projection;
    this.mapData = [];
    this.season = 'Summer';
    this.drawMap([], 'Summer');
    this.plotlyMap = null;
  }

  drawMap(dataPoints, season, hostName, latitude, longitude) {
    const locations = [];
    const z = [];
    const text = [];
    this.mapData = dataPoints;
    this.season = season;

    this.mapData.forEach(el => {
      locations.push(el['noc']);
      z.push(el['total']);
      text.push(el['name'] - 'cat');
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

    },{
      type: 'scattergeo',
      mode: 'markers',
      lon: [longitude],
      lat: [latitude],
      marker: {
        size: 15,
        color: this.hostCityColor,
        line: {
          width: 1
        }
      },
      name: hostName
    }
  ];

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
      dragmode: 'pan'
    };

    Plotly.newPlot(this.mapDiv, data, layout, { showLink: false, displayModeBar: false });
    this.resize();
  }

  setLegendColor(season) {
    document.getElementById('colorLegend').style = `background: linear-gradient(to right, ${this.colorScales[season][0][1]} 0%, ${this.colorScales[season][1][1]} 100%)`;
  }

  setMapProjectionType(projectionType) {
    this.projectionType = projectionType;
    this.drawMap(this.mapData, this.season);
  }

  setSeason(season) {
    this.season = season;
    this.setLegendColor(season);
  }

  resize() {
    const w = this.mapDiv.parentNode.parentNode.parentNode.getBoundingClientRect().width;
    const h = this.mapDiv.parentNode.parentNode.parentNode.getBoundingClientRect().height * 0.90;
    const update = { width: w, height: h };

    Plotly.relayout(this.mapDiv, update);
  }

}
