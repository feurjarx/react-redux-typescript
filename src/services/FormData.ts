import {Observable} from 'rxjs/Observable';

class FormDataService {

    watcher: Observable<any>;
    setData = null;
    data: any;

    constructor(defaultData = null) {
        let {watcher} = this;

        watcher = new Observable(observer => {
            this.setData = v => observer.next(v);
        });

        let insideData = defaultData;

        watcher.subscribe(v => insideData = v);

        Object.defineProperty(this, 'data', {
            get() {
                return insideData;
            },
            configurable: false
        });
    }

    setDataByPath(path: string, value: any) {

        const { data } = this;

        let targetParent = data;

        const pathParts = path.split('.');
        const targetKey = pathParts.pop();
        pathParts.forEach(key => {
            if (!targetParent[key]) {
                targetParent[key] = {};
            }
            targetParent = targetParent[key];
        });

        targetParent[targetKey] = value;
    }

    getIncrementedPath(path, hint = null) {

        const pathParts = path.split('.');
        pathParts.forEach((v, i) => {

            if (hint) {

                const prev = pathParts[i - 1];

                if (prev === hint && /^\d+$/.test(v)) {
                    pathParts[i]++;
                    return false;
                }

            } else {
                if (/^\d+$/.test(v)) {
                    pathParts[i]++;
                }
            }
        });

        return pathParts.join('.');
    }

    getPathByValue(path, value, hint = null) {

        const pathParts = path.split('.');
        pathParts.forEach((v, i) => {

            if (hint) {

                const prev = pathParts[i - 1];

                if (prev === hint && /^\d+$/.test(v)) {
                    pathParts[i] = value;
                    return false;
                }

            } else {
                if (/^\d+$/.test(v)) {
                    pathParts[i] = value;
                }
            }
        });

        return pathParts.join('.');
    }

    getDecrementedPath(path) {

        const pathParts = path.split('.');
        pathParts.forEach((v, i) => {
            if (/^\d+$/.test(v)) {
                pathParts[i]--;
            }
        });

        return pathParts.join('.');
    }

    private eachPath(path, fn) {
        const pathParts = path.split('.');
        pathParts.forEach((v, i) => fn);
    }
}

export default FormDataService;