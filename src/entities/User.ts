export class User {
    private id: number;
    private username: string;

    constructor(user: any){
        this.id = user.id;
        this.username = user.username;
    }

    public getID(){
        return this.id;
    }

    public getUsername(){
        return this.username;
    }
}