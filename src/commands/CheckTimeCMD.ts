import {Command} from "./Command";
import {TimedUser} from "../entities/TimedUser";
import {TimedUserList} from "../entities/TimedUserList";

export class CheckTimeCMD implements Command {
    private NO_USER_FOUND_MSG = "Please declare a user after !time.";
    private NOT_TIMED_MSG = "User is not being timed yet.";

    public exec(params?: string[], message?: any): string {
        var userTimed = message.mentions.users.first();
        let userList = TimedUserList.allTimedUsers;
        var foundUser: TimedUser;

        if(userTimed == null){
            return this.NO_USER_FOUND_MSG;
        } else {
            //check all timed users for the named user
            for(var i = 0; i < userList.length; i++) {
                //if the named user is timed, save him for use in the function
                if(userList[i].getUsername() === userTimed.username) {
                    foundUser = userList[i];
                }
            }
            //if that user is not found
            if(foundUser == null) {
                return this.NOT_TIMED_MSG;
            }

            //otherwise print the user's time
            else {
                foundUser.setEndTime(new Date());
                let finalTime = foundUser.calculateTime();
                if (finalTime.seconds === 0) {
                    return ('Stop spamming ' + finalTime.seconds + ' would never be back that fast');
                } else if (finalTime.minutes === 0) {
                    return (foundUser.getUsername() + ' has been AFK for ' + finalTime.seconds + ' seconds');
                } else if (finalTime.hours === 0 && finalTime.minutes < 10) {
                    return (foundUser.getUsername() + ' has been AFK for ' + finalTime.minutes + ' minutes and ' + finalTime.seconds + ' seconds');
                } else if (finalTime.hours === 0 && finalTime.minutes >= 10) {
                    return ('<:10minutes:267176892954574848> ' + foundUser.getUsername() + ' has been AFK for ' + finalTime.minutes + ' minutes and ' + finalTime.seconds + ' seconds <:10minutes:267176892954574848>');
                } else if (finalTime.days === 0) {
                    return ('<:10minutes:267176892954574848> ' + foundUser.getUsername() + ' has been AFK for ' + finalTime.hours + ' hours, ' + finalTime.minutes + ' minutes and ' + finalTime.seconds + ' seconds <:10minutes:267176892954574848>');
                } else {
                    return ('<:10minutes:267176892954574848> ' + foundUser.getUsername() + ' has been AFK for ' + finalTime.days + ' days, ' + finalTime.hours + ' hours, ' + finalTime.minutes + ' minutes and ' + finalTime.seconds + ' seconds <:10minutes:267176892954574848>');
                }
            }
        }
    }
}