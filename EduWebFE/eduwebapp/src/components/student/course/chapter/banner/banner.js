import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react'; 
import './banner.css'; 

const Banner = ({ message,isSuccess }) => {
    return (
        <div className="alert-banner">
           {isSuccess ? (
                <CheckCircle  size={20} className="success-icon me-2" />
            ) : (
                <AlertTriangle size={20} className="alert-icon me-2" />
            )}
            <span>{message}</span>
        </div>
    );
};

export default Banner;
