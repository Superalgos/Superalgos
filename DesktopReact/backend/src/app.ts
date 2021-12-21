import * as express from 'express';
 
export class App {
  public app: any;
  public port: number;
 
  constructor(controllers, port) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
 
  private initializeMiddlewares() {
    this.app.use(express.json());
  }
 
  private initializeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`Desktop Backend listening on the port ${this.port}`);
    });
  }
}
 