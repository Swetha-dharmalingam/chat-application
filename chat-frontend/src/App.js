// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Login from './components/Auth/Login';
// import Register from './components/Auth/Register';
// import ChatPage from './components/Chat/ChatPage';
// import { useAuth } from '../src/components/hooks/useAuth';
// import './App.css';

// function App() {
//   const { user } = useAuth();

//   return (
//     <div className="app">
//       <Routes>
//         <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
//         <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
//         <Route path="/" element={user ? <ChatPage /> : <Navigate to="/login" />} />
//       </Routes>
//     </div>
//   );
// }

// // export default App;
// import React from 'react';
// import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
// import Login from './components/Auth/Login';
// import Register from './components/Auth/Register';
// import ChatPage from './components/Chat/ChatPage';
// import { useAuth } from '../src/components/hooks/useAuth';
// import './App.css';

// function App() {
//   const { user } = useAuth();

//   return (
//     <Router>
//       <div className="app">
//         <Switch>
//           <Route path="/login">
//             {!user ? <Login /> : <Redirect to="/" />}
//           </Route>
//           <Route path="/register">
//             {!user ? <Register /> : <Redirect to="/" />}
//           </Route>
//           <Route exact path="/">
//             {user ? <ChatPage /> : <Redirect to="/login" />}
//           </Route>
//         </Switch>
//       </div>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatPage from './components/Chat/ChatPage';
import { useAuth } from '../src/components/hooks/useAuth';
import { AuthProvider } from '../src/components/context/AuthContext';
import { ChatProvider } from '../src/components/context/ChatContext';
import './App.css';

function AppWrapper() {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <AuthProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </AuthProvider>
    </MuiPickersUtilsProvider>
  );
}

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app">
        <Switch>
          <Route path="/login">
            {!user ? <Login /> : <Redirect to="/" />}
          </Route>
          <Route path="/register">
            {!user ? <Register /> : <Redirect to="/" />}
          </Route>
          <Route exact path="/">
            {user ? <ChatPage /> : <Redirect to="/login" />}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default AppWrapper;