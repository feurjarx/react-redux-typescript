import {Observable} from 'rxjs/Observable';
import {prettylog} from "../helpers/index";

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

        watcher.subscribe(v => insideData = { ...insideData, ...v });

        Object.defineProperty(this, 'data', {
            get() {
                // return {...insideData} // not uncomment!
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


        prettylog(data.servers);
    }
}

export default FormDataService;