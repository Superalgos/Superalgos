import React from 'react'
import Badge from "@mui/material/Badge";
import {SpeedDialAction} from "@mui/material";
import {FavoriteBorder} from "@mui/icons-material";
import styled from "@emotion/styled";

const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: -4,
        padding: '0 4px',
    },
}));

// todo entire complement not implemented yet, destructuring needed from PostFooter.js
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
        icon={
            <StyledBadge badgeContent={1} color="primary" max={99}>
                <FavoriteBorder/>
            </StyledBadge>
        }
    />
export default FooterButton
