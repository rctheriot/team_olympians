import { taffy } from 'taffydb';
import * as d3 from "d3";

export class Database {

  constructor() {
    this.databases = {};
  }

  getDatabase(databaseName) {
    return this.databases[databaseName];
  }

  queryDatabase(databaseName, query) {
    return this.databases[databaseName](query).get();
  }

  loadCSVIntoDatabase(file, databaseName) {
    const data = [];
    d3.csv(file, (row) => {
      data.push(row);
    }).then(() => {
      this.databases[databaseName] = new taffy(data);
    });
  }
}