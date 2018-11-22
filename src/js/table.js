

let tableData = [];
let sortSelection = 'gold';

export function changeSortSelection(value, div) {
  sortSelection = value;
  createCountryMedalTable(tableData, div);
}

export function createCountryMedalTable(data, div) {
  tableData = data;
  var new_tbody = document.createElement('tbody');
  new_tbody.id = 'countryMedals';
  tableData.sort((a, b) => (a[sortSelection] < b[sortSelection]) ? 1 : ((b[sortSelection] < a[sortSelection]) ? -1 : 0));
  tableData.forEach((d, i) => {
    var tr = new_tbody.insertRow(i);
    var code = d['code'];
    delete d['code'];
    var spot = d.length;
    Object.keys(d).forEach((k, j) => { // Keys from object represent th.innerHTML
      var cell = tr.insertCell(j);
      cell.innerHTML = d[k]; // Assign object values to cells   
    });
    var cell = tr.insertCell(spot);
    var img = document.createElement("img");
    img.src = LogoImg // Assign object values to cells
    cell.appendChild(img);
    new_tbody.appendChild(tr);
  })
  div.parentNode.replaceChild(new_tbody, div)
}

