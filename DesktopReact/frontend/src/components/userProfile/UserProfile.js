import "./UserProfile.css"
import React, {useEffect, useState} from 'react';
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

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setPostLoading(true)
        // let queryParams = userId ? {userId: userId} : undefined;
        let {
            data, result
        } = await getPosts().then(response => response.json());
        if (result === STATUS_OK) {
            let mappedPosts = data.map((post, index) => {
                if (post.eventType !== 10) {
                    /* TODO add other post types*/
                    return;
                }
                return <Post key={index} id={index}
                             postData={post}/>
            });
            setPosts(mappedPosts);
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
