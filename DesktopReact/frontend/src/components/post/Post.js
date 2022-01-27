import "./Post.css"
import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux'
import {Avatar, Stack, Typography} from "@mui/material";
import pic from "../../images/superalgos.png"
import {useNavigate, useParams} from "react-router-dom";
import { getUserSocialPersona } from '../../api/profile.httpService'
import { setSocialPersona } from '../../store/slices/Profile.slice'
import PostFooter from "../postFooter/PostFooter";
import { setSelectedPost } from "../../store/slices/post.slice";

const Post = ({postData}) => {
    const {postId: postIdParameter} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const socialPersona = useSelector(state => state.profile.socialPersona);
    const [collapse, setCollapse] = useState(true);
    const ToggleCollapse = () => setCollapse(!collapse);
    console.log(postData)

    const {
        originSocialPersonaId,
        postText,
        reactions,
        originPostHash
    } = postData;

    const {
        userProfileHandle
    } = socialPersona

    useEffect( async () => {
        if(!socialPersona.userProfileId) {
            const userSocialPersona = await getUserSocialPersona().then(response => response.json())
            dispatch( setSocialPersona(userSocialPersona) );
        }
    },[])

    const handlePostClick = (e) => {
        if (postIdParameter !== originPostHash) {
            e.preventDefault()
            navigate(`/post?post=${originPostHash}&user=${originSocialPersonaId}`) //todo implement reply feed
        }
    }

    return (
        <div className="postWrapper">
            <div className="post">
                {/* TODO remove stacks inside of stacks*/}
                <Stack direction="row" onClick={handlePostClick} stateCallback={ToggleCollapse}>
                    <div className="postAvatarContainer">
                        <Avatar src={pic} className="avatar"/>
                    </div>
                    <Typography className="postUserName">
                        {userProfileHandle} {/* TODO use name */}
                    </Typography>
                </Stack>
                <div className="postBody">
                    {postText ? postText.toString() : ''}
                </div>
                <PostFooter postData={postData} postId={originPostHash} reactions={reactions} actualReaction={reactions}/>
            </div>
        </div>
    );
};

export default Post;
