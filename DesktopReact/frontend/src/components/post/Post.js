import "./Post.css"
import React, {useState} from 'react';
import {Avatar, Card, Stack} from "@mui/material";
import pic from "../../images/superalgos.png"
import PostFooter from "../PostFooter/PostFooter";
import FooterReply from "../FooterReply/FooterReply";

const Post = ({userName, postBody}) => {

    const [collapse, setCollapse] = useState(true)
    const Toggle = () => setCollapse(!collapse)

    return (
        <div className="postWrapper" onClick={(e) => {
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
                <PostFooter/>
                {/*<Collapse in={collapse}> /!*TODO needs to listen to HandleCommentContainer function's state in PostFooter.js *!/*/}
                {/*    <Divider />*/}
                {/*    <FooterReply/>*/}
                {/*</Collapse>*/}
                {/*<Collapse in={true}> /!*TODO needs to listen to HandleCommentContainer function's state in PostFooter.js *!/*/}
                {/*    <Divider />*/}
                {/*    <FooterReply/>*/}
                {/*</Collapse>*/}
                <FooterReply show={collapse}/>
            </Card></div>
    );
};

export default Post;
