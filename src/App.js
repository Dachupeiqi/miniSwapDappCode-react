import logo from './logo.svg';
import './App.css';
import Content from './views/Content'
import { Provider } from 'react-redux';
import store from './redux/store'

function App() {
  return (
    <Provider store= {store}>
      <div>
      <Content></Content>
    </div>
    </Provider>
    
  );
}

export default App;
