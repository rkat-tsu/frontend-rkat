import React from 'react';
export default function ApplicationLogo(props) {
    return (
        <img src="/img/logo-full-tsu.svg" alt="Logo TSU" 
        style={{ width: '100px', height: 'auto' }} 
            {...props}
        />
    );
}
