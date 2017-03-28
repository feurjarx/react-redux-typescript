import * as React from "react";
import { Slider } from 'material-ui';
import SyntaxService from "../../services/syntax"
import {Syntax} from "../../../typings/syntax";
import "./info-slider.css";

import WordData = Syntax.WordData;
import e = require("express");

export interface InfoSliderProps {
    syntax?: WordData;
    label?: string;
    name?: string;
    max?: number;
    min?: number;
    step?: number;
    defaultValue?:number;
    shortSyntax?:string;
    disabled?: boolean;
    onChange?(v: number, name?: string);
}

export default class InfoSlider extends React.Component<InfoSliderProps, any> {

    static defaultProps = {
        max: 100,
        min: 0,
        step: 1,
        name: null
    };

    constructor(props) {
        super();

        this.state = {
            value: props.defaultValue || 1,
        };
    }

    handleChangeSlider = (event, value) => {
        const {target} = event;
        if (target.closest('[value]')) {

            const nameableElem = target
                .closest('[value]')
                .querySelector('[name]');

            this.setState({value}, () => {

                // ovet fragile
                const {name} = nameableElem;

                const {onChange} = this.props;
                if (onChange) {
                    onChange(value, name);
                }
            });
        }
    };

    render() {

        const {syntax, name, min, step, max, shortSyntax} = this.props;

        let {label = '', disabled} = this.props;
        if (label) {
            label += ': ';
        }

        let {value} = this.state;
        if (value < min) {
            value = min;
        }

        if (value > max) {
            value = max;
        }

        let info: string;
        if (shortSyntax || shortSyntax === '') {
            info = shortSyntax;
        } else {
            info = SyntaxService.getNormalizedNounByValue(value, syntax);
        }

        return (
            <div className="flex-column">
                <p className="info-slider-label">
                    <span>{ label }</span>
                    <span>{ value } { info }</span>
                </p>
                <Slider
                    disabled={disabled}
                    name={ name }
                    sliderStyle={{margin: 0}}
                    value={ value }
                    onChange={ this.handleChangeSlider }
                    min={min}
                    step={step}
                    max={max}
                />
            </div>
        )
    }
}
