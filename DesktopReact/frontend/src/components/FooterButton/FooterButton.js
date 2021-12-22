import React, {useEffect, useState} from 'react'
import Badge from "@mui/material/Badge";
import {Collapse, createTheme, Divider, IconButton, SpeedDial, SpeedDialAction, Stack} from "@mui/material";
import {
    AccessibilityNewOutlined,
    Autorenew,
    FavoriteBorder, MessageOutlined,
    Mood,
    OutletOutlined,
    SentimentVeryDissatisfied,
    SentimentVeryDissatisfiedOutlined,
    ThumbUp
} from "@mui/icons-material";
import styled from "@emotion/styled";
const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: -4,
        padding: '0 4px',
    },
}));


const FooterButton = () => 
    <SpeedDialAction
        FabProps={{
            style:
            {
                minHeight: "2rem",
                minWidth: "2rem",
                height: "2rem",
                width: "2rem",
            } // Changes the position of the reactions icons, but not the div container
        }}
        icon= {
            <StyledBadge badgeContent={1} color="primary" max={99}>
                <FavoriteBorder/>
            </StyledBadge>
        }
   />
export default FooterButton
