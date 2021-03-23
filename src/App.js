import Scroller from './Scroller/Scroller';
import './App.scss';

function App() {
  return (
    <div className="App">
      <div id="header">
        <div className="site-name">
          Hacker Scroller
        </div>
        <div className="about">
          <a href="https://github.com/android2221/hacker-scroller">GitHub Project</a>
        </div>
      </div>
      <Scroller></Scroller>
    </div>
  );
}

export default App;
