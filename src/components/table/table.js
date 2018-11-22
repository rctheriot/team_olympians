
export class Table {

  constructor(tableDiv) {
    this.tableDiv = tableDiv;
    this.tableData = [];
    this.sortSelection = '';
  }

  changeSortSelection(sortSelection) {
    this.sortSelection = sortSelection;
    updateTableData(this.tableData, div);
  }

  updateTableData(data) {
    this.tableData = data;
    this.updateHeaders();
    this.updateRows();
  }

  updateHeaders(headers) {
    // TODO
  }

  updateRows() {
    var new_tbody = document.createElement('tbody');
    new_tbody.id = 'countryMedals';
    this.sortTableRows();
    this.tableData.forEach((d, i) => {
      let tr = new_tbody.insertRow(i);
      Object.keys(d).forEach((k, j) => {
        var cell = tr.insertCell(j);
        cell.innerHTML = d[k]; 
      });
      new_tbody.appendChild(tr);
    })
    this.tableDiv.parentNode.replaceChild(new_tbody, this.tableDiv);
  }

  sortTableRows() {
    this.tableData.sort((a, b) => { 
      (a[this.sortSelection] < b[this.sortSelection]) ? 1 : ((b[this.sortSelection] < a[this.sortSelection]) ? -1 : 0)
    });
  }

}
