import "./Post.css"
import React, {useEffect, useState} from 'react';
import {Avatar, Stack} from "@mui/material";
import pic from "../../images/superalgos.png"
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux'
import {setSelectedPost} from '../../store/slices/post.slice'
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
            <div className="post">
                {/* TODO remove stacks inside of stacks*/}
                <Stack direction="row" onClick={handlePostClick} stateCallback={ToggleCollapse}>
                    <div className="postAvatarContainer">
                        <Avatar src={pic}/>
                    </div>
                    <div className="postUserName">
                        {originSocialPersonaId}
                    </div>
                </Stack>
                <div className="postBody">
                    {postText ? postText.toString() : ''}
                </div>
                <PostFooter postId={originPostHash} reactions={reactions} actualReaction={reactions}/>
            </div>
        </div>
    );
};

export default Post;
