import './PostsFeed.css';
import React, {useEffect, useState} from 'react';
import {Skeleton, Stack} from "@mui/material";
import Post from "../post/Post";
import {STATUS_OK} from "../../api/httpConfig";
import {getPosts} from "../../api/post.httpService";

const PostsFeed = () => {
    const skeletons = [
        <Skeleton variant="rectangular" width="100%" height="12rem"/>,
        <Skeleton variant="rectangular" width="100%" height="12rem"/>
    ]
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProfiles = async () => {
        setLoading(true)
        let {data, result} = await getPosts().then(response => response.json());
        if (result === STATUS_OK) {
            let mappedPosts = data.map((post, index) => <Post key={index} id={index}
                                                              postData={post}/>
            );
            setPosts(mappedPosts);
        }
        setLoading(false);
    }

    useEffect(() => {
        return loadProfiles();
    }, []);

    return (
        <div className="postFeedContainer">
            <Stack direction="column"
                   spacing={2}>
                {
                    loading ? (skeletons) : (posts)
                }
            </Stack>
        </div>
    );
};

export default PostsFeed;