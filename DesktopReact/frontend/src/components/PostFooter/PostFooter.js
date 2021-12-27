import "./PostFooter.css"
import React, {useEffect, useState} from 'react';
import {SpeedDial, SpeedDialAction, Stack} from "@mui/material";
import Badge from "@mui/material/Badge";
import {
    AccessibilityNewOutlined,
    FavoriteBorder,
    Mood,
    OutletOutlined,
    SentimentVeryDissatisfied,
    SentimentVeryDissatisfiedOutlined,
    ThumbUp
} from "@mui/icons-material";
import styled from "@emotion/styled";
import {actionsNav} from './interactionsConfig.json';

// todo need proper style, and handle from css file
const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: -4,
        padding: '0 4px',
    },
}));

const PostFooter = ({postId,reactions}) => { // props needed? review

    // todo need proper style, and handle from css file
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

    // gets values from httpService.js array reactToPost function
    const [badgeValues, setBadgeValues] = useState([])
    const [likeValue, setLikeValue] = useState()
    const [replyModal, setReplyModal] = useState(false)

    const BadgeCounterValue = () => {
        setLikeValue(reactions[0][1]) // need an callback
        let reactionsValue = reactions.filter((item) => item[0] !== 0).map(([i,k]) => [i,k]);
        setBadgeValues(reactionsValue)

    }

    useEffect(() => {
        return BadgeCounterValue();
    }, []);

    const handleRepost = (e) => {
        e.stopPropagation();
        console.log('clicked repost')
    }

    const HandleCommentContainer = () => {
        // review, maybe not needed. Using other method to handle the button
        // const {stateCallback} = props
        // stateCallback && stateCallback()
        setReplyModal(!replyModal)
    }

    const handleLikeReaction = (e, reactionId, name) => {
        e.stopPropagation()

// TODO
        console.log(`click on button ${name}, id ${reactionId} of post ${postId}`)
    }

    const handleReactions = (e, id, name) => {
        e.stopPropagation()

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
        //     return <div className="footerCommentContainer">
        //         <Stack className="postFooterComment" direction="row">
        //             <IconButton className="commentIconButton" size="small"
        //                 onClick={(e) => e.stopPropagation(HandleCommentContainer())} > {/* need review, correct way?*/}
        //                     <MessageOutlined/>
        //                 </IconButton>
        //                 {/*<FooterReplyModal show={replyModal} close={HandleCommentContainer}/>*/}
        //             </Stack>
        //             <Stack className="postFooterRepost" direction="row">
        //             <IconButton className="repostIconButton" onClick={handleRepost} size="small">
        //                 <Autorenew/>
        //             </IconButton>
        //         </Stack>
        //     </div>
        return null;
    }

    return (
        <div className="postFooterContainer">
            <Stack className="postFooterContainerStack" direction="row">
                <Stack className="postFooterContainerSpeedDial" direction="row">
                    <SpeedDial className="speedDialContainer"
                        FabProps={{
                            style: {...dialStyle}
                        }} // Access to props of SpeedDial
                        color="secondary"
                        ariaLabel="SpeedDial"
                        icon={<StyledBadge
                            color="primary"
                            badgeContent={likeValue}>
                            <ThumbUp // sx={{width: "15px", height: "15px"}}  review if removed
                                color="action"
                                fontSize="small"
                                onClick={handleLikeReaction}>
                            </ThumbUp>
                        </StyledBadge>}
                        direction="right"
                    >
                        { actionsNav.map(e => {
                            const {id, name, badgeCounter, icon} = e
                            return FooterButton(String(id), name, icon, badgeValues[badgeCounter])
                        })}
                    </SpeedDial>
                </Stack>
                <FooterComponent/>
            </Stack>
        </div>
    );
};

export default PostFooter;