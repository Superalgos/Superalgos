import "./PostFooter.css"
import React, {useEffect, useState} from 'react';
import {IconButton, SpeedDial, SpeedDialAction, Stack} from "@mui/material";
import Badge from "@mui/material/Badge";
import {
    AccessibilityNewOutlined,
    FavoriteBorder,
    MessageOutlined,
    Mood,
    OutletOutlined,
    SentimentVeryDissatisfied,
    SentimentVeryDissatisfiedOutlined,
    ThumbUp
} from "@mui/icons-material";
import styled from "@emotion/styled";
import {actionsNav} from './interactionsConfig.json';
import FooterReplyModal from "../FooterReplyModal/FooterReplyModal";
import {dialStyle} from "./reactionsStyle";
import {reactedPost} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import {useDispatch} from "react-redux";
import {setModalPost} from "../../store/slices/post.slice";

// todo need proper style, and handle from css file
const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: -4,
        padding: '0 4px',
    },
}));

const PostFooter = ({postId, reactions, actualReaction, postData}) => { // props needed? review
    //console.log(actualReaction)

    // gets values from httpService.js array reactToPost function
    const [badgeValues, setBadgeValues] = useState([])
    const [likeBadgeValue, setLikeBadgeValue] = useState()
    const [replyModal, setReplyModal] = useState(false)
    const dispatch = useDispatch();
    const BadgeCounterValue = () => {
        setLikeBadgeValue(reactions[0][1]) // need an callback
        let reactionsValue = reactions.filter((item) => item[0] !== 0).map(([i,k]) => [i,k]);
        setBadgeValues(reactionsValue)

    }

    useEffect(() => {
        return BadgeCounterValue();
    }, []);

    const handleRepost = (e) => { // not implemented yet
        e.stopPropagation();
        console.log('clicked repost')
    }

    const HandleCommentContainer = () => {
        setReplyModal(!replyModal);
        dispatch(setModalPost(postData))
    }


    const handleReactions = async (e, id, name) => {
        e.stopPropagation();
        let {result} = await reactedPost({eventType: 100 + (+id), postId}).then(response => response.json());
        if (result === STATUS_OK) {
            console.log(`correctly reacted with ${name}`)
        }
        //console.log(`click on button ${name}, id ${id}`)
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
            FabProps={{style: {...dialStyle}}} /*Changes the position of the reactions icons, but not the div container*/
            icon={
                <StyledBadge
                    badgeContent={badgeCounter} /*need pass the index of the id reaction*/
                    color="primary"
                    max={99}>
                    {getIcon(icon)}
                </StyledBadge>
            }
            onClick={ev => handleReactions(ev, id, name)}
            tooltipPlacement="bottom"
            tooltipTitle={name}
        />
    }

    const FooterComponent = () => {
        return <div className="footerCommentContainer">
            <Stack className="postFooterComment" direction="row">
                <IconButton className="commentIconButton" size="small"
                            onClick={(e) => e.stopPropagation(HandleCommentContainer)}> {/* need review, correct way?*/}
                    <MessageOutlined/>
                </IconButton>
                {replyModal ? <FooterReplyModal show={replyModal} close={HandleCommentContainer}/>: null } {/* todo pass postData to the modal from props */}
            </Stack>
            {/*<Stack className="postFooterRepost" direction="row"> todo not implemented yet
                <IconButton className="repostIconButton" onClick={handleRepost} size="small">
                    <Autorenew/>
                </IconButton>
            </Stack>*/}
        </div>
    }

    return (
        <div className="postFooterContainer">
            <Stack className="postFooterContainerStack" direction="row">
                <Stack className="postFooterContainerSpeedDial" direction="row">
                    <SpeedDial
                        FabProps={{ /*Access to props of SpeedDial*/
                            style: {...dialStyle}
                        }}
                        color="secondary"
                        ariaLabel="SpeedDial"
                        icon={<StyledBadge
                            color="primary"
                            badgeContent={likeBadgeValue}>
                            <ThumbUp
                                color="action"
                                fontSize="small"
                                onClick={handleReactions}>
                            </ThumbUp>
                        </StyledBadge>}
                        direction="right">
                        {actionsNav.map(e => {
                            const {id, name, badgeCounter, icon} = e;
                            return FooterButton(String(id), name, icon, badgeCounter) /* todo need populate the reactions bar with the new array */
                        })}
                    </SpeedDial>
                </Stack>
                <FooterComponent/>
            </Stack>
        </div>
    );
};

export default PostFooter;