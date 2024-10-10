import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import store from './redux/store';
import { SidebarProvider } from './components/Sidebars/Sidebar';
import ConditionalSidebar from './components/Sidebars/ConditionalSidebar';
import Home from './pages/Home';
import AuthForm from './components/auth/AuthForm';
import ConditionalFooter from './components/Footer/ConditionalFooter';
import ConditionalHeader from './components/Header/ConditionalHeader';
import AuthCheck from './components/auth/AuthCheck';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';

// Initialize QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthCheck />
          <SidebarProvider>
            <div className="App flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
              <ConditionalHeader />
              <div className="flex flex-grow">
                <ConditionalSidebar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<AuthForm />} />
                    <Route path="/register" element={<AuthForm />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      } 
                    />
                  </Routes>
                </main>
              </div>
              <ConditionalFooter />
            </div>
          </SidebarProvider>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;