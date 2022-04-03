import './PostsFeed.css';
import React from 'react';
import {Skeleton, Stack} from "@mui/material";

const PostsFeed = ({posts, loading}) => {
    const skeletons = [
        <Skeleton key={0} variant="rectangular" width="100%" height="12rem"/>,
        <Skeleton key={1} variant="rectangular" width="100%" height="12rem"/>
    ]

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