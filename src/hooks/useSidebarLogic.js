import { useState, useEffect } from 'react';

export const useSidebarLogic = () => {
 const [isElectron, setIsElectron] = useState(false);

 useEffect(() => {
  setIsElectron(window.navigator.userAgent.toLowerCase().includes('electron'));
 }, []);

 return {
  isElectron
 };
};