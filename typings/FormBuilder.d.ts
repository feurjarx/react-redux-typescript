export declare const FB: {
    make(qSelector: string, options: Array<FormBuilderOptions>): FormBuilder;
};

export interface FormBuilderOptions {
    selector: string;
    getter(): any;
    setter(v: any): void;
}

export interface FormBuilder {
    create(params: any);
    data: any;
    readDataByFieldName(name: string): any;
    readDataByFieldSelector(qSelector: string): any;
    clear();
}