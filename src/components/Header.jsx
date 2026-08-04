import {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import SearchBox from './SearchBox';
import StatusBadge from './StatusBadge';
import CurrencySelector from './CurrencySelector';

const MENU = [
  {title: 'Blocks', link: '/blocks'},
  {title: 'Charts', link: '/charts'},
  {title: 'Status', link: '/status'}
];

export default function Header() {
  const {t} = useTranslation();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="navbar navbar-default navbar-fixed-top" role="navigation">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar" />
            <span className="icon-bar" />
            <span className="icon-bar" />
          </button>
          <Link className="insight navbar-brand" to="/" title="Explorer">
            <img id="brandImg" src="/img/logo.png" alt="Explorer" />
          </Link>
        </div>
        <div className={'navbar-collapse collapse' + (collapsed ? '' : ' in')}>
          <ul className="nav navbar-nav">
            {MENU.map((item) => (
              <li key={item.link} className={location.pathname.startsWith(item.link) ? 'active' : ''}>
                <Link to={item.link}>{t(item.title)}</Link>
              </li>
            ))}
          </ul>

          <span className="hidden-xs navbar-form navbar-left">
            <SearchBox />
          </span>

          <ul className="nav navbar-nav navbar-right">
            <li>
              <StatusBadge />
            </li>
            <CurrencySelector />
          </ul>
        </div>
      </div>
    </div>
  );
}
