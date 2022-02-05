import './Logo.css';
import React from 'react';
import {Avatar, Link} from "@mui/material";
import pic from "../../images/superalgos.png"


const Logo = props => {
    return (
        <div className="logo">
            <Link className="linkLogo" href="https://superalgos.org/" underline="none" color="inherit">
                <Avatar className="icon" alt="SuperAlgos" src={pic}/>
                <div>SuperAlgos</div>
            </Link>
        </div>
    );
};

export default Logo;
