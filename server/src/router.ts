const { parse } = require('url');
interface IRoute {
    method: string;
    url: any;
    handler: any;
}

module.exports = class Router {
    routes: IRoute[];

    constructor() {
        this.routes = [];
    }

    add(method: string, url: RegExp, handler: any) {
        this.routes.push({ method, url, handler })
    }

    resolve(context: any, request: any) {
        let path = parse(request.url).pathname;

        for (const { method, url, handler } of this.routes) {
            let match = url.exec(path)

            if (!match || request.method != method) {
                continue;
            }
            let urlParts = match.slice(1).map(decodeURIComponent);
            return handler(context, ...urlParts, request)
        }

        return null;
    }
}

