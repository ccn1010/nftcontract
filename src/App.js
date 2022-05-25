import { BrowserRouter,
  Routes,
  Route, } from "react-router-dom";
import { ToggleContract, SchduleContract } from './pages';
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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
