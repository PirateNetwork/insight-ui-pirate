import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

export default function NotFound() {
  const {t} = useTranslation();
  return (
    <div className="jumbotron">
      <h1>Ooops!</h1>
      <h2 className="text-muted">{t('404 Page not found :(')}</h2>
      <p>
        <Link to="/" className="pull-right">
          {t('Go to home')}
        </Link>
      </p>
    </div>
  );
}
