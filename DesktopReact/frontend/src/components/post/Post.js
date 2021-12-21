import "./Post.css"
import React, {useState} from 'react';
import {Avatar, Card, Stack} from "@mui/material";
import pic from "../../images/superalgos.png"
import PostFooter from "../PostFooter/PostFooter";
import FooterReply from "../FooterReply/FooterReply";

const Post = ({userName, postBody}) => {

    const [collapse, setCollapse] = useState(false)
    const ToggleCollapseComment = () => setCollapse(!collapse)

    return (
        <div className="postWrapper" onClick={(e) => { // TODO needs to handle onclick event in post
            e.stopPropagation()
            //console.log("Hello from clicked post: ")
        }}
        >
            <Card className="post">
                <Stack direction="row">
                    <Stack className="postAvatarContainer">
                        <Avatar src={pic}/>
                    </Stack>
                    <Stack className="postUserName">
                        {userName}
                    </Stack>
                </Stack>
                <Stack className="postBody">
                    {postBody}
                </Stack>
                <PostFooter stateCallback={ToggleCollapseComment}/>
                <FooterReply show={collapse}
                />
            </Card></div>
    );
};

export default Post;
