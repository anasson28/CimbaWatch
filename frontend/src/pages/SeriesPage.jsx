import React, { useState } from 'react';
import HomePage from './HomePage';

export default function SeriesPage(props) {
  // Alias of HomePage with series tab active by default
  const [activeTab, setActiveTab] = useState('series');
  return <HomePage {...props} activeTab={activeTab} setActiveTab={setActiveTab} />;
}
