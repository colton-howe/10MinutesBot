import { TimedUser } from "./TimedUser";

export class TimedUserList {
    public static allTimedUsers: TimedUser[] = [];

    public static addTimedUser(user: TimedUser){
        TimedUserList.allTimedUsers.push(user);
    }

    public static removeTimedUser(user: TimedUser){
        let i = TimedUserList.allTimedUsers.indexOf(user);
        if(i >= 0){
            TimedUserList.allTimedUsers.splice(i, 1);
        } else {
            console.log("Tried to remove user that was not in list: ", user);
        }
    }
}