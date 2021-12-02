import './Logo.css';
import React from 'react';
import {Avatar, Stack} from "@mui/material";
import pic from "../../images/superalgos.png"


const Logo = props => {
    /* TODO add on click redirect to / */
    return (
        <Stack direction="row" className="logo">
            <Avatar className="icon" alt="SuperAlgos" src={pic}/>
            <div>SuperAlgos</div>
        </Stack>
    );
};

export default Logo;
