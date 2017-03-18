import * as React from "react";
import "./partitions-settings-step.css";

import styles from "./partitions-settings-step.style";

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';

import {DesignReplicator} from '../../design-replicator/DesignReplicator';

import Range from "../../range-field/RangeField";
import MultiCheckboxesField from "../../multi-checkboxes-field/MultiCheckboxesField";

class PartitionsSettingsStep extends React.Component<any, any> {
    constructor() {
        super();
    }

    render() {

        const items = [{
            text: 'Сервер А',
            value: 2
        }, {
            text: 'Сервер Б',
            value: 3
        }, {
            text: 'Сервер C',
            value: 4
        }];

        return (

            <DesignReplicator styles={styles}>
                <div>
                    <Paper className="partitions-settings-paper">
                        <AutoComplete
                            openOnFocus={true}
                            filter={AutoComplete.noFilter}
                            floatingLabelText="Укажите поле таблицы"
                            dataSource={[]}
                        />

                        {/*<Range />*/}

                        <TextField
                            floatingLabelFixed={true}
                            floatingLabelText="Критерия сегмента"
                            hintText="Например, $ > 0 and $ <> 1"
                        />

                        <MultiCheckboxesField labelText="Укажите сервера" items={items}/>


                    </Paper>
                </div>

            </DesignReplicator>
        )
    }
}

export default PartitionsSettingsStep;