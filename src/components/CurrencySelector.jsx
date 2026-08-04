import {useCurrency} from '../context/CurrencyContext';

export default function CurrencySelector() {
  const {symbol, netSymbol, setCurrency} = useCurrency();
  const options = ['USD', netSymbol, 'm' + netSymbol, 'bits'];

  return (
    <li className="dropdown">
      <a className="dropdown-toggle" data-toggle="dropdown" href="#">
        {symbol} <span className="caret" />
      </a>
      <ul className="dropdown-menu">
        {options.map((opt) => (
          <li key={opt}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrency(opt);
              }}
              className={symbol === opt ? 'active' : ''}
            >
              {opt}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}
