import "./Post.css"
import React, {useState} from 'react';
import {useDispatch} from 'react-redux'
import {Avatar, Stack, Typography} from "@mui/material";
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
            userName,
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
                <Stack direction="row" onClick={handlePostClick}>
                    <div className="postAvatarContainer">
                        <Avatar src={profilePic || pic} className="avatar"/>
                    </div>
                    <Typography className="postUserName">
                        {name ? name : 'userProfileHandle'}
                    </Typography>
                </Stack>
                <div className="postBody">
                    {postText ? postText.toString() : ''}
                </div>
                <PostFooter postData={postData} postId={originPostHash} reactions={reactions}
                            actualReaction={reactions}/>
            </div>
        </div>
    );
};

export default Post;
