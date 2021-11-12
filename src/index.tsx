import React from 'react'
import ReactDOM from 'react-dom'
import { Toaster } from 'react-hot-toast';

import { App } from './components/App'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
  document.getElementById('root'),
)
