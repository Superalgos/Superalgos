import "./Post.css"
import React, {useEffect, useState} from 'react';
import {Avatar, Card, Stack} from "@mui/material";
import pic from "../../images/superalgos.png"
import PostFooter from "../PostFooter/PostFooter";
import FooterReply from "../FooterReply/FooterReply";
import {useNavigate, useParams} from "react-router-dom";
import Store from '../../store/index';
import {useDispatch, useSelector} from 'react-redux'
import {setSelectedPost} from '../../store/slices/post.slice'


const Post = ({postData}) => {
    const {postId:postIdParameter} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectedPost = useSelector( state => state.post.selectedPost );
    const [post, setPost] = useState({});
    const [collapse, setCollapse] = useState(false);
    const ToggleCollapseComment = () => setCollapse(!collapse);

    useEffect( () => {
        if (postData){
            setPost(postData);
            if(selectedPost){
                dispatch( setSelectedPost({}) );
            }
        } else {
            if (selectedPost)
                setPost(selectedPost);
        };
    }, [])

    if(!post.emitterUserProfile) {
        return <></>
    }

    const {emitterUserProfile: {userProfileHandle: userName}, postText: postBody, eventId: postId, emitterPost: {reactions: reactions} } = post;

    const handlePostClick = (e) => {
        if(postIdParameter !== postId) {
            e.preventDefault()
            dispatch(setSelectedPost(postData))
            navigate(`/post/${postId}`) //todo implement reply feed
        }
    }

    return (
        <div className="postWrapper"
        >
            <Card className="post">
                <Stack direction="row" onClick={handlePostClick}>
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
                <PostFooter  postId={postId} reactions={reactions} stateCallback={ToggleCollapseComment}/>
                {/*<FooterReply show={collapse}/>*/}
            </Card></div>
    );
};

export default Post;
