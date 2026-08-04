import {apiGet} from './base';

export function getChart(chartType) {
  return apiGet('/chart/' + encodeURIComponent(chartType));
}

export function getCharts() {
  return apiGet('/charts');
}
