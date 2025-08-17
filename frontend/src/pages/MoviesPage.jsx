import React, { useState } from 'react';
import HomePage from './HomePage';

export default function MoviesPage(props) {
  // Alias of HomePage with movies tab active by default
  const [activeTab, setActiveTab] = useState('movies');
  return <HomePage {...props} activeTab={activeTab} setActiveTab={setActiveTab} />;
}
