import "./Post.css"
import React, {useState} from 'react';
import {Avatar, Card, Stack} from "@mui/material";
import pic from "../../images/superalgos.png"
import PostFooter from "../PostFooter/PostFooter";
import FooterReply from "../FooterReply/FooterReply";
import {useNavigate} from "react-router-dom";

const Post = ({postData}) => {
    const {emitterUserProfile: {userProfileHandle: userName}, postText: postBody, eventId: postId, emitterPost: {reactions: reactions} } = postData;
    let navigate = useNavigate()
    const [collapse, setCollapse] = useState(false)
    const ToggleCollapseComment = () => setCollapse(!collapse)

    const handlePostClick = (e) => {
      e.preventDefault()
        // navigate(`/post/${postId}`) todo implement reply feed
    }
    return (
        <div className="postWrapper" onClick={handlePostClick}
        >
            <Card className="post">
                <Stack direction="row">
                    <Stack className="postAvatarContainer">
                        <Avatar src={pic}/>
                    </Stack>
                    <Stack className="postUserName">
                        {userName}
                    </Stack>
                </Stack>
                <Stack className="postBody">
                    {postBody}
                </Stack>
                <PostFooter  reactions={reactions} stateCallback={ToggleCollapseComment}/>
                <FooterReply show={collapse}
                />
            </Card></div>
    );
};

export default Post;
