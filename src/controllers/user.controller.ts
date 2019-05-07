import { JsonController, Post, Body } from "routing-controllers";

@JsonController()
export class UserController {
    constructor() {

    }

    @Post('/getOne')
    async getOne(@Body() request: any) {

        if (request.user == 'admin' && request.password == 'secure123') 
        return {
            success: true,
            data: {
                userId: 1,
                userName: 'admin',
                firstName: 'Administrator',
                lastName: 'System',
                email: 'admin@endava.com',
                roles: [
                    'ADMIN'
                ]
            }
        }
        else 
        return {
            success:false,
            message: 'Invalid username or password'
        }
    }

}