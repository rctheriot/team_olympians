import "./index.css";
import 'purecss';

// Import all classes
import { Map } from './components/map/map.js';
import { Database } from './components/database/database';
import { Table } from './components/table/table';
import { Hosts } from './hosts';
import { Chart } from "./components/charts/charts";


// Map Setup
const mapDiv = document.getElementById('plotlyMap');
const plotlyMap = new Map(mapDiv, 'robinson');

//ChartSetup 

const chartDiv = document.getElementById('detailsDiv');
const chart = new Chart(chartDiv, " ");

// variables to update map
let mapPlot = [];
let hostPlot = [];

// Databases Setup
const database = new Database();
const athleteCSV = require("./assets/csv/athlete_events.csv");
database.loadCSVIntoDatabase(athleteCSV, 'athletes');
const countryCodes = require("./assets/csv/countrycodes.csv");
database.loadCSVIntoDatabase(countryCodes, 'countryCodes');

// Table Setup
const medalTableDiv = document.getElementById('medalTableDiv')
const medalTable = new Table(medalTableDiv);

// Hide Podium
hidePodium();

// Query Setup
let year;
let selYearDiv;
let sex;
let selSexDiv;
let sport;
let selSportDiv;
let season;
let selSeasonDiv;
let medal;
let selMedalDiv;
let query = {};
var topCountries;

let hostCity = {};

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
  updateUIColor();
}

window.seasonChange = (div) => {
  season = div.value;
  if (selSeasonDiv != undefined) selSeasonDiv.classList.remove('selected-button');
  selSeasonDiv = div;
  selSeasonDiv.classList.add('selected-button');
  setQuery();
  setupSportList();
  updateUIColor();
  plotlyMap.setSeason(season);
}

window.yearChange = (div) => {
  year = div.value;
  if (selYearDiv != undefined) selYearDiv.classList.remove('selected-button');
  selYearDiv = div;
  selYearDiv.classList.add('selected-button');
  setQuery();
  setupSportList();
}

window.genderChange = (div) => {
  sex = div.value;
  if (selSexDiv != undefined) selSexDiv.classList.remove('selected-button');
  selSexDiv = div;
  selSexDiv.classList.add('selected-button');
  setQuery();
  setupSportList();
}

window.sportChange = (div) => {
  sport = div.value;
  if (selSportDiv != undefined) selSportDiv.classList.remove('selected-button');
  selSportDiv = div;
  selSportDiv.classList.add('selected-button');
  setQuery();
  startQuery();
}

window.medalChange = (div) => {
  medal = div.value;
  if (selMedalDiv != undefined) selMedalDiv.classList.remove('selected-button');
  selMedalDiv = div;
  selMedalDiv.classList.add('selected-button');
}



window.changeSortSelection = (selSort) => {
  medalTable.changeSortSelection(selSort);
}

window.setMapProjectionType = (type) => {
  plotlyMap.setMapProjectionType(type);
  plotlyMap.drawMap(mapPlot, season, medal, hostPlot['City'], hostPlot['Lat'], hostPlot['Long']);
}

window.onresize = () => {
  plotlyMap.resize();
}


window.CreateHistoryChart = (countryIndex) =>{
  var currentCountry = topCountries[countryIndex];
  CreateCharts(currentCountry);
  document.getElementById("detailsDiv").style.display = "block";
  document.getElementById('detailsDiv').style.opacity = 1; 
}


window.fadeOutEffect = (id) => {
  var fadeTarget = document.getElementById(id);
  var fadeEffect = setInterval(function () {
    if (!fadeTarget.style.opacity) {
      fadeTarget.style.opacity = 1;
    }
    if (fadeTarget.style.opacity > 0) {
      fadeTarget.style.opacity -= 0.09;
    }
    else {
      clearInterval(fadeEffect);
      document.getElementById(id).style.display = "none";
    }
  }, 80);

}




window.closeDiv = () => {
  window.fadeOutEffect("detailsDiv");
 // document.getElementById("detailsDiv").style.display = "none";
}


function updateUIColor() {
  const color = (season == 'Summer') ? 'rgb(123, 10, 26)' : 'rgb(10, 89, 128)';
  const elements = document.getElementsByClassName('pure-button pure-button-primary');
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.background = color;
  }
  // Change button year to correspond to season
  document.getElementById('14/16button').textContent = (season == 'Summer') ? '2016' : '2014';
  document.getElementById('10/12button').textContent = (season == 'Summer') ? '2012' : '2010';
  document.getElementById('06/08button').textContent = (season == 'Summer') ? '2008' : '2006';
  document.getElementById('02/04button').textContent = (season == 'Summer') ? '2004' : '2002';
  document.getElementById('98/00button').textContent = (season == 'Summer') ? '2000' : '1998';
  document.getElementById('94/96button').textContent = (season == 'Summer') ? '1996' : '1994';
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
    'code': countryInfo['Code'],
  }
}

const BreakException = {};





function startQuery() {

  if (year == undefined || sex == undefined || season == undefined || sport == undefined || medal == undefined) return;
  let countryData = {};
  let fixYear = false;
  database.queryDatabase('athletes', query).forEach(athleteInfo => {
    if (!fixYear) {
      year = athleteInfo['Year'];
      fixYear = true;
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

    } catch (e) {
      if (e !== BreakException) throw e;
    }
  });

  const mapData = [];
  Object.keys(countryData).forEach(country => {
    countryData[country]['gold'] = [...new Set(countryData[country]['gold'])].length;
    countryData[country]['silver'] = [...new Set(countryData[country]['silver'])].length;
    countryData[country]['bronze'] = [...new Set(countryData[country]['bronze'])].length;
    countryData[country]['na'] = [...new Set(countryData[country]['na'])].length;
    countryData[country]['total'] = countryData[country]['gold'] + countryData[country]['silver'] + countryData[country]['bronze'];
    countryData[country]['code'];
    mapData.push(countryData[country]);
  })

  mapPlot = mapData;
  hostPlot = hostCity;
  setPodium(mapData);

  plotlyMap.drawMap(mapData, season, medal, hostCity['City'], hostCity['Lat'], hostCity['Long']);
  document.getElementById('olympicheader').innerText = year + " " + season + " Olympics\r\n" + hostPlot['City'] + ", " + hostPlot['Country'];
  //Create Chart From mapData
  //Set top countries for charts.(Optimize)
  topCountries = [];
  var count = 0;
  while (topCountries.length <= 2) {
    topCountries.push(mapData[count]);
    count++;
  }



}
function GetListOfYears() {
  var years = [];
  var yearsDiv = document.getElementById("btnsYears");
  var btns = yearsDiv.getElementsByTagName("button");
  for (var i = 0; i < btns.length; i++) {
    years.push(btns[i].innerText);
  }
  return years;

}

function CreateCharts(country) {
  var traces = [];
  var years = GetListOfYears();
  var goldMedals = [];
  var silverMedals = [];
  var bronzeMedals = [];
  var participants = [];


  years.forEach(year => {
    let _query = { Year: year, Sport: sport, NOC: country.noc };
    if(sport == "All"){
      delete _query['Sport'];
    }
    let _result = database.queryDatabase('athletes', _query);

    participants.push(_result.length);
    var medalCount = [0, 0, 0];
    for (var i = 0; i < _result.length; i++) {
      if (_result[i].Medal == "Gold") {
        medalCount[0] = medalCount[0] + 1;
      } else if (_result[i].Medal == "Silver") {
        medalCount[1] = medalCount[1] + 1;
      } else if (_result[i].Medal == "Bronze") {
        medalCount[2] = medalCount[2] + 1;
      }

    }
    goldMedals.push(medalCount[0]);
    silverMedals.push(medalCount[1]);
    bronzeMedals.push(medalCount[2]);

  });
  //traces.push(participants);
  traces[0] = goldMedals;
  traces[1] = silverMedals;
  traces[2] = bronzeMedals;


  GetListOfYears().forEach(element => {
    let q = { Year: element, Sport: sport, NOC: topCountries[0].noc };
    var result = database.queryDatabase('athletes', q);
  });

  chart.plotData(years, traces,country.name,sport);

}

function hidePodium() {
  document.getElementById("right-toolbar").style.display = "none";
}

function showPodium() {
  document.getElementById("right-toolbar").style.display = "block";
}

function setPodium(data) {
  if (!data) {
    hidePodium();
  }
  else {
    showPodium();

    data.sort(function (a, b) {
      var keyA = a[medal];
      var keyB = b[medal];
      return keyB - keyA;
    });
    document.getElementById('firstnation').src = "https://jkbishay.github.io/images/flags-normal/" + data[0]['code'].toLowerCase() + ".png";
    document.getElementById('secondnation').src = "https://jkbishay.github.io/images/flags-normal/" + data[1]['code'].toLowerCase() + ".png";
    document.getElementById('thirdnation').src = "https://jkbishay.github.io/images/flags-normal/" + data[2]['code'].toLowerCase() + ".png";
    document.getElementById('firstText').innerText = data[0][medal];
    document.getElementById('secondText').innerText = data[1][medal];
    document.getElementById('thirdText').innerText = data[2][medal];
    document.getElementById('firstname').innerText = data[0]['name'];
    document.getElementById('secondname').innerText = data[1]['name'];
    document.getElementById('thirdname').innerText = data[2]['name'];
  }
}

function setupSportList() {
  if (year == undefined || sex == undefined || season == undefined) return;
  const q = query;
  console.log(q);
  delete q['Sport'];
  const sportList = [];
  database.queryDatabase('athletes', q).forEach(el => {
    if (sportList.indexOf(el['Sport']) == -1) {
      sportList.push(el['Sport']);
    }
  });

  const sportListDiv = document.getElementById('sport-list');
  while (sportListDiv.firstChild) {
    sportListDiv.removeChild(sportListDiv.firstChild);
  }
  const color = (season == 'Summer') ? 'rgb(123, 10, 26)' : 'rgb(10, 89, 128)';

  const elements = [];
  const allButton = document.createElement("button");
  allButton.classList.add('pure-button');
  allButton.classList.add('pure-button-primary');
  allButton.value = 'All';
  allButton.innerText = 'All Events';
  allButton.style.background = color;
  allButton.onclick = function (allButton) { window.sportChange(this) };
  elements.push(allButton);
  sportList.sort();
  sportList.forEach(el => {
    const element = document.createElement("button");
    element.classList.add('pure-button');
    element.classList.add('pure-button-primary');
    element.value = el;
    element.innerText = el;
    element.style.background = color;
    element.onclick = function (element) { window.sportChange(this) };
    elements.push(element);
  })
  sportListDiv.append(...elements);


}
