import {useEffect, useState} from 'react';
import {NavLink, useNavigate, useParams} from 'react-router-dom';
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
      // The API sends some series (mining revenue) as fixed-point strings.
      row[k] = Number(chartData.json[k][i]);
    });
    rows.push(row);
  }
  return rows;
}

// Colours for the SVG chart, matching the theme tokens in common.css
// (recharts takes them as attributes, where CSS variables don't apply).
const CHART_COLORS = {
  line: '#bb9645',
  grid: '#2b2d40',
  axis: '#a2a6ad',
  tooltipBg: '#1a1c2b',
  tooltipText: '#e9e6df'
};

const compactNumber = new Intl.NumberFormat('en', {notation: 'compact', maximumFractionDigits: 2});

export default function Charts() {
  const {t} = useTranslation();
  const {chartType} = useParams();
  const navigate = useNavigate();
  const [charts, setCharts] = useState({});
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listError, setListError] = useState(false);

  useEffect(() => {
    getCharts()
      .then((res) => setCharts(res.charts))
      .catch(() => setListError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // /charts on its own would be an empty page - open the first chart.
  useEffect(() => {
    const first = Object.keys(charts)[0];
    if (!chartType && first) navigate('/charts/' + first, {replace: true});
  }, [chartType, charts, navigate]);

  useEffect(() => {
    if (!chartType) {
      setChart(null);
      setError(null);
      return;
    }
    // Switching charts quickly must not let a slower, older response
    // replace the chart now selected.
    let current = true;
    setLoading(true);
    setError(null);
    setChart(null);
    getChart(chartType)
      .then((c) => {
        if (!current) return;
        setLoading(false);
        setChart(c);
      })
      .catch(() => {
        // The API's error bodies are plain text meant for logs, not
        // visitors, so show one readable message for any failure.
        if (!current) return;
        setLoading(false);
        setError(t('Unable to load this chart right now. Please try again in a few minutes.'));
      });
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType]);

  const rows = chart ? toRows(chart.data) : [];
  const dataKeys = chart ? Object.keys(chart.data.json).filter((k) => k !== chart.data.x) : [];

  return (
    <section>
      <div className="row">
        <aside className="col-xs-12 col-md-3">
          <div className="side-card">
            <h2 className="side-title">
              <span className="glyphicon glyphicon-stats" aria-hidden="true" /> {t('Charts')}
            </h2>
            <ul className="side-nav">
              {Object.entries(charts).map(([type, c]) => (
                <li key={type}>
                  <NavLink to={'/charts/' + type}>{c.name}</NavLink>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="col-xs-12 col-md-9">
          <div className="page-header">
            <h1>
              <span>{chart ? chart.name : t('Charts')}</span>{' '}
              <small>{t('last 24 hours')}</small>
            </h1>
          </div>
          {loading && (
            <div>
              <span>{t('Loading chart...')}</span> <span className="loader-gif" />
            </div>
          )}
          {listError && (
            <div className="alert alert-danger">
              {t('Unable to load the list of charts right now. Please try again in a few minutes.')}
            </div>
          )}
          {!loading && error && (
            <div className="alert alert-danger">{error}</div>
          )}
          {!loading && chart && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={rows} margin={{top: 10, right: 10, bottom: 0, left: 0}}>
                <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis
                  dataKey={chart.data.x}
                  stroke={CHART_COLORS.grid}
                  tick={{fill: CHART_COLORS.axis, fontSize: 12}}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  stroke={CHART_COLORS.grid}
                  tick={{fill: CHART_COLORS.axis, fontSize: 12}}
                  tickLine={false}
                  tickFormatter={(v) => compactNumber.format(v)}
                  domain={['auto', 'auto']}
                  width={56}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: CHART_COLORS.tooltipBg,
                    border: '1px solid ' + CHART_COLORS.grid,
                    borderRadius: 6,
                    color: CHART_COLORS.tooltipText
                  }}
                  labelStyle={{color: CHART_COLORS.axis}}
                  itemStyle={{color: CHART_COLORS.tooltipText}}
                  labelFormatter={(height) => t('Block') + ' ' + height}
                  cursor={{stroke: CHART_COLORS.grid}}
                />
                {dataKeys.map((k) => (
                  <Line
                    key={k}
                    type="monotone"
                    dataKey={k}
                    name={chart.data.names[k]}
                    stroke={CHART_COLORS.line}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
