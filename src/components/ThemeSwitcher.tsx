import React, { useState } from 'react';

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('umg-theme') || 'azul');

  const switchTheme = (newTheme: string) => {
    localStorage.setItem('umg-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setCurrentTheme(newTheme);
  };

  return (
    <div className="theme-switcher" style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 999,
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(12px)',
      padding: '6px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    }}>
      <button 
        className={`theme-btn theme-btn-azul ${currentTheme === 'azul' ? 'active' : ''}`}
        onClick={() => switchTheme('azul')}
        title="Tema Azul"
      />
      <button 
        className={`theme-btn theme-btn-rojo ${currentTheme === 'rojo' ? 'active' : ''}`}
        onClick={() => switchTheme('rojo')}
        title="Tema Rojo"
      />
    </div>
  );
};

export default ThemeSwitcher;
