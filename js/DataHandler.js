const db = require('../config/database');

class DataHandler {
    /* User */
    getAllUsers() {
        return new Promise(function(resolve, reject) {
            db.all(`SELECT * FROM User`, (error, row) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'getAllUsers',
                    });
                }
                resolve(row);
            });
        });
    }

    getUserBy(params) {
        const { targets, parameters } = this.generateParams(params);
        const query = 'SELECT User.*, Room.name AS current_room FROM User ' +
            `INNER JOIN Room ON User.current_room_id = Room.id WHERE User${'.' + targets}`;

        return new Promise(function(resolve, reject) {
            db.get(query, parameters, (error, row) => {
                if (error) {
                    reject({
                        error: error.message,
                        function: 'getUserBy',
                    });
                }
                resolve(row);
            });
        });
    }

    async addNewUser(newUser) {
        const { parameters } = this.generateParams(newUser);
        const query = 
            'INSERT INTO User (id, name, current_room_id) ' +
            'VALUES ($id, $name, $current_room_id);';
    
        return new Promise ((resolve, reject) => {
            db.run(query, parameters, (error) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'addNewUser1',
                    });
                }
                resolve();
            });
        }).then(() =>  {
            return new Promise(function(resolve, reject) {
                db.get(`SELECT User.*, Room.name AS current_room FROM User INNER JOIN Room ON Room.id = current_room_id WHERE User.id = $id`, {$id: newUser.id}, (error, row) => {
                    if (error) {
                        console.error(error.message);
                        reject({
                            error: error.message,
                            function: 'addNewUser2',
                        });
                    }
                    resolve(row);
                });
            });
        });
    }

    removeUserBy(params) {
        const { targets, parameters } = this.generateParams(params);
        const query = `Delete FROM User WHERE ${targets}`;

        return new Promise(function(resolve, reject) {
            db.run(query, parameters, (error, row) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'removeUserBy',
                    });
                }
                resolve(row);
            });
        });
    }

    moveRoom(params) {
        const {id, newRoomId} = params;
        const query = 
            'UPDATE User SET current_room_id = $current_room_id WHERE id = $id;'

        return new Promise ((resolve, reject) => {
            db.run(query, {
                $id: id,
                $current_room_id: newRoomId
            }, (error) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'moveRoom',
                    });
                }
                resolve();
            });
        });
    }

    updateUserId(newId, userName) {
        const query = 
            'UPDATE User SET id = $id WHERE name = $name;'

        return new Promise ((resolve, reject) => {
            db.run(query, {
                $id: newId,
                $name: userName,
            }, (error) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'updateUserId',
                    });
                }
                resolve();
            });
        });
    }

    /* Room */
    async createNewRoom(newRoom) {
        const {parameters} = this.generateParams(newRoom);
        const query = 
            `INSERT INTO Room (name${newRoom.password ? ', password' : ''}) ` +
            `VALUES($name${newRoom.password ? ', $password' : ''});`;
            //    `VALUES(name = 'Test', password = 'password');`;
    
        return new Promise ((resolve, reject) => {
            db.run(query, parameters, (error) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'createNewRoom1',
                    });
                }
                resolve();
            });
        }).then(() =>  {
            return new Promise(function(resolve, reject) {
                db.get(`SELECT * FROM Room WHERE name = $newRoomName;`,{
                    $newRoomName: newRoom.name
                }, (error, row) => {
                    if (error) {
                        console.error(error.message);
                        reject({
                            error: error.message,
                            function: 'createNewRoom2',
                        });
                    }
                    resolve(row);
                });
            });
        });
    }

    // Pass either {id: id} or {name: name}
    getRoomBy(params) {
        const {targets, parameters} = this.generateParams(params);
        return new Promise(function(resolve, reject) {
            db.get(`SELECT * FROM Room WHERE ${targets}`, parameters, (error, row) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'getRoomBy',
                    });
                }
                resolve(row);
            });
        });
    }

    getAllRoom() {
        const query = `SELECT id, name, ` +
            'CASE WHEN password IS NULL THEN 0 ELSE 1 END AS password FROM Room;'
        return new Promise(function(resolve, reject) {
            db.all(query, (error, row) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'getAllRoom',
                    });
                }
                resolve(row);
            });
        });
    }

    getMembersByRoomId(id) {
        return new Promise(function(resolve, reject) {
            db.all(`SELECT * FROM User WHERE current_room_id = $id`,{
                $id: id
            }, (error, row) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'getMembersByRoomId',
                    });
                }
                resolve(row);
            });
        });
    }

    removeRoomById(id) {
        return new Promise(function(resolve, reject) {
            db.run(`Delete FROM Room WHERE id = $id`, {
                $id: id
            }, (error, row) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'removeRoomById',
                    });
                }
                resolve();
            });
        });
    }

    /* Message */
    addMessage(newMessage) {
        const hasReceiver = newMessage.receiver !== undefined;
        const { parameters } = this.generateParams(newMessage);
        const query = 
            `INSERT INTO Message (sender, sender_name, room_id, content, timestamp${hasReceiver ? ', receiver' : ''}) ` +
            `VALUES ($sender, $sender_name, $room_id, $content, $timestamp${hasReceiver ? ', $receiver' : ''});`;

        return new Promise ((resolve, reject) => {
            db.run(query, parameters, (error) => {
                if (error) {
                    console.error(error.message);
                    reject({
                        error: error.message,
                        function: 'addMessage',
                    });
                }
                resolve();
            });
        });
    }
    // params = { room_id or sender & receiver }
    getMessagesBy(params) {
        const { targets, parameters } = this.generateParams(params);
        const query = `SELECT * FROM Message WHERE ${targets}`;

        return new Promise(function(resolve, reject) {
            db.all(query, parameters, (error, row) => {
                if (error) {
                    reject({
                        error: error.message,
                        function: 'getUserBy',
                    });
                }
                resolve(row);
            });
        });
    }

    generateParams(newDataObj) {
        const targets = Object.keys(newDataObj).reduce((result, key) => {
            if (newDataObj[key] !== undefined) {
                result += `${result !== '' ? ', ' : ''}${key} = $${key}`;
            }
            return result;
        }, '');
    
        const parameters = {...newDataObj};
        for (const property in newDataObj) {
            if (newDataObj[property]) {
                parameters[`$${property}`] = newDataObj[property];
            }
            delete parameters[property];
        }
    
        return {
            targets,
            parameters
        };
    }
}


module.exports = DataHandler;