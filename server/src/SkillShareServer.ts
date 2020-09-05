import { talkPath } from './consts';
import { Router } from "./router";

const { createServer } = require('http');

import ecstatic from 'ecstatic';
import { readStream } from './readStream';
import { resolve } from 'path';

const router = new Router();
const defaultHeaders = { "Content-Type": "text/plain" };

export class SkillShareServer {
    talks: string[];
    version: number;
    waiting: any[];
    server: any;

    constructor(talks: string[]) {
        this.talks = talks;
        this.version = 0;
        this.waiting = [];

        let fileServer = ecstatic({ root: "./public" });
        this.server = createServer((request: any, response: any) => {
            let resolved = router.resolve(this, request);

            if (resolved) {
                resolved.catch((error: { status?: any }) => {

                    if (error.status === null) {
                        return error;
                    }
                    return {
                        body: String(error),
                        status: 500,
                    }
                }).then(({
                    body,
                    status = 200,
                    headers = defaultHeaders,
                }) => {
                    response.writeHead(status, headers);
                    response.end(body);
                });

            } else {
                fileServer(request, response);
            }
        });
    }

    start(port: any) {
        this.server.listen(port);
    }

    stop() {
        this.server.close()
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
    };

    waitForChange(time: number) {
        return new Promise(resolve => {
            this.waiting.push(resolve);
            setTimeout(() => {
                if (!this.waiting.includes(resolve)) return;
                this.waiting = this.waiting.filter(r => r != resolve);
                resolve({ status: 304 });
            }, time * 1000);
        });
    };

    updated() {
        this.version++;
        let response = this.talkResponse();
        this.waiting.forEach(resolve => resolve(response));
        this.waiting = [];
    };
}

router.add("GET", talkPath, async (server, title) => {
    if (title in server.talks) {
        return {
            body: JSON.stringify(server.talks[title]),
            headers: {
                "Conntent-Type": "application/json"
            }
        }
    } else {

        return {
            status: 404,
            body: `No talks '${title}' found`
        };
    }
});

router.add('DELETE', talkPath, async (server, title) => {

    if (title in server.talks) {
        delete server.talks[title];
        server.updated();
    }

    return { status: 204 };
});

router.add("PUT", talkPath, async (server, title, request) => {
    let requestBody = await readStream(request) as string;
    let talk: any;
    try { talk = JSON.parse(requestBody); }
    catch (_) { return { status: 400, body: 'Invalid JSON' }; }

    if (!talk ||
        typeof talk.presenter != 'string' ||
        typeof talk.summary != 'string'
    ) {
        return { status: 400, body: 'Bad talk data' };
    }
    server.talks[title] = {
        title,
        presenter: talk.presenter,
        summary: talk.summary,
        comments: [],
    }
    server.updated();
    return { status: 204 }
});

router.add('GET', /^\/talks$/, async (server, request) => {
    let tag = /"(.*)"/.exec(request.headers['if-none-match']);
    let wait = /\bwait=(\d+)/.exec(request.headers['prefer']);

    if (!tag || tag[1] != server.version) {
        return server.talkResponse();

    } else if (!wait) {
        return { status: 304 };

    } else {
        return server.waitForChanges(Number(wait[1]));
    }
});

