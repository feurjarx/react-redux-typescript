import * as React from "react";

const syntaxConfig = require('../../configs/syntax.json');
import InfoSlider from '../../components/info-slider/InfoSlider';
import TextField from 'material-ui/TextField'

const RequestsSettingsStep = (props) => {

    const {
        handleSlidersChange,
        handleFormChange,
        requestTimeLimit,
        requestsLimit,
        nClients,
        nServers
    } = props;

    return (

        <form onChange={ handleFormChange } id="life-data-form">
            <div id="clients-settings-block" className="v-internal-interval-10">

                <InfoSlider
                    name="nClients"
                    syntax={syntaxConfig['client']}
                    min={1}
                    defaultValue={ nClients }
                    onChange={ handleSlidersChange }
                />

                <InfoSlider
                    label="Лимит клиента"
                    name="requestsLimit"
                    syntax={syntaxConfig['request']}
                    min={1}
                    defaultValue={ requestsLimit }
                    onChange={ handleSlidersChange }
                />

                <InfoSlider
                    label="Лимит сложности запроса"
                    name="requestTimeLimit"
                    shortSyntax=""
                    min={1}
                    max={10000}
                    defaultValue={ requestTimeLimit }
                    onChange={ handleSlidersChange }
                />
            </div>

            <div id="servers-settings-block">

                <TextField
                    multiLine={true}
                    floatingLabelText="SQL-запросы:"
                    rows={2}
                    defaultValue={
                        `
                        SELECT * FROM user AS u WHERE u.id > 1000
                        <br>
                        SELECT * FROM phone AS p WHERE p.tel like %+7%
                        `
                    }
                />

                {/*<InfoSlider
                    name="nServers"
                    syntax={syntaxConfig['server']}
                    min={1}
                    max={10}
                    defaultValue={ nServers }
                    onChange={ handleSlidersChange }
                />*/}

            </div>
        </form>
    )
};

export default RequestsSettingsStep;