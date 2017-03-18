import * as React from "react";
import "./data-struct-step.css";
import styles from "./data-struct-step.styles";
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField'
import AutoComplete from 'material-ui/AutoComplete'
import Checkbox from 'material-ui/Checkbox';


import {DesignReplicator} from '../../design-replicator/DesignReplicator';

class DataStructStep extends React.Component<any, any> {

    constructor() {
        super();

        this.state = {
            typesSource: [{
                text: 'Строковый',
                value: 'string'
            }, {
                text: 'Числовой',
                value: 'integer'
            }]
        }
    }

    render() {

        const { typesSource } = this.state;

        return (

            <DesignReplicator styles={ styles.tables }>
                <div>
                    <Paper className="data-struct-table-paper">
                        <TextField floatingLabelText="Введите имя таблицы" />

                        <DesignReplicator styles={ styles.fields }>
                            <Paper className="data-struct-fields-paper">
                                <TextField hintText="Введите имя поля" />
                                <AutoComplete
                                    openOnFocus={true}
                                    filter={AutoComplete.noFilter}
                                    hintText="Укажите тип данных"
                                    dataSource={typesSource}
                                />
                                <Checkbox
                                    label="Это индексное поле"
                                    labelStyle={{color: 'rgba(0, 0, 0, 0.298039)'}}
                                />
                            </Paper>
                        </DesignReplicator>
                    </Paper>
                </div>
            </DesignReplicator>
        )
    }
}

export default DataStructStep;