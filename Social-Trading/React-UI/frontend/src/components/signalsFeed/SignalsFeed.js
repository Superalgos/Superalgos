import './SignalsFeed.css';
import React from 'react';
import {Skeleton, Stack} from "@mui/material";

const SignalsFeed = ({signals, loading}) => {
    const skeletons = [
        <Skeleton key={0} variant="rectangular" width="100%" height="12rem"/>,
        <Skeleton key={1} variant="rectangular" width="100%" height="12rem"/>
    ]

    return (
        <div className="signalsFeedContainer">
            <Stack direction="column"
                   spacing={2}>
                {
                    loading ? (skeletons) : (signals)
                }
            </Stack>
        </div>
    );
};

export default SignalsFeed;