import React, { useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {

  const controlActuator = async (index, direction) => {
    try {
      const response = await axios.post('http://localhost:3001/control', {
        index: index,
        direction: direction,
      });
      console.log(response.data);
    } catch (error) {
      console.error('There was an error controlling the actuator!', error);
    }
  };

  useEffect(() => {
    axios.get('http://localhost:3001/testCors')
      .then(response => console.log(response.data))
      .catch(error => console.error('CORS test failed:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Actuator Control</h1>
        {['Forward', 'Backward'].map((direction, dirIdx) => (
          <div key={dirIdx}>
            {Array.from({ length: 4 }, (_, idx) => (
              <button
                key={idx}
                onClick={() => controlActuator(idx, direction.toLowerCase())}
              >
                Actuator {idx + 1} {direction}
              </button>
            ))}
          </div>
        ))}
      </header>
    </div>
  );
};

export default App;
