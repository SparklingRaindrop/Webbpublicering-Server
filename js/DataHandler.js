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
            .select('User.*', 'Room.name AS current_room')
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
        return knex('Room').select('*').where(params).first();
    }

    getAllRoom() {
        return knex.select(
            'id',
            'name',
            knex.raw('CASE WHEN password IS NULL THEN 0 ELSE 1 END AS password')
            ).from('Room');
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
        return knex('Message').insert({
            ...newMessage,
            receiver: newMessage.receiver || '',
        }, ['content', 'sender', 'sender_name', 'timestamp']);
    }

    // params = { room_id or sender & receiver }
    getMessagesBy(params) {
        return knex('Message').select('*').where(params);
    }

}


module.exports = DataHandler;