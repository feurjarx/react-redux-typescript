import * as React from "react";
import "./data-struct.css";

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField'
import AutoComplete from 'material-ui/AutoComplete'

import {DesignReplicator} from '../../components/design-replicator/DesignReplicator';

class DataStruct extends React.Component<any, any> {

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

        const tablesReplicatorStyle = {
            replica: {
                paddingBottom: '10px'
            },
            replicator: {
                display: 'flex',
                justifyContent: 'center'
            }
        };

        const fieldsReplicatorStyle = {
            replica: {
                paddingBottom: '10px'
            }
        };

        return (

            <DesignReplicator styles={ tablesReplicatorStyle }>
                <Paper className="data-struct-table-paper">
                    <TextField floatingLabelText="Введите имя таблицы" />

                    <DesignReplicator styles={ fieldsReplicatorStyle }>
                        <Paper className="data-struct-fields-paper">
                            <TextField floatingLabelText="Введите имя поля" />
                            <AutoComplete
                                openOnFocus={true}
                                filter={AutoComplete.noFilter}
                                floatingLabelText="Укажите тип данных"
                                dataSource={typesSource}
                            />
                        </Paper>
                    </DesignReplicator>
                </Paper>
            </DesignReplicator>
        )
    }
}

export default DataStruct;