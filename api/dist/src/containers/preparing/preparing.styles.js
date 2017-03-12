"use strict";
var reactcss_1 = require("reactcss");
var styles = reactcss_1.default({
    default: {
        dialog: {
            content: {
                width: 'calc(100% / 2)'
            },
            body: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            },
            title: {
                textAlign: 'center'
            }
        }
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = styles;
