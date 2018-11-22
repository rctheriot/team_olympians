import "./index.css";
import 'purecss';

// Import all classes
import { Map } from './components/map/map.js';
import { Database }from './components/database/database';
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
const titleDiv = document.getElementById('title');
let year = '2016';
let sex = 'M';
let sport = 'Swimming';
let season = 'Winter';

function setTitle() {
  titleDiv.innerText = `${year} ${season} Olympics - ${(sex == 'M') ? 'Male' : 'Female'} ${sport}`;
}

window.sportChange = (selSport) => {
  sport = selSport;
  setTitle();
  query();
}

window.yearChange = (selYear) => {
  year = selYear;
  setTitle();
  query();
}

window.changeSortSelection = (selSort) => {
  medalTable.changeSortSelection(selSort);
}

window.setMapProjectionType = (type) => {
  plotlyMap.setMapProjectionType(type);
}


function query() {
  const data = {};
  const query = { Year: year };

  database.queryDatabase('athletes', query).forEach(el => {
    const country = el['NOC'];
    const event = el['Event'];
    const medal = el['Medal'];

    if (medal != 'NA') {
      const countryInfo = database.queryDatabase('countryCodes', { NOC: country });
      if (countryInfo) {
        if (!data[countryInfo.Name]) {
          data[countryInfo.Name] = {
            'name': countryInfo.Name,
            'noc': countryInfo.NOC,
            'code': countryInfo.Code,
            'gold': 0,
            'silver': 0,
            'bronze': 0,
            'total': 0,
            'events': []
          }
        }
        if (data[countryInfo.Name]['events'].indexOf(event) == -1) {
          data[countryInfo.Name]['events'].push(event);
          switch (medal) {
            case 'Gold':
              data[countryInfo.Name]['total'] += 1;
              data[countryInfo.Name]['gold'] += 1;
              break;
            case 'Silver':
              data[countryInfo.Name]['total'] += 1;
              data[countryInfo.Name]['silver'] += 1;
              break;
            case 'Bronze':
              data[countryInfo.Name]['total'] += 1;
              data[countryInfo.Name]['bronze'] += 1;
              break;
          }
        }
      }
    }
  });

  const dataArray = [];
  const tableArray = [];
  Object.keys(data).forEach(country => {
    delete data[country]['events'];
    dataArray.push(data[country]);
    delete data[country]['noc'];
    tableArray.push(data[country])
  });

  medalTable.updateTableData(tableArray);

  plotlyMap.drawMap(dataArray, season);
}



