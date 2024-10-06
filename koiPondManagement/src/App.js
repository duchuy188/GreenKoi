import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Blog from './components/page/Blog/Blog';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/blog/:id" component={Blog} />
        {/* Các routes khác */}
      </Switch>
    </Router>
  );
}

export default App;