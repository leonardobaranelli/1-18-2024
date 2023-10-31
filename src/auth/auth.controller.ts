import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {

  @Post('register')
  register(){
    return "register";
  }
  
  @Post('login')
  login(){
    return "login";
  }
}
