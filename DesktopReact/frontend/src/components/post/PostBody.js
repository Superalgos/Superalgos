import "./Post.css"
import React from 'react';
import {Avatar, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"
import {useNavigate, useParams} from "react-router-dom";

const Post = ({postData}) => {
    const {postId: postIdParameter} = useParams();
    const navigate = useNavigate();

    const {
        postText,
        originPostHash,
        reactions,
        postType,
        repliesCount,
        creator: {
            name,
            username,
            profilePic,
            originSocialPersonaId
        }
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
                <div className="grid-container">
                    <div className="postHeader">
                        <Typography className="postName">
                            {name ? name : 'userProfileHandle'}
                        </Typography>
                        <Typography className="postUserName">
                            @{username ? username : 'userProfileHandle'}
                        </Typography>
                    </div>
                    <div className="postAvatar">
                        <div className="postAvatarContainer">
                            <Avatar src={profilePic || pic} className="avatar"/>
                        </div>
                    </div>
                    <div className="postBodyContainer">
                        <div className="postBody">
                            {postText ? postText.toString() : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;