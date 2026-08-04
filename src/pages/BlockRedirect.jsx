import {useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {getBlockByHeight} from '../api/blocks';

export default function BlockRedirect() {
  const {t} = useTranslation();
  const {blockHeight} = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getBlockByHeight(blockHeight)
      .then((res) => navigate('/block/' + res.blockHash, {replace: true}))
      .catch(() => navigate('/', {replace: true}));
  }, [blockHeight, navigate]);

  return <div className="text-center">{t('Redirecting...')}</div>;
}
