import {Route, Routes} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ConnectionBanner from './components/ConnectionBanner';
import {CurrencyProvider} from './context/CurrencyContext';
import {RecentActivityProvider} from './context/RecentActivityContext';
import Home from './pages/Home';
import Blocks from './pages/Blocks';
import BlockDetail from './pages/BlockDetail';
import BlockRedirect from './pages/BlockRedirect';
import Address from './pages/Address';
import Transaction from './pages/Transaction';
import SendRawTransaction from './pages/SendRawTransaction';
import Charts from './pages/Charts';
import Status from './pages/Status';
import Peers from './pages/Peers';
import Stats from './pages/Stats';
import MessagesVerify from './pages/MessagesVerify';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <CurrencyProvider>
      <RecentActivityProvider>
        <div id="wrap">
          <Header />
          <section className="container">
            <ConnectionBanner />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blocks" element={<Blocks />} />
              <Route path="/blocks-date/:blockDate" element={<Blocks />} />
              <Route path="/blocks-date/:blockDate/:startTimestamp" element={<Blocks />} />
              <Route path="/block/:blockHash" element={<BlockDetail />} />
              <Route path="/block-index/:blockHeight" element={<BlockRedirect />} />
              <Route path="/address/:addrStr" element={<Address />} />
              <Route path="/tx/send" element={<SendRawTransaction />} />
              <Route path="/tx/:txId" element={<Transaction />} />
              <Route path="/tx/:txId/:vType/:vIndex" element={<Transaction />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/charts/:chartType" element={<Charts />} />
              <Route path="/status" element={<Status />} />
              <Route path="/peers" element={<Peers />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/messages/verify" element={<MessagesVerify />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </section>
        </div>
        <Footer />
      </RecentActivityProvider>
    </CurrencyProvider>
  );
}
