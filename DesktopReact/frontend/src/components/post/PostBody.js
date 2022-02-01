import "./Post.css"
import React from 'react';
import {Avatar, Stack, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"
import {useNavigate, useParams} from "react-router-dom";

const Post = ({postData}) => {
    const {postId: postIdParameter} = useParams();
    const navigate = useNavigate();

    const {
        originSocialPersonaId,
        postText,
        originPostHash
    } = postData;

    const handlePostClick = (e) => {
        if (postIdParameter !== originPostHash) {
            e.preventDefault()
            navigate(`/post?post=${originPostHash}&user=${originSocialPersonaId}`) //todo implement reply feed
        }
    }

    return (
        <div className="postWrapper">
            <div className="post">
                <Stack direction="row" onClick={handlePostClick}>
                    <div className="postAvatarContainer">
                        <Avatar src={pic} className="avatar"/>
                    </div>
                    <Typography className="postUserName">
                        {originSocialPersonaId} {/* TODO use name */}
                    </Typography>
                </Stack>
                <div className="postBody">
                    {postText ? postText.toString() : ''}
                </div>
            </div>
        </div>
    );
};

export default Post;