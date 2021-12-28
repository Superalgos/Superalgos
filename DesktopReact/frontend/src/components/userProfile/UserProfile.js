import "./UserProfile.css"
import React, {useEffect, useState} from 'react';
import UserProfileHeader from "../userProfileHeader/UserProfileHeader";
import {Stack} from "@mui/material";
import PostsFeed from "../postsFeed/PostsFeed";
import {getPosts} from "../../api/post.httpService";
import {STATUS_OK} from "../../api/httpConfig";
import Post from "../post/Post";

const UserProfile = () => {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const loadPosts = async () => {
        setLoading(true)
        let {
            data,
            result
        } = await getPosts({userId: '47755ece-7bb3-4624-8ab3-dacf97efa0ab'}).then(response => response.json());
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
        setLoading(false);
    }

    useEffect(() => {
        return loadPosts();
    }, []);
    let actualUser = 'Loui Molina';

    return (
        <Stack direction="column"
               justifyContent="flex-start"
               alignItems="center"
               spacing={1}
               className="middleSection">
            <UserProfileHeader actualUser={actualUser}/>
            <PostsFeed posts={posts} loading={loading}/>
        </Stack>
    );
};

export default UserProfile;
