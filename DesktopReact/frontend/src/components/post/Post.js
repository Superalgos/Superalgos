import "./Post.css"
import React, {useEffect, useState} from 'react';
import {Avatar, Card, Collapse, Stack, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"
import PostFooter from "../PostFooter/PostFooter";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux'
import {setSelectedPost} from '../../store/slices/post.slice'
import {ArrowBackOutlined} from "@mui/icons-material";

const Post = ({postData}) => {
    const {postId: postIdParameter} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectedPost = useSelector(state => state.post.selectedPost);
    const [post, setPost] = useState({});
    const [collapse, setCollapse] = useState();
    const ToggleCollapse = () => setCollapse(!collapse);

    useEffect(() => {
        if (postData) {
            setPost(postData);
            if (selectedPost) {
                dispatch(setSelectedPost({}));
            }
        } else {
            if (selectedPost)
                setPost(selectedPost);
        }
    }, [])

    if (!post.emitterUserProfile) {
        return <></>
    }

    const {
        emitterUserProfile: {userProfileHandle: userName},
        postText: postBody,
        eventId: postId,
        emitterPost: {reactions: reactions}
    } = post;

    const handlePostClick = (e) => {
        /*
                if (postIdParameter !== postId) {
                    e.preventDefault()
                    dispatch(setSelectedPost(postData))
                    navigate(`/post/${postId}`) //todo implement reply feed
                }

         */
    }
    return (
        <div className="postWrapper">
            <Collapse in={false}> {/* todo Not working, check state */}
                <div className="editProfileHeader">
                    <div className="editProfileCloseBtn">
                        <ArrowBackOutlined/> {/* todo need onClick to go back to home */}
                    </div>
                    <div className="editProfileHeaderTitleAndBtn">
                        <Typography className="editProfileTitle" variant="h5">
                            Back
                        </Typography>
                    </div>
                </div>
            </Collapse>
            <Card className="post">
                <Stack direction="row" onClick={handlePostClick} stateCallback={ToggleCollapse}>
                    <Stack className="postAvatarContainer">
                        <Avatar src={pic}/>
                    </Stack>
                    <Stack className="postUserName">
                        {userName}
                    </Stack>
                </Stack>
                <Stack className="postBody">
                    {postBody ? postBody.toString() : ''}
                </Stack>
                <PostFooter postId={postId} reactions={reactions} actualReaction={reactions}/>
            </Card></div>
    );
};

export default Post;
