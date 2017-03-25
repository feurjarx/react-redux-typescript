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

    removeArrayElem(index: number, hint: string, path: string) {
        const { data } = this;

        let targetParent = data;

        const pathParts = path.split('.');
        pathParts.every(key => {
            targetParent = targetParent[key];
            return  key !== hint;
        });

        delete targetParent[index];
    }

    setDataByPath(path: string, value: any) {
        const { data } = this;

        let targetParent = data;

        const pathParts = path.split('.');
        const targetKey = pathParts.pop();
        pathParts.forEach(key => {
            if (!targetParent[key]) {
                if (/^\d+$/.test(key)) {
                    targetParent[key] = {};
                } else {
                    targetParent[key] = [];
                }
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

    normalizeElementPath(type, index, targetElem) {
        [].map.call(targetElem.querySelectorAll('[name]'), elem => {
            if (elem.name) {
                elem.name = this.getPathByIndex(elem.name, index, type);
            }
        });
    }

    getPathByIndex(path, index, hint = null) {

        const pathParts = path.split('.');
        pathParts.forEach((v, i) => {

            if (hint) {

                const prev = pathParts[i - 1];

                if (prev === hint && /^\d+$/.test(v)) {
                    pathParts[i] = index;
                    return false;
                }

            } else {
                if (/^\d+$/.test(v)) {
                    pathParts[i] = index;
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