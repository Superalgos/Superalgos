import "./UserProfile.css"
import React, {useEffect, useState} from 'react';
import { useSelector } from 'react-redux'
import UserProfileHeader from "../userProfileHeader/UserProfileHeader";
import {Alert, Snackbar, Stack} from "@mui/material";
import PostsFeed from "../postsFeed/PostsFeed";
import {getPosts} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";

const UserProfile = () => {
    const [posts, setPosts] = useState([]);
    const [postLoading, setPostLoading] = useState(true);
    const [openSnack, setSnackOpen] = useState(false);
    const actualUser = useSelector(state => state.profile.actualUser)

    useEffect(() => {
        loadPosts();
    }, []);

    const drawPosts = (rawPosts) =>{
        const mappedPosts = rawPosts.map( (post, index) => {
            const postData = {
                postText: post.postText,
                originPostHash: post.originPostHash,
                originSocialPersonaId: post.originSocialPersonaId,
                reactions: post.reactions,
                postType: post.postType,
                repliesCount: post.repliesCount,
                creator: {
                    name: actualUser.name,
                    profilePic: actualUser.profilePic,
                    originSocialPersonaId: actualUser.nodeId
                }
            }
            return <Post key={post.originPostHash} id={post.originPostHash}
                         postData={postData}/>
        });
        setPosts(mappedPosts)
    }

    const loadPosts = async () => {
        setPostLoading(true)
        const { data, result } = await getPosts().then(response => response.json());
        if (result === STATUS_OK) {
            drawPosts(data);
        }
        setPostLoading(false);
    }

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackOpen(false);
    };

    return (<>
        <Stack direction="column"
               justifyContent="flex-start"
               alignItems="center"
               spacing={1}
               className="middleSection">
            <UserProfileHeader/>
            <PostsFeed posts={posts} loading={postLoading}/>
        </Stack>
        <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleSnackClose}>
            <Alert onClose={handleSnackClose} severity="info" sx={{width: '100%'}}>
                Changes might take up to 10 minutes to reflect
            </Alert>
        </Snackbar>
    </>);
};

export default UserProfile;
