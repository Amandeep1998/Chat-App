const users = [];

const addUser = ({id, username, room}) => {
    //Clean the Data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate the data
    if(!username || !room) {
        return{
            error: 'Username and Room are required'
        }
    }

    //Check for existing User
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    //Validate Username
    if(existingUser) {
        return {
            error: 'Username is in Use!'
        }
    }

    //Store User
    const user = {id, username, room}
    users.push(user);
    return { user };
}

const removedUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removedUser,
    getUser,
    getUsersInRoom
}