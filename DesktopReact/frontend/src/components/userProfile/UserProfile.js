import "./UserProfile.css"
import React, {useEffect, useState} from 'react';
import UserProfileHeader from "../userProfileHeader/UserProfileHeader";
import {Alert, Skeleton, Snackbar, Stack} from "@mui/material";
import PostsFeed from "../postsFeed/PostsFeed";
import {getPosts} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";
import {useParams} from "react-router-dom";
import {getProfile} from "../../api/profile.httpService";
import {useDispatch} from "react-redux";
import {setProfile} from "../../store/slices/Profile.slice";

const UserProfile = () => {
    let {userId} = useParams();

    const dispatch = useDispatch();
    const [posts, setPosts] = useState([]);
    const [postLoading, setPostLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const [openSnack, setSnackOpen] = useState(false);

    useEffect(() => {
        loadUser();
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setPostLoading(true)
        let queryParams = userId ? {userId: userId} : undefined;
        let {
            data, result
        } = await getPosts(queryParams).then(response => response.json());
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

    const loadUser = async () => {
        setProfileLoading(true);
        let queryParams /*= {userProfileId: undefined}*/;
        let {
            data, result
        } = await getProfile().then(response => response.json());
        console.log({data, result})
        if (result === STATUS_OK) {
            dispatch(setProfile(data))
        }
        setProfileLoading(false);
    }


    const updateProfileCallback = () => {
        setSnackOpen(true)
        setTimeout(() => loadUser(), 60000);
    };

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
            {profileLoading ? (<Skeleton variant="rectangular" width="100%" height="23rem"/>) : (
                <UserProfileHeader updateProfileCallback={updateProfileCallback}/>)}
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
