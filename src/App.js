import { BrowserRouter,
  Routes, Link,
  Route, } from "react-router-dom";
import { ContractList, ToggleContract, SchduleContract, Free, Sniff } from './pages';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ul>
              <li><Link to="/sniff">SNIFF</Link></li>
              <li><Link to="/collections">MINT</Link></li>
              <li><Link to="/free">FREE MINT</Link></li>
            </ul>
          }>
          </Route>
          <Route path="/collections" element={<ContractList />} />
          <Route path="/toggle/:address" element={<ToggleContract />} />
          <Route path="/schedule/:address" element={<SchduleContract />} />
          <Route path="/free" element={<Free />} />
          <Route path="/sniff" element={<Sniff />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
