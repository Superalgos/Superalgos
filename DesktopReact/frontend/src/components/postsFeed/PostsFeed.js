import './PostsFeed.css';
import React from 'react';
import {Stack} from "@mui/material";
import Post from "../post/Post";

const PostsFeed = () => {
    const postFeed = [1, 2, 3, 4, 5];

    const posts = postFeed.map(
        value => {
            return <Post key={value} id={value} name={`user${value}`}/>
        }
    )

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