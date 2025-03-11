import './App.css';
import { Create } from './components/create/create';
import { OpenMe } from './components/create/enter';
import { Show } from './components/create/show';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/create" element={<Create />} />
        <Route path="/" element={<Create />} />
        <Route path="/open" element={<OpenMe />} />
        <Route path="/show" element={<Show />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;