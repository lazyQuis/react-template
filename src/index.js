import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { browserHistory, Router, Route, IndexRoute, applyRouterMiddleware } from 'react-router'
import createLogger from 'redux-logger';
import reducer from 'reducers';
import domready from 'domready';
import useScroll from 'react-router-scroll';

import 'assets/sass/styles';
import Scene from 'components/view/Scene';
import Stage from 'components/view/Stage';

const middlewares = [];
if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger());
}

const store = compose(applyMiddleware(...middlewares))(createStore)(reducer);

domready(() => {
  render((
    <Provider store={store}>
      <Router history={browserHistory} render={applyRouterMiddleware(useScroll())}>
        <Route path="/" component={Stage}>
          <IndexRoute component={Scene} jump="home" />
          <Route path="home" component={Scene} jump="/" />
        </Route>
      </Router>
    </Provider>
  ), document.getElementById('root'));
});
