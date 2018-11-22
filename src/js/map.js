import * as Plotly from 'plotly.js-dist';

const colorScales = {
  Summer: [[0, 'rgb(253, 221, 225)'], [1.0, 'rgb(163, 10, 26)']],
  Winter: [[0, 'rgb(190,240,255)'], [1.0, 'rgb(10, 89, 128)']],
}

const hostCityColor = '#F7C736';

export function plotMap(rows, season) {
  document.getElementById('colorLegend').style = `background: linear-gradient(to right, ${colorScales[season][0][1]} 0%, ${colorScales[season][1][1]} 100%)`;

  const locations = [];
  const z = [];
  const text = [];

  rows.forEach(el => {
    locations.push(el['noc']);
    z.push(el['total']);
    text.push(el['name']);
  });
  var data = [{
    type: 'choropleth',
    showlegend: false,
    colorscale: colorScales.Winter,
    marker: {
      line: {
        color: 'rgb(255,255,255)',
        width: 2
      }
    },
    showscale: false,
    reversescale: false,
    locations: locations,
    z: z,
    text: text,
 
  }, {
    type: 'scattergeo',
    mode: 'markers',
    locations: ['USA'],
    marker: {
      size: 15,
      color: hostCityColor,
      line: {
        width: 1
      }
    },
    name: 'Host City'
  }];

  var layout = {
    geo: {
      projection: {
        type: 'orthographic'
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
  const map = document.getElementById('mymap');
  Plotly.newPlot(map, data, layout, { showLink: false, displayModeBar: true });

}