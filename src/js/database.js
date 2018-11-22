import { taffy } from 'taffydb';
import * as d3 from "d3";

const databases = {};

export function loadCSVIntoDatabase(fileName, databaseName) {
  const data = [];
  d3.csv(fileName, (row) => {
    data.push(row);
  }).then(() => {
    databases[databaseName] = new taffy(data);
  });
}

export function getDatabase(databaseName) {
  return databases[databaseName];
}