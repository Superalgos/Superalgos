import "./PostFooter.css"
import React, {useEffect, useState} from 'react';
import {IconButton, SpeedDial, SpeedDialAction, Stack} from "@mui/material";
import Badge from "@mui/material/Badge";
import {
    AccessibilityNewOutlined,
    Autorenew,
    FavoriteBorder,
    MessageOutlined,
    Mood,
    OutletOutlined,
    SentimentVeryDissatisfied,
    SentimentVeryDissatisfiedOutlined,
    ThumbUp
} from "@mui/icons-material";
import styled from "@emotion/styled";
import {dialStyle} from "./reactionsStyle";
import {reactedPost} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import {useDispatch} from "react-redux";
import {setModalPost} from "../../store/slices/post.slice";
import FooterReplyModal from "../footerReplyModal/FooterReplyModal";

// todo need proper style, and handle from css file
const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
        right: -3,
        top: -4,
        padding: '0 4px',
    },
}));

/* TODO refactor this*/
const PostFooter = ({postId, reactions, actualReaction, postData}) => { // props needed? review
    const actionsNav = [
        {
            "id": 1,
            "name": "Love",
            "icon": "FavoriteBorder"
        },
        {
            "id": 2,
            "name": "Haha",
            "icon": "Mood"
        },
        {
            "id": 3,
            "name": "Wow",
            "icon": "OutletOutlined"
        },
        {
            "id": 4,
            "name": "Sad",
            "icon": "SentimentVeryDissatisfied"
        },
        {
            "id": 5,
            "name": "Angry",
            "icon": "SentimentVeryDissatisfiedOutlined"
        },
        {
            "id": 6,
            "name": "Care",
            "icon": "AccessibilityNewOutlined"
        }
    ]
    //console.log(actualReaction)

    // gets values from httpService.js array reactToPost function
    const [badgeValues, setBadgeValues] = useState([])
    const [likeBadgeValue, setLikeBadgeValue] = useState()
    const [replyModal, setReplyModal] = useState(false)
    const [speedDialIsOpened, setSpeedDialIsOpened] = useState(false)
    // const dispatch = useDispatch();
    const BadgeCounterValue = () => {
        // setLikeBadgeValue(reactions[0][1]) // need an callback
        // let reactionsValue = reactions.filter((item) => item[0] !== 0).map(([i, k]) => [i, k]);
        // setBadgeValues(reactionsValue)

    }

    useEffect(() => {
        return BadgeCounterValue();
    }, []);

    const handleRepost = (e) => { // not implemented yet
        e.stopPropagation();
        console.log('clicked repost')
    }

    const HandleCommentContainer = (e) => {
        e.stopPropagation()
        setReplyModal(!replyModal);
        console.log("Hello from Comment")
        // dispatch(setModalPost(postData))
    }


    const handleReactions = async (e, id, name) => {
        e.stopPropagation();
        let {result} = await reactedPost({eventType: 100 + (+id), postId}).then(response => response.json());
        if (result === STATUS_OK) {
            console.log(`correctly reacted with ${name}`)
        }
        //console.log(`click on button ${name}, id ${id}`)
    }

    const toggle = () => {
        setSpeedDialIsOpened(!speedDialIsOpened);
    }

    const getIcon = (icon) => {
        switch (icon) {
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
            FabProps={{style: {...dialStyle}}}
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

    return (
        <div className="postFooterContainer">
                <div className="postFooterContainerSpeedDial">
                    <SpeedDial
                        FabProps={{ /*Access to props of SpeedDial*/
                            style: {...dialStyle}
                        }}
                        onOpen={toggle}
                        onClose={toggle}
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
                        {speedDialIsOpened && (actionsNav.map(e => {
                                const {id, name, badgeCounter, icon} = e;
                                return FooterButton(String(id), name, icon, badgeCounter)
                            }))}
                    </SpeedDial>
                </div>
                <div className="footerCommentContainer">
                    <div className="postFooterComment">
                        <IconButton className="commentIconButton" size="small"
                                    onClick={HandleCommentContainer}>
                            <MessageOutlined/>
                        </IconButton>
                        {replyModal ?
                            <FooterReplyModal
                                post={postData}
                                show={replyModal}
                                close={HandleCommentContainer}/> : null} {/* todo pass postData to the modal from props */}
                    </div>
                    <div className="postFooterRepost"> {/*todo not implemented yet*/}
                        <IconButton className="repostIconButton" onClick={handleRepost} size="small">
                            <Autorenew/>
                        </IconButton>
                    </div>
                </div>
        </div>
    );
};

export default PostFooter;