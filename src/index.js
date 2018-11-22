import "./main.css";
import "./css/map.css";
import 'purecss';
import * as map from './js/map';
import * as db from './js/database';
import * as table from './js/table';

const titleDiv = document.getElementById('title');

const athleteCSV = require("./assets/athlete_events.csv");
db.loadCSVIntoDatabase(athleteCSV, 'athletes');

const countryCodes = require("./assets/countrycodes.csv");
db.loadCSVIntoDatabase(countryCodes, 'countryCodes');

let year = '2016';
let sex = 'M';
let sport = 'Swimming';
let season = 'Winter';

setTitle();

// map.plotMap([]);

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
  table.changeSortSelection(selSort, document.getElementById('countryMedals'));
}

function query() {
  const data = {};
  const query = { Year: year };
  if (sport == 'All') delete query['Sport'];
  delete query['Sex']
  db.getDatabase('athletes')(query).each(el => {
    const country = el['NOC'];
    const event = el['Event'];
    const medal = el['Medal'];

    if (medal != 'NA') {
      const countryInfo = db.getDatabase('countryCodes')({ NOC: country }).get()[0];
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

  table.createCountryMedalTable(tableArray, document.getElementById('countryMedals'));
  map.plotMap(dataArray, season);
}
