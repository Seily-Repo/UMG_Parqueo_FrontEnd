import React from 'react';

interface MessageBoxProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

const MessageBox = ({ isOpen, onClose, title, message, buttonText = "Continuar" }: MessageBoxProps) => {
  if (!isOpen) return null; // Si no está abierto, no renderiza nada

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onClose} style={styles.button}>{buttonText}</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    
  },
  button: {
    marginTop: '15px',
    padding: '8px 16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  
  }
};

export default MessageBox;
