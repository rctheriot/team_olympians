import "./charts.css";

import * as Plotly from 'plotly.js-dist';



export class Chart {
    constructor(chartDiv, data) {
        this.chartDiv = chartDiv;
        this.data = data;
        this.plotData = function (xValues, yValues, countryName, eventName) {
            this.plotNewData(this.chartDiv, xValues, yValues, countryName, eventName);
        }
    }

    plotNewData(chartDiv, xValues, tracesArray,countryName, eventName) {
        var trace1 = {
            x: xValues,
            y: tracesArray[0],
            mode: 'lines',
            name: 'Gold',
            line: {
              color: 'rgb(255,223,0)',
              width: 2
            }
        }
        var trace2 = {
            x: xValues,
            y: tracesArray[1],
            mode: 'lines',
            name: 'Silver',
            line: {
              color: 'rgb(192,192,192)',
              width: 2
            }
        }
        var trace3 = {
            x: xValues,
            y: tracesArray[2],
            mode: 'lines',
            name: 'Bronze',
            line: {
              color: 'rgb(205, 127, 50)',
              width: 2
            }
        }
        
        
        
        var dataToPlot = [trace1,trace2,trace3];



        var layout = {
            autosize: true,
            width: 800,
            height: 500,
            font: {
                color: 'snow'
            },
            title: countryName + ' Total Medals count by Year for ' + eventName,
            xaxis: {
                title: 'Year'
            },
            yaxis: {
                title: 'Medals'
            },

            paper_bgcolor: 'rgba(0,0,0,0.8)',
            plot_bgcolor: 'rgba(0,0,0,0.8)'

        };
        Plotly.newPlot(chartDiv, dataToPlot, layout);
    }


}