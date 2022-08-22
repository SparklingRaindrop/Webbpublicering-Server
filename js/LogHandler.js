const fs = require('fs/promises');

function logHandler(socket, next) {
    const timeStamp = generateTimestamp();

    socket.onAny((event, data) => {
        let body;
        
        if (event === 'msg:send') {
            const { content, receiver } = data;
            body = `"${content}" to ${receiver ?
                `ID: ${receiver}` :
                Array.from(socket.rooms)[1]
            }`;
            write(body, socket.id, {type: 'message'});
            return;
        }

        switch(event) {
            case 'user:join_room':
                body = `joined to "${data.name}"`;
                break;
            case 'room:create':
                body = `created a room "${data.name}" ` +
                    `${data.password ? 'with' : 'without'} password`;
                break;
            case 'room:delete':
                body = `deleted a room "${data.name}"`;
                break;
            case 'user:ready':
                body = `set username as "${data.userName}"`;
                
        }
        const log = `[${timeStamp}] "${event}" ${body ? `| ${body}` : ''} | By "${socket.id}"\n`;
        write(log);
    });
    next();
}

function generateTimestamp() {
    return new Date().toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'CET',
    });
}

function write(data, id, option) {
    try {
        if (option) {
            if (option.type === 'error') {
                const log = `[${generateTimestamp()}] | ${data.error} | ${data.function} | ID: ${id}\n`;
                fs.writeFile('./logs/error.log', log, {flag: 'a'});
            } else if (option.type === 'message') {
                const log = `[${generateTimestamp()}] | ${data} | By ${id}\n`;
                fs.writeFile('./logs/message.log', log, {flag: 'a'});
            }
        } else {
            fs.writeFile('./logs/system.log', data, {flag: 'a'});
        }
    } catch (err) {
        console.error('\x1b[43m%s\x1b[0m', err);
    }
}

module.exports = {
    logHandler,
    write,
}