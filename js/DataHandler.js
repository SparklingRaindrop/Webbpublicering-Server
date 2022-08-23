const knex = require('../knex/knex.js');

class DataHandler {
    /* User */
    getAllUsers() {
        return knex.select('*').from('User');
    }

    getUserBy(params) {
        const key = Object.keys(params)[0];
        const value = Object.values(params)[0];
        return knex
            .select('User.*')
            .select('Room.name')
            .as('current_room')
            .from('User')
            .innerJoin(
                'Room',
                'User.current_room_id',
                '=',
                'Room.id'
            )
            .where(`User.${key}`, value)
            .first();
    }

    async addNewUser(newUser) {
        return knex('User').insert(newUser, ['id', 'name', 'current_room_id']);
    }

    removeUserBy(params) {
        return knex('User').where(params).del();
    }

    moveRoom(params) {
        const {id, newRoomId} = params;

        return knex('User').where({
            id: id
        }).update({
            current_room_id: newRoomId
        });
    }

    updateUserId(newId, userName) {
        return knex('User')
            .where({
                name: userName
            })
            .update({
                id: newId
            });
    }

    /* Room */
    async createNewRoom(newRoom) {
        return knex('Room').insert(newRoom, ['id', 'name']);
    }

    // Pass either {id: id} or {name: name}
    getRoomBy(params) {
        return knex('Room').select('*').first().where(params);
    }

    getAllRoom() {
        return knex.select('*').from('Room');
    }

    getMembersByRoomId(id) {
        return knex('User').select('*').where({
            current_room_id: id
        });
    }

    removeRoomById(id) {
        return knex('Room').where({
            id: id
        }).del();
    }

    /* Message */
    addMessage(newMessage) {
        const hasReceiver = newMessage.receiver !== undefined;

        return knex('Message').insert({
            ...newMessage,
            receiver: hasReceiver ? receiver : '',
        });
    }

    // params = { room_id or sender & receiver }
    getMessagesBy(params) {
        return knex('Message').select('*').where(params);
    }



    // TODO DELETE later
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