import style from "./main.css";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Plotly from 'plotly.js-dist';

const arr = [1, 2, 3];
const iAmJavascriptES6 = () => console.log(...arr);
window.iAmJavascriptES6 = iAmJavascriptES6;

var mymap = L.map('mapid').setView([21.3069, -157.8583], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);

var trace1 = {
	x: [1, 2, 3, 4],
	y: [10, 15, 13, 17],
	mode: 'markers',
	type: 'scatter'
  };
  
  var trace2 = {
	x: [2, 3, 4, 5],
	y: [16, 5, 11, 9],
	mode: 'lines',
	type: 'scatter'
  };
  
  var trace3 = {
	x: [1, 2, 3, 4],
	y: [12, 9, 15, 12],
	mode: 'lines+markers',
	type: 'scatter'
  };
  
  var data = [trace1, trace2, trace3];
  
  Plotly.newPlot('chart', data);