import React from 'react';

 /*temporal style sheet*/
const dialStyle = {
    backgroundColor: "white",
    minHeight: "2rem",
    height: "2rem",
    width: "2rem",
    position: "relative",
    boxShadow: "none",
    margin: "2px",
}
const footerButtonStyle = {
    ...dialStyle,
    minWidth: "2rem",
    backgroundColor: 'transparent'

};

export {dialStyle, footerButtonStyle};