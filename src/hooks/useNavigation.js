import { useState } from 'react';

export const useNavigation = () => {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [activeTab, setActiveTab] = useState('quotidien');
  
  const goToPrevious = () => {
    if (activeTab === 'mensuel') {
      setCurrentYear(prev => prev - 1);
    } else {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    }
  };
  
  const goToNext = () => {
    if (activeTab === 'mensuel') {
      setCurrentYear(prev => prev + 1);
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  };
  
  const goToPeriod = (year, month) => {
    setCurrentYear(year);
    if (month) setCurrentMonth(month);
    setActiveTab('quotidien');
  };
  
  return {
    currentYear,
    currentMonth,
    activeTab,
    setActiveTab,
    goToPrevious,
    goToNext,
    goToPeriod,
  };
};
