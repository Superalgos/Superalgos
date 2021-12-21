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
import {toString} from "ip";
import {reactToPost, STATUS_OK} from "../../api/httpService";

const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: -4,
        padding: '0 4px',
    },
}));

const PostFooter = (props) => {
    //console.log(props)
    //const [isCollapse, setIsCollapse] = useState(false) // todo comment collapse function to listen the onClick
    //const [isToggled, setIsToggled] = useState(); // TODO handle the reaction icons, if one pressed set it true and the others to false.
    const [onHover, setOnHover] = useState(false)
    const onHoverMouse = () => { // added onHover func to comment button, to hide it on reaction overmouse. Needed?
        setOnHover(!onHover)
    }

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
        backgroundColor:'transparent'
    }
    //let badgeCounterValue = 1; // todo hardcoded values

    // gets values from httpService.js array reactToPost function
    const [badgeValues, setBadgeValues] = useState([])
    const BadgeCounterValue = async () => {
        let {data, result} = reactToPost();
        console.log(result);
        if (result === STATUS_OK){
            console.log("Hello from badge counter: ");
            //setBadgeValues(data);
            data.map(el => {

            })

        }
    }
    useEffect(() => {
        return null; //BadgeCounterValue();
    }, []);

    const handleRepost = () => {
        console.log('clicked repost')
    }

    const HandleCommentContainer = () => {
        const {stateCallback} = props
        stateCallback && stateCallback()
    }

    const handleLikeReaction = (id, name) => {
        console.log(`click on button ${name}, id ${id}`)
    }

    const handleReactions = (e, id, name) => {
        e.preventDefault()
        console.log(`click on button ${name}, id ${id}`)
    }

    const getIcon = (icon) =>{
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
            key={id}
            id={id}
            FabProps={{ style:{...footerButtonStyle} }} // Changes the position of the reactions icons, but not the div container
            icon={
                <StyledBadge
                    badgeContent={badgeCounter}
                    color="primary"
                    max={99}>
                        { getIcon(icon) }
                </StyledBadge>
            }
            onClick={ ev => handleReactions(ev, id, name) }
            tooltipPlacement="bottom"
            tooltipTitle={name}
        />
    }

    const FooterComponent = () => {
        return <div className="footerCommentContainer">
            <Stack className="postFooterComment" direction="row">
                <IconButton className="commentIconButton" size="small"
                            //disabled={onHover}
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
                        //onOpen={onHoverMouse}
                        //onClose={onHoverMouse}
                        icon={<StyledBadge
                            color="primary"
                            badgeContent={badgeValues}>
                            <ThumbUp //sx={{width: "15px", height: "15px"}}
                                color="action"
                                fontSize="small"
                                onClick={handleLikeReaction}>
                            </ThumbUp>
                        </StyledBadge>}
                        direction="right"
                    >
                        { actionsNav.map(e => {
                            const {id, name, badgeCounter, icon} = e
                            return FooterButton(String(id), name, icon, badgeCounter)
                        })}
                    </SpeedDial>
                </Stack>
                <FooterComponent/>
            </Stack>
        </div>
    );
};

export default PostFooter;