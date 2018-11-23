import "./index.css";
import 'purecss';

// Import all classes
import { Map } from './components/map/map.js';
import { Database } from './components/database/database';
import { Table } from './components/table/table';

// Map Setup
const mapDiv = document.getElementById('plotlyMap');
const plotlyMap = new Map(mapDiv);

// Databases Setup
const database = new Database();
const athleteCSV = require("./assets/csv/athlete_events.csv");
database.loadCSVIntoDatabase(athleteCSV, 'athletes');
const countryCodes = require("./assets/csv/countrycodes.csv");
database.loadCSVIntoDatabase(countryCodes, 'countryCodes');

// Table Setup
const medalTableDiv = document.getElementById('medalTableDiv')
const medalTable = new Table(medalTableDiv);

// Title and Query Setup
let year = '2016';
let sex = 'Male';
let sport = 'Swimming';
let season = 'Summer';
let query = {};
setQuery();
setTitle();
const titleDiv = document.getElementById('title');

function setQuery() {
  query = { Year: { lte: year, gte: (Number(year) - 2).toString() }, Sport: sport, Season: season, Sex: sex };
  if (sex == "Both") {
    delete query['Sex'];
    if (sport == 'All') {
      delete query['Sport'];
    }
  }
  console.log(query);
}

function setTitle() {
  if (titleDiv) {
    titleDiv.innerText = `${year} ${season} Olympics - ${sex} ${sport}`;
  }
}

window.yearChange = (selYear) => {
  year = selYear;
  setTitle();
  setQuery();
  startQuery();
}

window.genderChange = (selGender) => {
  sex = selGender;
  setTitle();
  setQuery();
  startQuery();
}

window.sportChange = (selSport) => {
  sport = selSport;
  setTitle();
  setQuery();
  startQuery();
}

window.seasonChange = (selSeason) => {
  season = selSeason;
  setTitle();
  setQuery();
  plotlyMap.setSeason(season);
  startQuery();
}

window.changeSortSelection = (selSort) => {
  medalTable.changeSortSelection(selSort);
}

window.setMapProjectionType = (type) => {
  plotlyMap.setMapProjectionType(type);
}

window.onresize = () => {
  plotlyMap.resize();
}

function startQuery() {
  const data = {};
  database.queryDatabase('athletes', query).forEach(el => {
    const country = el['NOC'];
    const event = el['Event'];
    const medal = el['Medal'];

    if (medal != 'NA') {

      if (!data[country]) {
        data[country] = {
          'name': country,
          'gold': 0,
          'silver': 0,
          'bronze': 0,
          'total': 0,
          'events': []
        }
      }
      if (data[country]['events'].indexOf(event) == -1) {
        data[country]['events'].push(event);
        switch (medal) {
          case 'Gold':
            data[country]['total'] += 1;
            data[country]['gold'] += 1;
            break;
          case 'Silver':
            data[country]['total'] += 1;
            data[country]['silver'] += 1;
            break;
          case 'Bronze':
            data[country]['total'] += 1;
            data[country]['bronze'] += 1;
            break;
        }
      }
    }

  });

  const dataArray = [];
  const tableArray = [];
  Object.keys(data).forEach(country => {
    delete data[country]['events'];
    dataArray.push(data[country]);
    tableArray.push(data[country])
  });

  // medalTable.updateTableData(tableArray);

  plotlyMap.drawMap(dataArray, season);
}



