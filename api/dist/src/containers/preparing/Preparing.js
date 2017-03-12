"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var React = require("react");
var socket = require('socket.io-client')('http://localhost:3003');
var syntaxConfig = require('./../../configs/syntax.json');
var material_ui_1 = require("material-ui");
var InfoSlider_1 = require("../../components/InfoSlider");
var preparing_styles_1 = require("./preparing.styles");
require("./preparing.css");
var events_1 = require("../../constants/events");
var react_redux_1 = require("react-redux");
var index_1 = require("../../actions/index");
var Expectant_1 = require("../../../api/src/models/clients/Expectant");
var Preparing = (function (_super) {
    __extends(Preparing, _super);
    function Preparing() {
        var _this = _super.call(this) || this;
        _this.state = {
            open: false,
            nClients: null,
            requestsLimit: null,
        };
        _this.handleOpen = function () {
            var open = true;
            _this.setState({ open: open });
        };
        _this.handleClose = function () {
            var open = false;
            _this.setState({ open: open });
        };
        _this.handleRunning = function () {
            if (_this.state) {
                var dispatch = _this.props.dispatch;
                dispatch(index_1.initialLifeData(_this.state));
                debugger;
                var clients = [];
                // *** bugaga start
                for (var i = 0; i < _this.state.nClients; i++) {
                    var client = new Expectant_1.default();
                    var requestsNumber = Math.round(Math.random() * _this.state.requestsLimit);
                    client.setRequestsNumber(requestsNumber);
                    clients.push(client);
                }
                // *** bugaga end
                socket.emit(events_1.EVENT_IO_LIFE, __assign({ state: _this.state }, clients));
                _this.handleClose();
            }
        };
        _this.receiveLifeResponse = function (data) {
            _this.props.dispatch(index_1.updateMonitorItem(data));
        };
        _this.handleFormChange = function (event) {
            var target = event.target;
            _this.setState((_a = {},
                _a[target.name] = target.value,
                _a));
            var _a;
        };
        _this.handleSlidersChange = function (v, name) {
            _this.setState((_a = {},
                _a[name] = v,
                _a));
            var _a;
        };
        // socket.on('connect', function () {});
        socket.on(events_1.EVENT_IO_LIFE, _this.receiveLifeResponse);
        return _this;
        // socket.on('disconnect', function () {});
    }
    Preparing.prototype.render = function () {
        var actions = [
            <material_ui_1.FlatButton label="Начать" primary={true} keyboardFocused={true} onTouchTap={this.handleRunning}/>,
            <material_ui_1.FlatButton label="Закрыть" onTouchTap={this.handleClose}/>
        ];
        return (<div>
                <material_ui_1.RaisedButton label="Запустить модель" primary={true} onTouchTap={this.handleOpen}/>
                <material_ui_1.Dialog title="Подготовка запуска" actions={actions} modal={false} open={this.state.open} onRequestClose={this.handleClose} contentStyle={preparing_styles_1.default.dialog.content} bodyStyle={preparing_styles_1.default.dialog.body} titleStyle={preparing_styles_1.default.dialog.title}>

                    <form onChange={this.handleFormChange} id="life-data-form">

                        <div id="clients-settings-block" className="v-internal-interval-10">

                            <InfoSlider_1.default name="nClients" syntax={syntaxConfig['client']} min={1} defaultValue={3} onChange={this.handleSlidersChange}/>

                            <InfoSlider_1.default label="Лимит клиента" name="requestsLimit" syntax={syntaxConfig['request']} min={1} onChange={this.handleSlidersChange}/>
                        </div>

                        <div id="servers-settings-block">
                            <InfoSlider_1.default name="nServers" syntax={syntaxConfig['server']} min={1} onChange={this.handleSlidersChange}/>
                        </div>
                    </form>
                </material_ui_1.Dialog>
            </div>);
    };
    return Preparing;
}(React.Component));
Preparing = __decorate([
    react_redux_1.connect()
], Preparing);
exports.Preparing = Preparing;
