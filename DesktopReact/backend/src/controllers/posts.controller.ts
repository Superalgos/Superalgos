import * as express from 'express';
import { PostService } from '../services/post.service';
 
export class PostsController {

  public path = '/posts';
  public router = express.Router();
  private postService;
 
  constructor(SA, webAppInterface) {
    this.intializeRoutes(),
    this.postService = new PostService(SA,webAppInterface);
  }
 
  public intializeRoutes() {
    this.router.get(this.path, this.postCreatePost);

  }
 
  postCreatePost = (req, res) => {
    res.send(this.postService.createPost(req.body));
  }
 
}
 