import React from 'react';

const DomSwitch = ({test, children}) => {
    // filter out only children with a matching prop
    return children.find(child => {
        return child.props.value === test
    })
};



export default DomSwitch;
