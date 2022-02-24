import "./Post.css"
import React, {useState} from 'react';
import {useDispatch} from 'react-redux'
import {Avatar, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"
import {useNavigate, useParams} from "react-router-dom";
import PostFooter from "../postFooter/PostFooter";

const Post = ({postData}) => {
    const {postId: postIdParameter} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [collapse, setCollapse] = useState(true);
    const [postUser, setPostUser] = useState({})
    const ToggleCollapse = () => setCollapse(!collapse);


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
                    <div className="postHeader" onClick={handlePostClick}>
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
                    <div className="postBodyContainer" onClick={handlePostClick}>
                        <div className="postBody">
                            {postText ? postText.toString() : ''}
                        </div>
                    </div>
                    <div className="postFooter">
                        <PostFooter postData={postData} postId={originPostHash} reactions={reactions}
                                    actualReaction={reactions}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;
