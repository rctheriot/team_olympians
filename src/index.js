import "./index.css";
import 'purecss';

// Import all classes
import { Map } from './components/map/map.js';
import { Database } from './components/database/database';
import { Table } from './components/table/table';
import { Hosts } from './hosts';

// Map Setup
const mapDiv = document.getElementById('plotlyMap');
const plotlyMap = new Map(mapDiv, 'robinson');

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
let sex = 'Both';
let sport = 'All';
let season = 'Summer';
let query = {};
const titleDiv = document.getElementById('title');

function setQuery() {
  query = { Year: { lte: year, gte: (Number(year) - 2).toString() }, Sport: sport, Season: season, Sex: sex };
  if (sex == "Both") {
    delete query['Sex'];
  } else {
    query.Sex = (sex == 'Male') ? 'M' : 'F';
  }
  if (sport == 'All') {
    delete query['Sport'];
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
  updateUIColor();
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

function updateUIColor() {
  const color = (season == 'Summer') ? 'rgb(163, 10, 26)' : 'rgb(10, 89, 128)';
  const elements = document.getElementsByClassName('pure-button pure-button-primary');
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.background = color;
  }
}

function createAthleteDataRow(athleteInfo, countryInfo) {
  return {
    name: athleteInfo['Name'],
    sex: athleteInfo['Sex'],
    age: athleteInfo['Age'],
    height: athleteInfo['Height'],
    weight: athleteInfo['Weight'],
    country: countryInfo['Name'],
    events: [],
  }
}

function createAthleteEventInfo(athleteInfo) {
  return {
    event: athleteInfo['Event'],
    sport: athleteInfo['Sport'],
    medal: athleteInfo['Medal'],
    year: athleteInfo['Year']
  }
}

function createCountryDataRow(countryInfo) {
  return {
    'name': countryInfo['Name'],
    'noc': countryInfo['NOC'],
    'gold': [],
    'silver': [],
    'bronze': [],
    'na': [],
    'total': [],
  }
}

const BreakException = {};

function startQuery() {
  let athleteData = {};
  let countryData = {};
  let fixYear = false;
  let hostCity = {};

  database.queryDatabase('athletes', query).forEach(athleteInfo => {
    if (!fixYear) { 
      year = athleteInfo['Year']; 
      setTitle(); fixYear = true; 
      hostCity = Hosts.find(host => (host.Year.toString() == athleteInfo['Year'] && host.Season.toString() == athleteInfo['Season']))
    }
    try {
      // Country CSV: Name,Code,NOC
      const countryInfo = database.queryDatabase('countryCodes', { NOC: athleteInfo['NOC'] })[0];
      if (!countryInfo) throw BreakException;
      const countryName = countryInfo['Name'];
      // Does the Country Exist Yet?
      if (!countryData[countryName]) { countryData[countryName] = createCountryDataRow(countryInfo); }
      // Add Athlete Medal to Coutnry Medal Categories.
      // Add event name so we can track which events have been alraedy countryed
      countryData[countryName]['total'].push(athleteInfo['Event']);
      countryData[countryName][athleteInfo['Medal'].toLowerCase()].push(athleteInfo['Event']);

      // Athelete CSV: "ID","Name","Sex","Age","Height","Weight","Team","NOC","Games","Year","Season","City","Sport","Event","Medal"
      // AthleteID From the CSV
      const athleteId = athleteInfo['ID'];
      // Does the Athlete Exist Yet?
      if (!athleteData[athleteId]) { athleteData[athleteId] = createAthleteDataRow(athleteInfo, countryInfo); }
      //Add this Event to the athlete's event array
      athleteData[athleteId].events.push(createAthleteEventInfo(athleteInfo));

    } catch (e) {
      if (e !== BreakException) throw e;
    }
  });
  // medalTable.updateTableData(tableArray);
  console.log(countryData);
  console.log(athleteData);

  const mapData = [];
  Object.keys(countryData).forEach(country => {
    countryData[country]['gold'] = [...new Set(countryData[country]['gold'])].length;
    countryData[country]['silver'] = [...new Set(countryData[country]['silver'])].length;
    countryData[country]['bronze'] = [...new Set(countryData[country]['bronze'])].length;
    countryData[country]['na'] = [...new Set(countryData[country]['na'])].length;
    countryData[country]['total'] = countryData[country]['gold'] + countryData[country]['silver'] + countryData[country]['bronze'];
    mapData.push(countryData[country]) 
  })

  plotlyMap.drawMap(mapData, season, hostCity['City'], hostCity['Lat'], hostCity['Long']);
}

setTimeout(() => {
  setQuery();
  setTitle();
  startQuery();
}, 2000);


