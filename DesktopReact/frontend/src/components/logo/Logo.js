import './Logo.css';
import React from 'react';
import {Avatar, Stack, Link} from "@mui/material";
import pic from "../../images/superalgos.png"


const Logo = props => {
    return (
        <Stack direction="row" className="logo">
            <Link className="linkLogo" href="https://superalgos.org/" underline="none" color="inherit">
                <Avatar className="icon" alt="SuperAlgos" src={pic}/>
                <div>SuperAlgos</div>
            </Link>
        </Stack>
    );
};

export default Logo;
