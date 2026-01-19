import type { ReactNode } from 'react';
import './Alert.css';

interface AlertProps {
  type: 'success' | 'error' | 'info';
  children: ReactNode;
}

const Alert = ({ type, children }: AlertProps) => {
  return (
    <div className={`alert alert-${type}`}>
      {children}
    </div>
  );
};

export default Alert;

