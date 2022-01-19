import "./Post.css"
import React, {useEffect, useState} from 'react';
import {Avatar, Card, Collapse, Stack, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux'
import {setSelectedPost} from '../../store/slices/post.slice'
import {ArrowBackOutlined} from "@mui/icons-material";
import PostFooter from "../postFooter/PostFooter";


const Post = ({postData}) => {
    const {postId: postIdParameter} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectedPost = useSelector(state => state.post.selectedPost);
    const [post, setPost] = useState({});
    const [collapse, setCollapse] = useState(true);
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

    if (!post.originSocialPersonaId) {
        return <></>
    }

    const {
        originSocialPersonaId,
        postText,
        reactions,
        originPostHash
    } = post;

    const handlePostClick = (e) => {
        if (postIdParameter !== originPostHash) {
            e.preventDefault()
            dispatch(setSelectedPost(postData))
            navigate(`/post/${originPostHash}`) //todo implement reply feed
        }
    }

    return (
        <div className="postWrapper">
            <Card className="post">
                {/* TODO remove stacks inside of stacks*/}
                <Stack direction="row" onClick={handlePostClick} stateCallback={ToggleCollapse}>
                    <Stack className="postAvatarContainer">
                        <Avatar src={pic}/>
                    </Stack>
                    <Stack className="postUserName">
                        {originSocialPersonaId}
                    </Stack>
                </Stack>
                <Stack className="postBody">
                    {postText ? postText.toString() : ''}
                </Stack>
                <PostFooter postId={originPostHash} reactions={reactions} actualReaction={reactions}/>
            </Card>
        </div>
    );
};

export default Post;
