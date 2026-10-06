import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import '../styles/App.css';
import Dashboard from './Dashboard';
import AddProfile from './AddProfile';
import Analytics from './Analytics';
import Settings from './Settings';
import Header from './Header';
