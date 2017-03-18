import * as React from "react";

import "./hardware-settings-step.css"
import styles from "./hardware-settings-step.style";

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

import {DesignReplicator} from '../../design-replicator/DesignReplicator';
import InfoSlider from "../../info-slider/InfoSlider";

class HardwareSettingsStep extends React.Component<any, any> {
    constructor() {
        super();
    }

    render() {

        return (
            <DesignReplicator styles={styles}>
                <div>
                    <Paper className="hardware-settings-paper">
                        <TextField floatingLabelText="Введите имя сервера" />

                        <InfoSlider
                            label="Доступное пространство"
                            name=""
                            shortSyntax='Гб'
                            min={2}
                            max={2000}
                            step={1}
                        />

                        <InfoSlider
                            label="Кол-во репликаций"
                            name=""
                            shortSyntax=""
                            max={3}
                            step={1}
                        />

                        <InfoSlider
                            label="Вероятность отказа"
                            name=""
                            shortSyntax="%"
                            min={0.1}
                            max={100}
                            step={0.1}
                        />

                        <Checkbox
                            label="Master"
                            labelStyle={{color: 'rgba(0, 0, 0, 0.298039)'}}
                        />

                    </Paper>
                </div>
            </DesignReplicator>

        )
    }
}

export default HardwareSettingsStep;