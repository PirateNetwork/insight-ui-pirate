import {fireEvent, render, screen} from '@testing-library/react';
import {vi} from 'vitest';
import CurrencySelector from './CurrencySelector';
import {CurrencyProvider} from '../context/CurrencyContext';

vi.mock('../api/currency', () => ({
  getCurrency: () => Promise.resolve({data: {bitstamp: 0.5}})
}));

function renderSelector() {
  return render(
    <CurrencyProvider>
      <ul>
        <CurrencySelector />
      </ul>
      <div data-testid="outside">outside</div>
    </CurrencyProvider>
  );
}

describe('CurrencySelector', () => {
  beforeEach(() => localStorage.clear());

  it('shows ARRR by default, closed', () => {
    renderSelector();
    const button = screen.getByRole('button', {name: /ARRR/});
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button.closest('li')).not.toHaveClass('open');
  });

  it('opens on click and lists USD, ARRR and mARRR', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', {name: /ARRR/}));
    expect(screen.getAllByRole('menuitemradio').map((el) => el.textContent)).toEqual(['USD', 'ARRR', 'mARRR']);
    expect(screen.getByRole('button', {name: /ARRR/, expanded: true}).closest('li')).toHaveClass('open');
  });

  it('selects a unit, saves it and closes', () => {
    renderSelector();
    fireEvent.click(screen.getByRole('button', {name: /ARRR/}));
    fireEvent.click(screen.getByRole('menuitemradio', {name: 'mARRR'}));
    expect(localStorage.getItem('insight-currency')).toBe('mARRR');
    const button = screen.getByRole('button', {name: /mARRR/});
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on an outside click and on Escape', () => {
    renderSelector();
    const button = screen.getByRole('button', {name: /ARRR/});
    fireEvent.click(button);
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('migrates a saved PIRATE choice to ARRR', () => {
    localStorage.setItem('insight-currency', 'mPIRATE');
    renderSelector();
    expect(screen.getByRole('button', {name: /mARRR/})).toBeInTheDocument();
  });
});
