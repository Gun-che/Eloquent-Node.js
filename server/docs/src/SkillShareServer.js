var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { Router } = require("./router");
const { createServer } = require('http');
const ecstatic = require('ecstatic');
const { readStream } = require('./readStream');
const defaultHeaders = { "Content-Type": "text/plain" };
const talkPath = /^\/talks\/([^\/]+)$/;
const router = new Router();
module.exports = class SkillShareServer {
    constructor(talks) {
        this.talks = talks;
        this.version = 0;
        this.waiting = [];
        let fileServer = ecstatic({ root: "./public" });
        this.server = createServer((request, response) => {
            let resolved = router.resolve(this, request);
            if (resolved) {
                resolved.catch((error) => {
                    if (error.status === null) {
                        return error;
                    }
                    return {
                        body: String(error),
                        status: 500,
                    };
                }).then(({ body, status = 200, headers = defaultHeaders, }) => {
                    response.writeHead(status, headers);
                    response.end(body);
                });
            }
            else {
                fileServer(request, response);
            }
        });
    }
    start(port) {
        this.server.listen(port);
    }
    stop() {
        this.server.close();
    }
    talkResponse() {
        let talks = [];
        for (let title of Object.keys(this.talks)) {
            talks.push(this.talks[title]);
        }
        return {
            body: JSON.stringify(talks),
            headers: {
                'Content-Type': 'application/json',
                'ETag': `"${this.version}"`
            }
        };
    }
    ;
    waitForChange(time) {
        return new Promise(resolve => {
            this.waiting.push(resolve);
            setTimeout(() => {
                if (!this.waiting.includes(resolve))
                    return;
                this.waiting = this.waiting.filter(r => r != resolve);
                resolve({ status: 304 });
            }, time * 1000);
        });
    }
    ;
    updated() {
        this.version++;
        let response = this.talkResponse();
        this.waiting.forEach(resolve => resolve(response));
        this.waiting = [];
    }
    ;
};
router.add("GET", talkPath, (server, title) => __awaiter(this, void 0, void 0, function* () {
    if (title in server.talks) {
        return {
            body: JSON.stringify(server.talks[title]),
            headers: {
                "Conntent-Type": "application/json"
            }
        };
    }
    else {
        return {
            status: 404,
            body: `No talks '${title}' found`
        };
    }
}));
router.add('DELETE', talkPath, (server, title) => __awaiter(this, void 0, void 0, function* () {
    if (title in server.talks) {
        delete server.talks[title];
        server.updated();
    }
    return { status: 204 };
}));
router.add("PUT", talkPath, (server, title, request) => __awaiter(this, void 0, void 0, function* () {
    let requestBody = yield readStream(request);
    let talk;
    try {
        talk = JSON.parse(requestBody);
    }
    catch (_) {
        return { status: 400, body: 'Invalid JSON' };
    }
    if (!talk ||
        typeof talk.presenter != 'string' ||
        typeof talk.summary != 'string') {
        return { status: 400, body: 'Bad talk data' };
    }
    server.talks[title] = {
        title,
        presenter: talk.presenter,
        summary: talk.summary,
        comments: [],
    };
    server.updated();
    return { status: 204 };
}));
router.add('GET', /^\/talks$/, (server, request) => __awaiter(this, void 0, void 0, function* () {
    let tag = /"(.*)"/.exec(request.headers['If-None-Match']);
    let wait = /\bwait=(\d+)/.exec(request.headers['prefer']);
    if (!tag || tag[1] != server.version) {
        return server.talkResponse();
    }
    else if (!wait) {
        return { status: 304 };
    }
    else {
        return server.waitForChanges(Number(wait[1]));
    }
}));
//# sourceMappingURL=SkillShareServer.js.map