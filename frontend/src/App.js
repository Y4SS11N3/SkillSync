import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Home from './pages/Home';
import AuthForm from './components/auth/AuthForm';
import ConditionalFooter from './components/Footer/ConditionalFooter';
import ConditionalHeader from './components/Header/ConditionalHeader';
import AuthCheck from './components/auth/AuthCheck';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthCheck />
        <div className="App flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <ConditionalHeader />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthForm />} />
              <Route path="/register" element={<AuthForm />} />
            </Routes>
          </main>
          <ConditionalFooter />
        </div>
      </Router>
    </Provider>
  );
}

export default App;