import { BrowserRouter,
  Routes,
  Route, } from "react-router-dom";
import { ToggleContract, SchduleContract, Free } from './pages';
import './App.css';
import { ContractList } from './pages';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ContractList />} />
          <Route path="/toggle/:address" element={<ToggleContract />} />
          <Route path="/schedule/:address" element={<SchduleContract />} />
          <Route path="/free" element={<Free />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
