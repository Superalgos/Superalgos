import "./UserProfile.css"
import React, {useEffect, useState} from 'react';
import UserProfileHeader from "../userProfileHeader/UserProfileHeader";
import {Skeleton, Stack} from "@mui/material";
import PostsFeed from "../postsFeed/PostsFeed";
import {getPosts} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";
import {useParams} from "react-router-dom";
import {getProfile} from "../../api/profile.httpService";

const UserProfile = () => {
    let {userId} = useParams();

    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(undefined);
    const [postLoading, setPostLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);

    const loadPosts = async () => {
        setPostLoading(true)
        let queryParams = userId ? {userId: userId} : undefined;
        let {
            data,
            result
        } = await getPosts(queryParams).then(response => response.json());
        if (result === STATUS_OK) {
            let mappedPosts = data.map((post, index) => {
                    if (post.eventType !== 10) {
                        /* TODO add other post types*/
                        return;
                    }
                    return <Post key={index} id={index}
                                 postData={post}/>
                }
            );
            setPosts(mappedPosts);
        }
        setPostLoading(false);
    }

    const loadUser = async () => {
        setProfileLoading(true);
        let queryParams /*= {userProfileId: undefined}*/; /* TODO set query params as undefined if own profile*/
        let {
            data,
            result
        } = await getProfile().then(response => response.json());
        if (result === STATUS_OK) {
            console.log('user profile loaded')
            setUser(data);
        }
        setProfileLoading(false);
    }

    useEffect(() => {
        loadUser();
        loadPosts();
    }, []);

    const updateProfileCallback = () => {
        loadUser();
    };

    return (
        <Stack direction="column"
               justifyContent="flex-start"
               alignItems="center"
               spacing={1}
               className="middleSection">
            {
                profileLoading ?
                    (<Skeleton variant="rectangular" width="100%" height="23rem"/>) :
                    (<UserProfileHeader user={user} updateProfileCallback={updateProfileCallback}/>)
            }
            <PostsFeed posts={posts} loading={postLoading}/>
        </Stack>
    );
};

export default UserProfile;
