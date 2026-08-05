import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import {getChart, getCharts} from '../api/charts';

// Replaces c3.js/d3 (fed a c3.generate() config directly from the API
// response) with recharts - the /chart/:chartType response shape itself
// (a {x, json, names} column-oriented object) is unchanged, so this just
// reshapes it into the row-oriented array recharts expects.
function toRows(chartData) {
  const xKey = chartData.x;
  const keys = Object.keys(chartData.json);
  const length = chartData.json[xKey].length;
  const rows = [];
  for (let i = 0; i < length; i++) {
    const row = {};
    keys.forEach((k) => {
      row[k] = chartData.json[k][i];
    });
    rows.push(row);
  }
  return rows;
}

export default function Charts() {
  const {t} = useTranslation();
  const {chartType} = useParams();
  const [charts, setCharts] = useState({});
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCharts().then((res) => setCharts(res.charts));
  }, []);

  useEffect(() => {
    if (!chartType) {
      setChart(null);
      return;
    }
    setLoading(true);
    getChart(chartType).then((c) => {
      setLoading(false);
      setChart(c);
    });
  }, [chartType]);

  const rows = chart ? toRows(chart.data) : [];
  const dataKeys = chart ? Object.keys(chart.data.json).filter((k) => k !== chart.data.x) : [];

  return (
    <section>
      <div className="row">
        <div className="col-xs-12 col-md-3 col-gray col-gray-fixed">
          <div className="block-id">
            <div className="icon-block text-center">
              <span className="glyphicon glyphicon-stats" />
              <h3>
                <span>{t('Charts')}</span>
              </h3>
            </div>
          </div>
          <div className="m20v text-center">
            {Object.entries(charts).map(([type, c]) => (
              <span className="fader" key={type}>
                <Link className="btn btn-primary" style={{marginBottom: 3}} to={'/charts/' + type}>
                  {c.name}
                </Link>
              </span>
            ))}
          </div>
        </div>
        <div className="col-xs-12 col-md-9">
          <div className="page-header">
            <h1>
              <span>{chart ? chart.name : ''}</span>
            </h1>
          </div>
          {loading && (
            <div>
              <span>{t('Loading chart...')}</span> <span className="loader-gif" />
            </div>
          )}
          {!loading && chart && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chart.data.x} />
                <YAxis />
                <Tooltip />
                {dataKeys.map((k) => (
                  <Line key={k} type="monotone" dataKey={k} name={chart.data.names[k]} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
