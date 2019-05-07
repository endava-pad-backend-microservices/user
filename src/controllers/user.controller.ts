import { JsonController, Get } from "routing-controllers";

@JsonController()
export class UserController {
    constructor() {

    }

    @Get('/getOne')
    async test() {
        return {
            message: 'hello'
        }
    }

}