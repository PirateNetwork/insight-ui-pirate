import {render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom';
import {vi} from 'vitest';
import '../i18n';
import Charts from './Charts';
import {getChart, getCharts} from '../api/charts';

vi.mock('../api/charts', () => ({
  getCharts: vi.fn(),
  getChart: vi.fn()
}));

const CHART_LIST = {
  charts: {
    'block-size': {name: 'Block Size'},
    difficulty: {name: 'Difficulty'}
  }
};

function Where() {
  return <div data-testid="where">{useLocation().pathname}</div>;
}

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/charts" element={<Charts />} />
        <Route path="/charts/:chartType" element={<Charts />} />
      </Routes>
      <Where />
    </MemoryRouter>
  );
}

describe('Charts page', () => {
  beforeEach(() => {
    getCharts.mockResolvedValue(CHART_LIST);
    getChart.mockResolvedValue({
      name: 'Block Size',
      data: {x: 'height', json: {height: [1, 2], size: [100, 200]}, names: {height: 'Height', size: 'Block size'}}
    });
  });

  it('opens the first chart instead of an empty page', async () => {
    renderAt('/charts');
    // Generous timeout: the redirect waits on the chart list, which can be
    // slow to settle when the whole suite runs in parallel.
    await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent('/charts/block-size'), {timeout: 5000});
    // The chart request fires from an effect after the redirect renders.
    await waitFor(() => expect(getChart).toHaveBeenCalledWith('block-size'), {timeout: 5000});
  });

  it('lists every chart in the sidebar and marks the open one', async () => {
    renderAt('/charts/difficulty');
    const link = await screen.findByRole('link', {name: 'Difficulty'});
    expect(link).toHaveClass('active');
    expect(screen.getByRole('link', {name: 'Block Size'})).not.toHaveClass('active');
  });

  it('shows a readable message when a chart fails to load', async () => {
    getChart.mockRejectedValue(new SyntaxError('Unexpected token C in JSON'));
    renderAt('/charts/block-size');
    expect(await screen.findByText(/Unable to load this chart right now/)).toBeInTheDocument();
    expect(screen.queryByText(/Unexpected token/)).not.toBeInTheDocument();
  });

  it('reports a failed chart list separately from the chart itself', async () => {
    getCharts.mockRejectedValue(new Error('down'));
    renderAt('/charts/block-size');
    expect(await screen.findByText(/Unable to load the list of charts/)).toBeInTheDocument();
    expect(screen.queryByText(/Unable to load this chart/)).not.toBeInTheDocument();
  });
});
