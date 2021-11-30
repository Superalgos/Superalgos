import React, {useEffect} from 'react';
import {useNavigate} from "react-router-dom";

const NotFound = () => {
    let navigate = useNavigate();
    useEffect(() => navigate("/"), [navigate])
    return null;
};

export default NotFound;
