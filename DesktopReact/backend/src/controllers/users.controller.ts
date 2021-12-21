import * as express from 'express';
import { UserService } from '../services/user.service';
 
export class UsersController {

  public path = '/users';
  public router = express.Router();
  private userService;
 
  constructor(SA, webAppInterface) {
    this.intializeRoutes(),
    this.userService = new UserService(SA,webAppInterface);
  }
 
  public intializeRoutes() {
    this.router.get(this.path + '/profiles', this.getAllProfiles);
    this.router.post(this.path + '/follow', this.postFollow);
    this.router.post(this.path + '/unFollow', this.postFollow);
  }
 
  getAllProfiles = (request, response) => {
    response.send(this.userService.profiles());
  }

  postFollow  = (request, response) => {
    response.send(this.userService.whoToFollow());
  }

}
 