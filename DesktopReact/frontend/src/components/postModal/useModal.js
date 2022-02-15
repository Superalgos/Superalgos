import React, {useState} from 'react';

// hook to handle the modal
const UseModal = () => {
    const [isShowing, setIsShowing] = useState(false);

    function toggle() {
        setIsShowing(!isShowing)
    }

    return (
        {isShowing, toggle,}


    );
};

export default UseModal;