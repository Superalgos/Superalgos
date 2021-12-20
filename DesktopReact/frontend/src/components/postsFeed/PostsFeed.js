import './PostsFeed.css';
import React, {useEffect, useState} from 'react';
import {Stack} from "@mui/material";
import Post from "../post/Post";
import {getPosts, STATUS_OK} from "../../api/httpService";

const PostsFeed = () => {
    const [posts, setPosts] = useState([]);

    const loadProfiles = async () => {
        let {data, result} = await getPosts().then(response => response.json());
        if (result === STATUS_OK) {
            let mappedPosts = data.map((post, index) => <Post key={index} id={index}
                                                              userName={post.emitterUserProfile.userProfileHandle}
                                                              postBody={post.postText}/>
            );
            setPosts(mappedPosts);
        }
    }

    useEffect(() => {
        return loadProfiles();
    }, []);


    return (
        <div className="postFeedContainer">
            <Stack direction="column"
                   spacing={2}>
                {posts}
            </Stack>
        </div>
    );
};

export default PostsFeed;