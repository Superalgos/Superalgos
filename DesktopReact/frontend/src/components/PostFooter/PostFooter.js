import "./PostFooter.css"
import React, {useEffect, useState} from 'react';
import {Collapse, createTheme, Divider, IconButton, SpeedDial, SpeedDialAction, Stack} from "@mui/material";
import Badge from "@mui/material/Badge";
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
import FooterReply from "../FooterReply/FooterReply";
import {actionsNav} from './interactionsConfig.json';

const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: -4,
        padding: '0 4px',
    },
}));

const PostFooter = () => {
    const [isCollapse, setIsCollapse] = useState(false) // todo comment collapse function to listen the onClick
    const [isToggled, setIsToggled] = useState(); // TODO handle the reaction icons, if one pressed set it true and the others to false.
    const dialStyle = {
        backgroundColor: "white", 
        minHeight: "2rem", 
        height: "2rem", 
        width: "2rem",
        position: "relative",
        boxShadow: "none"
    }
    const footerButtonStyle = {
        ...dialStyle,
        minWidth: "2rem",
        backgroundColor:'transparent'
    }
    let badgeCounterValue = 1; // todo hardcoded values
    // const actionSpeedDialNav = [
    //     {id: 1, name: 'Love', icon: <FavoriteBorder/>, badgeCounter: badgeCounterValue},
    //     {id: 2, name: 'Haha', icon: <Mood/>, badgeCounter: badgeCounterValue},
    //     {id: 3, name: 'Wow', icon: <OutletOutlined/>, badgeCounter: badgeCounterValue},
    //     {id: 4, name: 'Sad', icon: <SentimentVeryDissatisfied/>, badgeCounter: badgeCounterValue},
    //     {id: 5, name: 'Angry', icon: <SentimentVeryDissatisfiedOutlined/>, badgeCounter: badgeCounterValue},
    //     {id: 6, name: 'Care', icon: <AccessibilityNewOutlined/>, badgeCounter: badgeCounterValue},
    // ];

    const handleRepost = () => {
        console.log('clicked repost')
    }

    const HandleCommentContainer = () => {
        setIsCollapse(isCollapse => !isCollapse)
        // console.log("Hello from handleCommentContainer func: ")
        // console.log(isCollapse)
        console.log("Click comment button: ")
        //FooterReply()

    }

    const handleClick = () => {
    }

    const handleReactions = (e, id, name) => {
        e.preventDefault()
        console.log(`click on button ${name}, id ${id}`)
        // changes the value of the stateReaction value to true, handled in back instead?
        // newArray = newArray.map(obj =>
        //     obj.name === name ? {
        //         id: obj.id, name: obj.name, icon: obj.icon, badgeCounter: obj.badgeCounter
        //     } : obj);

        // console.log("Hello from test: ")
        // console.log(newArray)
    }

    // let speedDialAction = actionSpeedDialNav.map(e => {
    //     return <SpeedDialAction
    //     id= {e.id}
    //         FabProps={{
    //             style:
    //                 {
    //                     minHeight: "2rem",
    //                     minWidth: "2rem",
    //                     height: "2rem",
    //                     width: "2rem",
    //                 } // Changes the position of the reactions icons, but not the div container
    //         }}
    //         icon= {
    //             <StyledBadge
    //                 badgeContent={e.badgeCounter}
    //                 color="primary"
    //                 max={99}>
    //                     {e.icon}
    //             </StyledBadge>
    //         }
    //         tooltipPlacement="bottom"
    //         tooltipTitle={e.name}
    //         onClick={ ev => handleReactions(ev, e.name, e.id) }
    //     />
    // });

    const getIcon = (icon) =>{
        //console.log(icon)
        switch(icon){
            case "FavoriteBorder":
                return <FavoriteBorder/>
            case "Mood":
                return <Mood/> 
            case "OutletOutlined":
                return <OutletOutlined/>
            case "SentimentVeryDissatisfied":
                return <SentimentVeryDissatisfied/>
            case "SentimentVeryDissatisfiedOutlined":
                return <SentimentVeryDissatisfiedOutlined/> 
            case "AccessibilityNewOutlined":
                return <AccessibilityNewOutlined/>
            default:
                return null
        }
    }
    
    const FooterButton = (id, name, icon, badgeCounter) => {
        return <SpeedDialAction
            id= {id}
            FabProps={{ style:{...footerButtonStyle} }} // Changes the position of the reactions icons, but not the div container
            icon= {
                <StyledBadge
                    badgeContent={badgeCounter}
                    color="primary"
                    max={99}>
                        { getIcon(icon) }
                </StyledBadge>
            }
            onClick={ ev => handleReactions(ev, id, name) }
            tooltipPlacement="bottom"
            tooltipTitle= {name}
        />
    }

    const FooterComponent = () => {
        return <div className="footerCommentContainer">
            <Stack className="postFooterComment" direction="row">
                <IconButton className="commentIconButton" size="small"
                    onClick={() => HandleCommentContainer()} >
                        <MessageOutlined/>
                    </IconButton>
                </Stack>
                <Stack className="postFooterRepost" direction="row">
                <IconButton className="repostIconButton" onClick={handleRepost} size="small">
                    <Autorenew/>
                </IconButton>
            </Stack>
        </div>
    }

    return (
        <div className="postFooterContainer">
            <Stack className="postFooterContainerStack" direction="row">
                <Stack className="postFooterContainerSpeedDial" direction="row">
                    <SpeedDial
                        FabProps={{
                            style: {...dialStyle}
                        }} // Access to the props of SpeedDial
                        color="secondary"
                        ariaLabel="SpeedDial"
                        icon={<StyledBadge
                            color="primary"
                            badgeContent={badgeCounterValue}>
                            <ThumbUp //sx={{width: "15px", height: "15px"}}
                                color="action"
                                fontSize="small"
                                onClick={handleClick}>
                            </ThumbUp>
                        </StyledBadge>}
                        direction="right"
                    >
                        { actionsNav.map(e => {
                            const {id, name, badgeCounter, icon} = e 
                            return FooterButton(id, name, icon, badgeCounter)
                        })}
                    </SpeedDial>
                </Stack>
                <FooterComponent/>
            </Stack>
        </div>
    );
};

export default PostFooter;