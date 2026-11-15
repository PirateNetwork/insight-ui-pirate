import {useEffect, useRef, useState} from 'react';
import {useCurrency} from '../context/CurrencyContext';

// Header menu for the unit amounts are shown in. Open/close state lives
// here because the app loads Bootstrap's CSS but not its jQuery plugins,
// so Bootstrap's data-toggle="dropdown" attribute would do nothing.
export default function CurrencySelector() {
  const {symbol, options, setCurrency} = useCurrency();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <li className={'dropdown currency-selector' + (open ? ' open' : '')} ref={rootRef}>
      <button
        type="button"
        className="dropdown-toggle"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {symbol} <span className="caret" />
      </button>
      <ul className="dropdown-menu dropdown-menu-right" role="menu">
        {options.map((opt) => (
          <li key={opt} role="none">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={symbol === opt}
              className={symbol === opt ? 'active' : ''}
              onClick={() => {
                setCurrency(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </li>
  );
}
